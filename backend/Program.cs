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
app.MapPost("/api/auth/register", (RegisterRequest req, Database db) =>
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

// Saját haladás lekérése (email alapú, nyilvános)
app.MapGet("/api/progress/{email}", (string email, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
    var progress = db.GetStudentProgress(decoded);
    return Results.Ok(progress);
});

// Összes tanuló összesítése (csak admin)
app.MapGet("/api/progress", (HttpContext ctx, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
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

// Tanuló állapot lekérése / mentése (pl. utolsó kör feladatszámai) – nyilvános, email alapú
app.MapGet("/api/user-state/{email}/{key}", (string email, string key, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
    var value = db.GetUserState(decoded, key);
    return Results.Ok(new { value });
});

app.MapPut("/api/user-state/{email}/{key}", async (string email, string key, HttpContext ctx, Database db) =>
{
    var decoded = Uri.UnescapeDataString(email);
    if (!decoded.Contains('@')) decoded += "@kkszki.hu";
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

// Saját visszajelzések lekérése (bejelentkezett felhasználó)
app.MapGet("/api/feedback/my", (HttpContext ctx, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
    var email = ctx.Request.Query["email"].FirstOrDefault() ?? "";
    var list = db.GetMyRatings(email);
    return Results.Ok(list.Select(x => new { feladatNev = x.FeladatNev, tipus = x.Tipus, ertek = x.Ertek }));
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
