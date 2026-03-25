using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using KandoTest;

var builder = WebApplication.CreateBuilder(args);

// Rate Limiter beállítása (IP alapú)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext =>
    {
        // IP cím alapján particionálunk (vagy 'global' ha nem elérhető)
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "global";

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: clientIp,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 60,           // 60 kérés
                Window = TimeSpan.FromMinutes(1) // percenként
            });
    });
});

// CORS – GitHub Pages + helyi fejlesztés
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(
        "https://sandornefr.github.io",
        "https://sandorpeteer.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000"
    ).AllowAnyHeader().AllowAnyMethod()
));

var dbPath = builder.Configuration["DB_PATH"] ?? "kando.db";
var db = new Database(dbPath);
builder.Services.AddSingleton(db);

var app = builder.Build();
app.UseCors();
app.UseRateLimiter(); // Ráhelyezzük a rate limitert a pipeline-ra

// Adatbázis inicializálás
db.Initialize();

// Környezeti változók
var secretKey    = app.Configuration["SECRET_KEY"]    ?? "kando-secret-change-in-production!";
var adminEnvUser = app.Configuration["ADMIN_USERNAME"] ?? "admin";
var adminEnvPass = app.Configuration["ADMIN_PASSWORD"] ?? "kandooktato";

// Admin létrehozása/frissítése – mindig az env változóból (jelszó reset lehetséges)
db.UpsertTeacher(adminEnvUser, BCrypt.Net.BCrypt.HashPassword(adminEnvPass));

// Alapértelmezett oktató felhasználó seed (Railway restart után is megmarad)
// Env változók: SEED_OKTATO_EMAIL, SEED_OKTATO_JELSZO, SEED_OKTATO_VEZETEK, SEED_OKTATO_KERESZT
var seedEmail    = app.Configuration["SEED_OKTATO_EMAIL"];
var seedJelszo   = app.Configuration["SEED_OKTATO_JELSZO"];
var seedVezetek  = app.Configuration["SEED_OKTATO_VEZETEK"]  ?? "Oktató";
var seedKeresztnev = app.Configuration["SEED_OKTATO_KERESZT"] ?? "Alapértelmezett";
if (!string.IsNullOrEmpty(seedEmail) && !string.IsNullOrEmpty(seedJelszo))
{
    db.UpsertUser(seedVezetek, seedKeresztnev, seedEmail,
        BCrypt.Net.BCrypt.HashPassword(seedJelszo), "oktato");
}

// ── Token kezelés ─────────────────────────────────────────────────────────────

string CreateToken(string payloadData)
{
    var payload = $"{payloadData}:{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
    var sig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
    return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{payload}.{sig}"));
}

(bool Valid, string Payload) InspectToken(HttpContext ctx)
{
    var auth = ctx.Request.Headers["Authorization"].FirstOrDefault();
    if (auth == null || !auth.StartsWith("Bearer ")) return (false, "");
    try
    {
        var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(auth[7..]));
        var dot = decoded.LastIndexOf('.');
        if (dot == -1) return (false, "");
        var payload = decoded[..dot];
        var sig = decoded[(dot + 1)..];
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var expected = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        if (sig != expected) return (false, "");
        var parts = payload.Split(':');
        if (parts.Length < 2) return (false, "");
        var ts = long.Parse(parts[^1]);
        if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() - ts >= 86400) return (false, ""); // 24 óra
        return (true, payload);
    }
    catch { return (false, ""); }
}

bool ValidateToken(HttpContext ctx) => InspectToken(ctx).Valid;

bool ValidateOktato(HttpContext ctx)
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return false;
    return !payload.Contains('|') || payload.Contains("|oktato") || payload.Contains("|admin");
}

// Oktatói regisztrációs kód (env változóból)
var teacherCode = app.Configuration["TEACHER_CODE"];
if (string.IsNullOrEmpty(teacherCode))
{
    teacherCode = Guid.NewGuid().ToString("N")[..12];
    Console.WriteLine($"[SECURITY] No TEACHER_CODE found. Generated temporary code: {teacherCode}");
}

// Cloudflare Turnstile Secret (env: SECRET_SITE)
var turnstileSecret = app.Configuration["SECRET_SITE"];

// ── Végpontok ─────────────────────────────────────────────────────────────────

// Életjelzés
app.MapGet("/", () => Results.Ok(new { status = "Kandó Teszt Backend fut", version = "1.0" }));

// Bejelentkezés
app.MapPost("/api/auth/login", (LoginRequest req, Database db) =>
{
    var hash = db.GetPasswordHash(req.Username);
    if (hash == null || !BCrypt.Net.BCrypt.Verify(req.Password, hash))
        return Results.Unauthorized();
    var token = CreateToken(req.Username);
    return Results.Ok(new { success = true, token });
})
.RequireRateLimiting("auth");

// Konfiguráció lekérése (mindenki)
app.MapGet("/api/config", (Database db) =>
{
    var mode         = db.GetConfig("test_mode")     ?? "practice";
    var vizsgaKezdes = db.GetConfig("vizsga_kezdes") ?? "";
    var vizsgaVege   = db.GetConfig("vizsga_vege")   ?? "";
    return Results.Ok(new { test_mode = mode, vizsga_kezdes = vizsgaKezdes, vizsga_vege = vizsgaVege });
});

// Konfiguráció módosítása (csak admin)
app.MapPost("/api/config", (HttpContext ctx, ConfigRequest req, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
    db.SetConfig("test_mode", req.TestMode);
    if (req.VizsgaKezdes != null)
        db.SetConfig("vizsga_kezdes", req.VizsgaKezdes);
    if (req.VizsgaVege != null)
        db.SetConfig("vizsga_vege", req.VizsgaVege);
    return Results.Ok(new { success = true });
});

// Beadás mentése (diák)
app.MapPost("/api/submit", (SubmissionRequest req, Database db) =>
{
    var id = db.SaveSubmission(req);
    return Results.Ok(new { success = true, id });
});

// Beadások listája (admin) – szűrhető ?osztaly=9A&csoport=1&subject=python&mode=live
app.MapGet("/api/submissions", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var osztaly = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport = ctx.Request.Query["csoport"].FirstOrDefault();
    var subject = ctx.Request.Query["subject"].FirstOrDefault();
    var mode    = ctx.Request.Query["mode"].FirstOrDefault();
    var list = db.GetSubmissions(osztaly, csoport, subject, mode);
    return Results.Ok(list);
});

// Egy beadás részletei (admin)
app.MapGet("/api/submissions/{id:int}", (HttpContext ctx, int id, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var sub = db.GetSubmission(id);
    return sub != null ? Results.Ok(sub) : Results.NotFound();
});

// Egy beadás törlése (admin)
app.MapPatch("/api/submissions/{id:int}/scores", (HttpContext ctx, int id, UpdateScoresRequest req, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var ok = db.UpdateSubmissionScores(id, req.Scores, req.MaxScores, req.TotalScore, req.MaxTotal);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

app.MapDelete("/api/submissions/{id:int}", (HttpContext ctx, int id, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.DeleteSubmission(id);
    return Results.Ok(new { success = true });
});

// Tömeges törlés szűrő alapján (admin) – ?osztaly=&csoport=&subject=&mode=
app.MapDelete("/api/submissions", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var osztaly = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport = ctx.Request.Query["csoport"].FirstOrDefault();
    var subject = ctx.Request.Query["subject"].FirstOrDefault();
    var mode    = ctx.Request.Query["mode"].FirstOrDefault();
    var count   = db.DeleteSubmissions(osztaly, csoport, subject, mode);
    return Results.Ok(new { success = true, deleted = count });
});

// Statisztikák (admin/oktató)
app.MapGet("/api/stats", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetStats());
});

// Regisztráció (tanulók + oktatók)
app.MapPost("/api/auth/register", async (RegisterRequest req, Database db) =>
{
    // Email normalizálás és validálás
    var email = req.Email.ToLower().Trim();
    // Ha csak a username részt adták meg, kiegészítjük
    if (!email.Contains('@'))
        email = email + "@kkszki.hu";
    // Ha duplán írták be (@kkszki.hu@kkszki.hu)
    email = email.Replace("@kkszki.hu@kkszki.hu", "@kkszki.hu");
    if (!email.EndsWith("@kkszki.hu"))
        return Results.BadRequest(new { error = "Csak @kkszki.hu email cím fogadható el!" });

    if (string.IsNullOrWhiteSpace(req.Vezeteknev) || string.IsNullOrWhiteSpace(req.Keresztnev))
        return Results.BadRequest(new { error = "Kérlek add meg a nevedet!" });

    if (req.Jelszo.Length < 6)
        return Results.BadRequest(new { error = "A jelszó legalább 6 karakter legyen!" });

    if (req.Jelszo != req.JelszoMegerosites)
        return Results.BadRequest(new { error = "A két jelszó nem egyezik!" });

    // Cloudflare Turnstile ellenőrzés
    if (string.IsNullOrEmpty(req.CaptchaToken))
        return Results.BadRequest(new { error = "Kérlek igazold vissza, hogy nem vagy robot!" });

    if (!string.IsNullOrEmpty(turnstileSecret))
    {
        try
        {
            using var httpClient = new HttpClient();
            var verifyRes = await httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "secret", turnstileSecret },
                    { "response", req.CaptchaToken }
                }));

            if (!verifyRes.IsSuccessStatusCode)
                return Results.BadRequest(new { error = "Captcha ellenőrzési hiba!" });

            var verifyData = await verifyRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            if (!verifyData.GetProperty("success").GetBoolean())
                return Results.BadRequest(new { error = "Captcha érvénytelen. Próbáld újra!" });
        }
        catch { return Results.BadRequest(new { error = "Captcha szerver hiba!" }); }
    }

    if (req.Szerep == "oktato")
    {
        if (string.IsNullOrEmpty(teacherCode) || req.OktatoiKod != teacherCode)
            return Results.BadRequest(new { error = "Hibás oktatói kód!" });
    }

    var hash = BCrypt.Net.BCrypt.HashPassword(req.Jelszo);
    var normalizedReq = req with { Email = email };
    var success = db.RegisterUser(normalizedReq, hash);

    if (!success)
        return Results.BadRequest(new { error = "Ez az email cím már regisztrálva van!" });

    return Results.Ok(new { success = true, message = "Sikeres regisztráció!" });
})
.RequireRateLimiting("auth");

// Felhasználói bejelentkezés (tanulók + oktatók)
app.MapPost("/api/auth/user-login", (UserLoginRequest req, Database db) =>
{
    var email = req.Email.ToLower().Trim();
    if (!email.Contains('@')) email += "@kkszki.hu";

    var user = db.GetUserByEmail(email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(req.Jelszo, user.PasswordHash))
        return Results.Unauthorized();

    var token = CreateToken($"{email}|{user.Szerep}");
    return Results.Ok(new
    {
        success             = true,
        token,
        szerep              = user.Szerep,
        nev                 = $"{user.Vezeteknev} {user.Keresztnev}",
        email               = user.Email,
        evfolyam            = user.Evfolyam,
        osztaly             = user.Osztaly,
        csoport             = user.Csoport,
        mustChangePassword  = user.MustChangePassword
    });
})
.RequireRateLimiting("auth");

// Felhasználók listája (csak admin/oktató)
app.MapGet("/api/users", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetAllUsers());
});

// Felhasználó törlése admin/oktató által
app.MapDelete("/api/users/{email}", (HttpContext ctx, string email, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var deleted = db.DeleteUser(Uri.UnescapeDataString(email));
    return deleted ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Felhasználó jelszavának visszaállítása admin/oktató által
app.MapPost("/api/users/reset-password", (HttpContext ctx, ResetPasswordRequest req, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (req.NewPassword.Length < 6)
        return Results.BadRequest(new { error = "A jelszó legalább 6 karakter legyen!" });
    var hash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
    var ok = db.ResetUserPassword(req.Email, hash);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound(new { error = "Felhasználó nem található" });
});

// Fiók törlése (saját magát törli, jelszó megerősítéssel)
app.MapPost("/api/auth/delete-account", (DeleteAccountRequest req, Database db) =>
{
    var email = req.Email.ToLower().Trim();
    if (!email.Contains('@')) email += "@kkszki.hu";

    var user = db.GetUserByEmail(email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(req.Jelszo, user.PasswordHash))
        return Results.Unauthorized();

    var deleted = db.DeleteUser(email);
    return deleted ? Results.Ok(new { success = true }) : Results.NotFound();
})
.RequireRateLimiting("auth");

// Admin jelszó csere
app.MapPost("/api/auth/change-password", (HttpContext ctx,
    ChangePasswordRequest req, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
    var hash = db.GetPasswordHash(req.Username);
    if (hash == null || !BCrypt.Net.BCrypt.Verify(req.OldPassword, hash))
        return Results.BadRequest(new { error = "Hibás jelszó" });
    db.UpsertTeacher(req.Username, BCrypt.Net.BCrypt.HashPassword(req.NewPassword));
    return Results.Ok(new { success = true });
})
.RequireRateLimiting("auth");

// ── Task Sets ─────────────────────────────────────────────────────────────

// Feladatsorok listája (oktató/admin)
app.MapGet("/api/tasksets", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetTaskSets());
});

// Aktív feladatsor lekérése típus szerint (mindenki – a diák oldal használja)
// ?tipus=gyakorlo | live | vizsga  (alapértelmezett: vizsga)
app.MapGet("/api/tasksets/aktiv", (HttpContext ctx, Database db) =>
{
    var tipus = ctx.Request.Query["tipus"].FirstOrDefault() ?? "vizsga";
    var ts = db.GetActiveTaskSet(tipus);
    return ts != null ? Results.Ok(ts) : Results.NotFound();
});

// Egy feladatsor lekérése (oktató/admin)
app.MapGet("/api/tasksets/{id:int}", (HttpContext ctx, int id, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var ts = db.GetTaskSet(id);
    return ts != null ? Results.Ok(ts) : Results.NotFound();
});

// Feladatsor létrehozása (oktató/admin)
app.MapPost("/api/tasksets", (HttpContext ctx, TaskSetRequest req, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (string.IsNullOrWhiteSpace(req.Nev))
        return Results.BadRequest(new { error = "A feladatsor neve kötelező!" });
    var id = db.SaveTaskSet(req);
    return Results.Ok(new { success = true, id });
});

// Aktívvá tétel (oktató/admin)
app.MapPatch("/api/tasksets/{id:int}/aktiv", (HttpContext ctx, int id, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var ok = db.SetActiveTaskSet(id);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Törlés (oktató/admin)
app.MapDelete("/api/tasksets/{id:int}", (HttpContext ctx, int id, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var ok = db.DeleteTaskSet(id);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

// ── Progress / Gamification ────────────────────────────────────────────────

// Gyakorlás eredményének mentése (mindenki, email alapú)
app.MapPost("/api/progress", (ProgressRequest req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || req.MaxPont <= 0)
        return Results.BadRequest(new { error = "Érvénytelen adat" });
    db.SaveProgress(req);
    return Results.Ok(new { success = true });
});

// Saját haladás lekérése (saját token szükséges, vagy oktató)
app.MapGet("/api/progress/{email}", (string email, HttpContext ctx, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
    // Oktató mindent láthat, diák csak a sajátját
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    bool isOktato = payload.Contains("|oktato") || payload.Contains("|admin");
    if (!isOktato && !payload.StartsWith(decoded + "|") && !payload.StartsWith(decoded + ":"))
        return Results.Forbid();
    var progress = db.GetStudentProgress(decoded);
    return Results.Ok(progress);
});

// Összes tanuló összesítése (csak oktató/admin)
app.MapGet("/api/progress", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetAllProgressSummary());
});

// Leaderboard (oktató)
app.MapGet("/api/leaderboard", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var osztaly = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport = ctx.Request.Query["csoport"].FirstOrDefault();
    var mode    = ctx.Request.Query["mode"].FirstOrDefault();
    return Results.Ok(db.GetLeaderboard(osztaly, csoport, mode));
});

// Saját rang lekérése (tanuló, nyilvános)
app.MapGet("/api/leaderboard/rank/{email}", (string email, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
    return Results.Ok(db.GetStudentRank(decoded));
});

// Tanuló állapot lekérése / mentése (saját token vagy oktató szükséges)
app.MapGet("/api/user-state/{email}/{key}", (string email, string key, HttpContext ctx, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    bool isOktato = payload.Contains("|oktato") || payload.Contains("|admin");
    if (!isOktato && !payload.StartsWith(decoded + "|") && !payload.StartsWith(decoded + ":"))
        return Results.Forbid();
    var value = db.GetUserState(decoded, key);
    return Results.Ok(new { value });
});

app.MapPut("/api/user-state/{email}/{key}", async (string email, string key, HttpContext ctx, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    bool isOktato = payload.Contains("|oktato") || payload.Contains("|admin");
    if (!isOktato && !payload.StartsWith(decoded + "|") && !payload.StartsWith(decoded + ":"))
        return Results.Forbid();
    using var reader = new StreamReader(ctx.Request.Body);
    var body = await reader.ReadToEndAsync();
    var doc = System.Text.Json.JsonDocument.Parse(body);
    var value = doc.RootElement.GetProperty("value").GetString() ?? "";
    db.SetUserState(decoded, key, value);
    return Results.Ok(new { success = true });
});

// Saját jelszó módosítása (tanuló – ideiglenes jelszó után kötelező)
app.MapPost("/api/auth/change-own-password", (ChangeOwnPasswordRequest req, Database db) =>
{
    var email = req.Email.ToLower().Trim();
    if (!email.Contains('@')) email += "@kkszki.hu";
    var user = db.GetUserByEmail(email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(req.OldPassword, user.PasswordHash))
        return Results.Unauthorized();
    if (req.NewPassword.Length < 6)
        return Results.BadRequest(new { error = "A jelszó legalább 6 karakter legyen!" });
    var hash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
    db.UpdatePassword(email, hash);
    return Results.Ok(new { success = true });
})
.RequireRateLimiting("auth");

// ── Feedback / Task Ratings ────────────────────────────────────────────────

// Visszajelzés mentése (nem kell auth – értékelési adat, nem érzékeny)
app.MapPost("/api/feedback", (FeedbackRequest req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.FeladatNev))
        return Results.BadRequest(new { error = "Hiányzó adat" });
    if (req.Tipus != "vote" && req.Tipus != "reaction")
        return Results.BadRequest(new { error = "Érvénytelen tipus (vote vagy reaction)" });
    db.SaveRating(req.Email, req.FeladatNev, req.Tipus, req.Ertek);
    return Results.Ok(new { success = true });
});

// Visszajelzés statisztikák (csak oktató)
app.MapGet("/api/feedback/stats", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetRatingStats());
});

// Saját visszajelzések lekérése (email a tokenből jön, nem query paramból)
app.MapGet("/api/feedback/my", (HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    // Email kinyerése a tokenből (nem a query paraméterből – injection védelem)
    var parts = payload.Split(':');
    var emailPart = parts[0]; // format: "email|szerep:timestamp" or "username:timestamp"
    if (emailPart.Contains('|')) emailPart = emailPart.Split('|')[0];
    var list = db.GetMyRatings(emailPart);
    return Results.Ok(list.Select(x => new { feladatNev = x.FeladatNev, tipus = x.Tipus, ertek = x.Ertek }));
});

// ── Ötlet Láda ────────────────────────────────────────────────────────────

// Ötlet beküldése (bárki, email kötelező)
app.MapPost("/api/otlet", (IdeaRequest req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Nev) || string.IsNullOrWhiteSpace(req.Szoveg))
        return Results.BadRequest(new { error = "Hiányzó adat (email, nev, szoveg kötelező)" });
    // Képméret limit: ~1.5 MB base64
    if (req.KepBase64 != null && req.KepBase64.Length > 2_000_000)
        return Results.BadRequest(new { error = "A kép túl nagy (max ~1.5 MB)" });
    var id = db.SaveIdea(req.Email, req.Nev, req.Osztaly, req.Szoveg, req.KepBase64, req.Tipus ?? "otlet");
    return Results.Ok(new { success = true, id });
});

// Összes ötlet listázása (csak oktató)
app.MapGet("/api/otlet", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetIdeas());
});

// Kép lekérése (csak oktató)
app.MapGet("/api/otlet/{id}/kep", (int id, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var kep = db.GetIdeaKep(id);
    if (kep == null) return Results.NotFound();
    return Results.Ok(new { kepBase64 = kep });
});

// Ötlet státusz frissítése (csak oktató)
app.MapPatch("/api/otlet/{id}", (int id, IdeaUpdateRequest req, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var valid = new[] { "uj", "olvasott", "megvalasult" };
    if (!valid.Contains(req.Statusz)) return Results.BadRequest(new { error = "Érvénytelen státusz" });
    var ok = db.UpdateIdea(id, req.Statusz, req.AdminValasz, req.MegvalositvaSzoveg);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Ötlet törlése (csak oktató)
app.MapDelete("/api/otlet/{id}", (int id, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.DeleteIdea(id);
    return Results.Ok(new { success = true });
});

// Nyilvános megvalósult ötletek (mindenki láthatja)
app.MapGet("/api/otlet/public", (Database db) =>
    Results.Ok(db.GetPublicIdeas())
);

// Saját ötletek lekérése (bejelentkezett felhasználó)
app.MapGet("/api/otlet/my", (HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    var email = payload.Split(':')[0];
    if (email.Contains('|')) email = email.Split('|')[0];
    return Results.Ok(db.GetMyIdeas(email));
});

// ── Tesztelők ─────────────────────────────────────────────────────────────

// Tesztelők listája (csak oktató)
app.MapGet("/api/tesztelok", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetTesztelők());
});

// Tesztelő hozzáadása (csak oktató)
app.MapPost("/api/tesztelok", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = reader.ReadToEndAsync().Result;
    var email = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(body)
        .GetProperty("email").GetString() ?? "";
    if (string.IsNullOrWhiteSpace(email)) return Results.BadRequest(new { error = "email kötelező" });
    db.AddTesztelő(email);
    db.SaveTeszteloiUzenet("🔬 Üdvözlünk a tesztelők között! Felkértek, hogy segíts a rendszer fejlesztésében. Köszönjük a részvételt! Ha hibát találsz, használd a 🐛 Hibajelentés gombot a portálon.", email);
    return Results.Ok(new { success = true });
});

// Tesztelő eltávolítása (csak oktató)
app.MapDelete("/api/tesztelok/{email}", (string email, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.RemoveTesztelő(email);
    return Results.Ok(new { success = true });
});

// Tesztelő ellenőrzése (bárki, portal-on badge-hez)
app.MapGet("/api/tesztelok/check", (string email, Database db) =>
    Results.Ok(new { isTesztelő = db.IsTesztelő(email) })
);

// Tesztelő jelentkezés (tanuló, token kell)
app.MapPost("/api/tesztelok/jelentes", async (HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid || payload == null) return Results.Unauthorized();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = await reader.ReadToEndAsync();
    var json = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(body);
    var email = payload.Split(':')[0];
    if (string.IsNullOrWhiteSpace(email)) return Results.BadRequest(new { error = "email hiányzik" });
    if (db.IsTesztelő(email)) return Results.BadRequest(new { error = "Már tesztelő vagy." });
    string? nev = json.TryGetProperty("nev", out var np) ? np.GetString() : null;
    string? osztaly = json.TryGetProperty("osztaly", out var op) ? op.GetString() : null;
    db.SaveTeszteloiKervenyt(email, nev ?? "", osztaly);
    return Results.Ok(new { success = true });
});

// Tesztelő kérvények listája (csak oktató)
app.MapGet("/api/tesztelok/kervenyok", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetTeszteloiKervenyok());
});

// Tesztelő kérvény törlése (elutasítás, csak oktató)
app.MapDelete("/api/tesztelok/kervenyok/{email}", (string email, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.DeleteTeszteloiKervenyt(email);
    return Results.Ok(new { success = true });
});

// ── Tesztelői üzenetek ────────────────────────────────────────────────────

// Üzenet küldése tesztelőknek (csak oktató)
app.MapPost("/api/teszteloi-uzenetek", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = reader.ReadToEndAsync().Result;
    var json = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(body);
    var szoveg = json.GetProperty("szoveg").GetString() ?? "";
    if (string.IsNullOrWhiteSpace(szoveg)) return Results.BadRequest(new { error = "szoveg kötelező" });
    string? recipient = null;
    if (json.TryGetProperty("recipient_email", out var rProp)) recipient = rProp.GetString();
    var id = db.SaveTeszteloiUzenet(szoveg, string.IsNullOrWhiteSpace(recipient) ? null : recipient);
    return Results.Ok(new { success = true, id });
});

// Tesztelői üzenetek lekérése (csak tesztelő, token alapján)
app.MapGet("/api/teszteloi-uzenetek/my", (HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    var email = payload.Split(':')[0];
    if (email.Contains('|')) email = email.Split('|')[0];
    if (!db.IsTesztelő(email)) return Results.Unauthorized();
    return Results.Ok(db.GetTeszteloiUzenetek(email));
});

// Küldött üzenetek listája olvasottsági statisztikával (csak oktató)
app.MapGet("/api/teszteloi-uzenetek/admin", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetTeszteloiUzenetekAdmin());
});

// Üzenet olvasottnak jelölése
app.MapPost("/api/teszteloi-uzenetek/{id}/olvas", (int id, HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    var email = payload.Split(':')[0];
    if (email.Contains('|')) email = email.Split('|')[0];
    db.MarkTeszteloiUzenetOlvasott(id, email);
    return Results.Ok(new { success = true });
});

// ── Feladatkészítők ───────────────────────────────────────────────────────

// Automatikus csatlakozás (bármely bejelentkezett tanuló)
app.MapPost("/api/feladatkeszito/join", (HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    var email = payload.Split(':')[0];
    if (email.Contains('|')) email = email.Split('|')[0];
    db.AddFeladatkeszito(email);
    return Results.Ok(new { success = true });
});

// Státusz ellenőrzés
app.MapGet("/api/feladatkeszito/check", (string email, Database db) =>
    Results.Ok(new { isFeladatkeszito = db.IsFeladatkeszito(email) })
);

// Lista (csak oktató)
app.MapGet("/api/feladatkeszitok", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetFeladatkeszitok());
});

// Eltávolítás (csak oktató)
app.MapDelete("/api/feladatkeszitok/{email}", (string email, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.RemoveFeladatkeszito(email);
    return Results.Ok(new { success = true });
});

// Feladat javaslat beküldése (csak feladatkészítő)
app.MapPost("/api/feladat-javaslatok", (HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    var email = payload.Split(':')[0];
    if (email.Contains('|')) email = email.Split('|')[0];
    if (!db.IsFeladatkeszito(email)) return Results.Forbid();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = reader.ReadToEndAsync().Result;
    var req = System.Text.Json.JsonSerializer.Deserialize<FeladatJavaslatRequest>(body,
        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    if (req == null || string.IsNullOrWhiteSpace(req.Cim) || string.IsNullOrWhiteSpace(req.Szoveg))
        return Results.BadRequest(new { error = "Cím és szöveg kötelező" });
    var id = db.SaveFeladatJavaslat(req);
    return Results.Ok(new { success = true, id });
});

// Javaslatok listája (csak oktató)
app.MapGet("/api/feladat-javaslatok", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetFeladatJavaslatok());
});

// Javaslat frissítése (csak oktató)
app.MapPut("/api/feladat-javaslatok/{id}", (int id, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = reader.ReadToEndAsync().Result;
    var req = System.Text.Json.JsonSerializer.Deserialize<FeladatJavaslatUpdateRequest>(body,
        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    if (req == null) return Results.BadRequest(new { error = "Hibás kérés" });
    db.UpdateFeladatJavaslat(id, req);
    return Results.Ok(new { success = true });
});

// Statisztika (csak oktató)
app.MapGet("/api/feladat-javaslatok/stats", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetFeladatKeszitokStats());
});

// Megvalósult ötlet mentése a portálra (csak oktató, feladat javaslat megvalósításakor)
app.MapPost("/api/megvalasult", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = reader.ReadToEndAsync().Result;
    var json = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(body);
    var nev    = json.TryGetProperty("nev",    out var n) ? n.GetString() ?? "" : "";
    var osztaly= json.TryGetProperty("osztaly",out var o) ? o.GetString() : null;
    var szoveg = json.TryGetProperty("szoveg", out var s) ? s.GetString() ?? "" : "";
    if (string.IsNullOrWhiteSpace(szoveg)) return Results.BadRequest(new { error = "szoveg kötelező" });
    db.SaveMegvalasultOtlet(nev, osztaly, szoveg);
    return Results.Ok(new { success = true });
});

// ── Session tracking ──────────────────────────────────────────────────────

// Session indítása (oldal betöltésekor)
app.MapPost("/api/session/start", (SessionStartRequest req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Page))
        return Results.BadRequest(new { error = "email és page kötelező" });
    var validPages = new[] { "portal", "practice", "web", "python", "py-basics", "py-practice", "py-pro" };
    var page = validPages.Contains(req.Page) ? req.Page : "portal";
    var id = db.StartSession(req.Email, page);
    return Results.Ok(new { sessionId = id });
});

// Heartbeat (30 másodpercenként)
app.MapPost("/api/session/heartbeat", (HeartbeatRequest req, Database db) =>
{
    db.UpdateHeartbeat(req.SessionId);
    return Results.Ok(new { ok = true });
});

// Session lezárása (tab bezárásakor)
app.MapPost("/api/session/end", (SessionEndRequest req, Database db) =>
{
    db.EndSession(req.SessionId);
    return Results.Ok(new { ok = true });
});

// Tanuló session statisztikái (bejelentkezett felhasználó)
app.MapGet("/api/session/stats/{email}", (string email, HttpContext ctx, Database db) =>
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return Results.Unauthorized();
    var tokenEmail = payload.Split(':')[0];
    if (tokenEmail.Contains('|')) tokenEmail = tokenEmail.Split('|')[0];
    // Tanuló csak saját adatait láthatja, oktató bárkit
    var isOktato = payload.Contains("|oktato") || payload.Contains("|admin");
    if (!isOktato && !tokenEmail.Equals(email, StringComparison.OrdinalIgnoreCase))
        return Results.Forbid();
    var stats = db.GetSessionStats(email);
    return Results.Ok(stats);
});

// Összes tanuló session statisztikája (csak oktató)
app.MapGet("/api/session/all", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetAllSessionStats());
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

// Extra record a jelszócsere endpoint-hoz
namespace KandoTest
{
    public record ChangePasswordRequest(string Username, string OldPassword, string NewPassword);
    public record DeleteAccountRequest(string Email, string Jelszo);
    public record ResetPasswordRequest(string Email, string NewPassword);
}
