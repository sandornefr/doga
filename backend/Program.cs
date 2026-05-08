using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
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

// CORS – GitHub Pages + helyi fejlesztés + iskolai szerver
builder.Services.AddCors(o => {
    o.AddDefaultPolicy(p =>
        p.WithOrigins(
            "https://sandornefr.github.io",
            "https://sandorpeteer.github.io",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:3000",
            "https://agazati.up.railway.app"
        ).AllowAnyHeader().AllowAnyMethod());
    o.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var dbPath = builder.Configuration["DB_PATH"] ?? "kando.db";
var db = new Database(dbPath);
builder.Services.AddSingleton(db);

var app = builder.Build();
app.UseCors();
app.UseRateLimiter(); // Ráhelyezzük a rate limitert a pipeline-ra

// Adatbázis inicializálás
db.Initialize();
db.MigrateChatChannel();
db.MigrateDuelTime();
// Kandó Bot – gép elleni meccshez (mindig létezik)
db.UpsertUser("Piton", "Professzor", "bot@kkszki.hu", BCrypt.Net.BCrypt.HashPassword("KandoBotNemBelephet!2024"), "tanulo");
// Teszt tanulói fiók (tanári teszteléshez – diák nézet, számonkérés, stb.)
db.UpsertUser("Teszt", "Elek", "tesztelek@kkszki.hu", BCrypt.Net.BCrypt.HashPassword("Teszt2026!"), "tanulo");
db.UpdateUserBasic("tesztelek@kkszki.hu", "Teszt", "Elek", "teszt", null, "T");

// Környezeti változók
var secretKey    = app.Configuration["SECRET_KEY"]    ?? "kando-secret-change-in-production!";
var adminEnvUser = app.Configuration["ADMIN_USERNAME"] ?? "admin";
var adminEnvPass = app.Configuration["ADMIN_PASSWORD"] ?? "kandooktato";
var gasUrl       = app.Configuration["GAS_URL"]       ?? "";
var gasAdminPass = app.Configuration["GAS_ADMIN_PASSWORD"] ?? "";

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
        var expected = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var provided = Convert.FromBase64String(sig);
        if (!CryptographicOperations.FixedTimeEquals(provided, expected)) return (false, "");
        var parts = payload.Split(':');
        if (parts.Length < 2) return (false, "");
        var ts = long.Parse(parts[^1]);
        if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() - ts >= 604800) return (false, ""); // 7 nap
        return (true, payload);
    }
    catch { return (false, ""); }
}

static string NormalizeSchoolEmail(string? raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return "";
    var email = raw.Trim().ToLowerInvariant();
    if (!email.Contains('@')) email += "@kkszki.hu";
    email = email.Replace("@kkszki.hu@kkszki.hu", "@kkszki.hu");
    return email.EndsWith("@kkszki.hu") ? email : "";
}

static bool IsPrivilegedRole(string role) => role is "oktato" or "admin";

(bool Valid, string Identity, string Role) InspectAuthContext(HttpContext ctx)
{
    var (valid, payload) = InspectToken(ctx);
    if (!valid) return (false, "", "");

    var marker = payload.LastIndexOf(':');
    if (marker <= 0) return (false, "", "");

    var principal = payload[..marker];
    var parts = principal.Split('|', 2, StringSplitOptions.TrimEntries);
    var identity = parts[0].Trim().ToLowerInvariant();
    var role = parts.Length > 1 ? parts[1].Trim().ToLowerInvariant() : "";
    if (string.IsNullOrWhiteSpace(identity)) return (false, "", "");
    return (true, identity, role);
}

bool IsSelfOrPrivileged(string tokenIdentity, string tokenRole, string targetEmail) =>
    IsPrivilegedRole(tokenRole) || tokenIdentity.Equals(targetEmail, StringComparison.OrdinalIgnoreCase);

static bool IsSafeImageDataUrl(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return false;
    if (value.Length > 2_000_000) return false;
    var v = value.Trim();
    return v.StartsWith("data:image/png;base64,", StringComparison.OrdinalIgnoreCase)
        || v.StartsWith("data:image/jpeg;base64,", StringComparison.OrdinalIgnoreCase)
        || v.StartsWith("data:image/jpg;base64,", StringComparison.OrdinalIgnoreCase)
        || v.StartsWith("data:image/webp;base64,", StringComparison.OrdinalIgnoreCase)
        || v.StartsWith("data:image/gif;base64,", StringComparison.OrdinalIgnoreCase);
}

static string? SanitizeCodeSnapshot(string? raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return null;
    if (raw.Length > 500_000) return null;

    try
    {
        var node = JsonNode.Parse(raw);
        if (node is not JsonObject root) return null;

        if (root["validationImages"] is JsonObject images)
        {
            foreach (var key in new[] { "html", "css" })
            {
                var value = images[key]?.GetValue<string>();
                if (!IsSafeImageDataUrl(value))
                    images[key] = null;
            }
        }

        return root.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
    }
    catch
    {
        return null;
    }
}

bool ValidateOktato(HttpContext ctx)
{
    var (valid, _, role) = InspectAuthContext(ctx);
    return valid && IsPrivilegedRole(role);
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

// Oktatói token alapú admin belépés (portál tokennel, jelszó nélkül)
app.MapPost("/api/teachers/token-login", (HttpContext ctx) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var (valid, username, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var adminToken = CreateToken($"{username}|admin");
    return Results.Ok(new { token = adminToken, username });
});

// Bejelentkezés
app.MapPost("/api/auth/login", (LoginRequest req, Database db) =>
{
    var hash = db.GetPasswordHash(req.Username);
    if (hash == null || !BCrypt.Net.BCrypt.Verify(req.Password, hash))
        return Results.Unauthorized();
    var token = CreateToken($"{req.Username}|admin");
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
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.SetConfig("test_mode", req.TestMode);
    if (req.VizsgaKezdes != null)
        db.SetConfig("vizsga_kezdes", req.VizsgaKezdes);
    if (req.VizsgaVege != null)
        db.SetConfig("vizsga_vege", req.VizsgaVege);
    return Results.Ok(new { success = true });
});

// Beadás mentése (diák)
app.MapPost("/api/submit", (HttpContext ctx, SubmissionRequest req, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);

    var reqEmail = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrEmpty(reqEmail))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });
    if (valid && !IsSelfOrPrivileged(tokenIdentity, tokenRole, reqEmail))
        return Results.Forbid();

    if (req.MaxTotal <= 0 || req.TotalScore < 0 || req.TotalScore > req.MaxTotal)
        return Results.BadRequest(new { error = "Érvénytelen pontszám adatok" });

    var mode = (req.Mode ?? "").Trim().ToLowerInvariant();
    if (mode is not ("live" or "practice")) mode = "practice";

    var subject = (req.Subject ?? "").Trim().ToLowerInvariant();
    if (subject is not ("python" or "web")) subject = "";

    var normalizedReq = req with
    {
        Email = reqEmail,
        Mode = mode,
        Subject = subject,
        CodeSnapshot = SanitizeCodeSnapshot(req.CodeSnapshot)
    };

    var id = db.SaveSubmission(normalizedReq);
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
    var email = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrEmpty(email))
        return Results.BadRequest(new { error = "Csak @kkszki.hu email cím fogadható el!" });

    var requestedRole = (req.Szerep ?? "tanulo").Trim().ToLowerInvariant();
    if (requestedRole is not ("tanulo" or "oktato"))
        return Results.BadRequest(new { error = "Érvénytelen szerepkör!" });

    if (requestedRole == "oktato")
    {
        if (string.IsNullOrWhiteSpace(req.OktatoiKod) || !string.Equals(req.OktatoiKod.Trim(), teacherCode, StringComparison.Ordinal))
            return Results.BadRequest(new { error = "Érvénytelen oktatói kód!" });
    }

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

    var hash = BCrypt.Net.BCrypt.HashPassword(req.Jelszo);
    var normalizedReq = req with { Email = email, Szerep = requestedRole };
    var success = db.RegisterUser(normalizedReq, hash);

    if (!success)
        return Results.BadRequest(new { error = "Ez az email cím már regisztrálva van!" });

    return Results.Ok(new { success = true, message = "Sikeres regisztráció!" });
})
.RequireRateLimiting("auth");

// Felhasználói bejelentkezés (tanulók + oktatók)
app.MapPost("/api/auth/user-login", (UserLoginRequest req, Database db) =>
{
    var email = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrEmpty(email))
        return Results.Unauthorized();

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

// Felhasználó nevének és csoportjának szerkesztése (admin)
app.MapPost("/api/users/{email}/update", (HttpContext ctx, string email, UpdateUserRequest req, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (string.IsNullOrWhiteSpace(req.Vezeteknev)) return Results.BadRequest(new { error = "A vezetéknév nem lehet üres!" });
    if (string.IsNullOrWhiteSpace(req.Keresztnev)) return Results.BadRequest(new { error = "A keresztnév nem lehet üres!" });
    var ok = db.UpdateUserBasic(Uri.UnescapeDataString(email), req.Vezeteknev.Trim(), req.Keresztnev.Trim(), req.Csoport?.Trim(), req.Evfolyam?.Trim(), req.Osztaly?.Trim());
    return ok ? Results.Ok(new { success = true }) : Results.NotFound(new { error = "Felhasználó nem található" });
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
app.MapPost("/api/auth/delete-account", (HttpContext ctx, DeleteAccountRequest req, Database db) =>
{
    var email = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrEmpty(email))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (valid && !tokenIdentity.Equals(email, StringComparison.OrdinalIgnoreCase))
        return Results.Forbid();

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
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 6)
        return Results.BadRequest(new { error = "Az új jelszó legalább 6 karakter legyen" });

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

// Gyakorlás eredményének mentése
app.MapPost("/api/progress", (HttpContext ctx, ProgressRequest req, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);

    var reqEmail = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrEmpty(reqEmail))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });
    if (valid && !IsSelfOrPrivileged(tokenIdentity, tokenRole, reqEmail))
        return Results.Forbid();

    if (req.MaxPont <= 0 || req.Pont < 0 || req.Pont > req.MaxPont)
        return Results.BadRequest(new { error = "Érvénytelen adat" });

    var targy = (req.Targy ?? "").Trim().ToLowerInvariant();
    if (targy is not ("web" or "python"))
        return Results.BadRequest(new { error = "Érvénytelen tantárgy" });

    var normalizedReq = req with
    {
        Email = reqEmail,
        Targy = targy,
        Mode = string.IsNullOrWhiteSpace(req.Mode) ? "gyakorlo" : req.Mode.Trim().ToLowerInvariant()
    };

    db.SaveProgress(normalizedReq);
    return Results.Ok(new { success = true });
});

// Saját haladás lekérése (saját token szükséges, vagy oktató)
app.MapGet("/api/progress/{email}", (string email, HttpContext ctx, Database db) =>
{
    var decoded = NormalizeSchoolEmail(Uri.UnescapeDataString(email));
    if (string.IsNullOrEmpty(decoded))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    // Oktató mindent láthat, diák csak a sajátját
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    if (!IsSelfOrPrivileged(tokenIdentity, tokenRole, decoded))
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

// Követelmény teljesítési statisztika (admin)
app.MapGet("/api/completion-stats", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetCompletionStats());
});

// ── Ágazati feladat rangsor (tanuló saját + szűrt) ─────────────────────────
// Visszaadja: feladatonként hány fő oldotta meg max ponttal + a kérelmező rangja
app.MapGet("/api/leaderboard/agazati", (HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email    = NormalizeSchoolEmail(identity);
    var osztaly  = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport  = ctx.Request.Query["csoport"].FirstOrDefault();
    var evfolyam = ctx.Request.Query["evfolyam"].FirstOrDefault();
    return Results.Ok(db.GetAgazatiLeaderboard(email, osztaly, csoport, evfolyam));
});

// Streak / összesített rangsor (bejelentkezett tanuló is láthatja)
app.MapGet("/api/leaderboard/streak", (HttpContext ctx, Database db) =>
{
    var (valid, _, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var osztaly  = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport  = ctx.Request.Query["csoport"].FirstOrDefault();
    var evfolyam = ctx.Request.Query["evfolyam"].FirstOrDefault();
    return Results.Ok(db.GetStreakLeaderboard(osztaly, csoport, evfolyam));
});

// Kódpárbaj rangsor
app.MapGet("/api/leaderboard/duel", (HttpContext ctx, Database db) =>
{
    var (valid, _, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var osztaly  = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport  = ctx.Request.Query["csoport"].FirstOrDefault();
    var evfolyam = ctx.Request.Query["evfolyam"].FirstOrDefault();
    return Results.Ok(db.GetDuelLeaderboard(osztaly, csoport, evfolyam));
});

// Saját rang lekérése (tanuló, nyilvános)
app.MapGet("/api/leaderboard/rank/{email}", (string email, Database db) =>
{
    var decoded = NormalizeSchoolEmail(Uri.UnescapeDataString(email));
    if (string.IsNullOrEmpty(decoded))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    return Results.Ok(db.GetStudentRank(decoded));
});

// Tanuló állapot lekérése / mentése (saját token vagy oktató szükséges)
app.MapGet("/api/user-state/{email}/{key}", (string email, string key, HttpContext ctx, Database db) =>
{
    var decoded = NormalizeSchoolEmail(Uri.UnescapeDataString(email));
    if (string.IsNullOrEmpty(decoded))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    if (!IsSelfOrPrivileged(tokenIdentity, tokenRole, decoded))
        return Results.Forbid();

    var value = db.GetUserState(decoded, key);
    return Results.Ok(new { value });
});

app.MapPut("/api/user-state/{email}/{key}", async (string email, string key, HttpContext ctx, Database db) =>
{
    var decoded = NormalizeSchoolEmail(Uri.UnescapeDataString(email));
    if (string.IsNullOrEmpty(decoded))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    if (!IsSelfOrPrivileged(tokenIdentity, tokenRole, decoded))
        return Results.Forbid();

    using var reader = new StreamReader(ctx.Request.Body);
    var body = await reader.ReadToEndAsync();
    var doc = JsonDocument.Parse(body);
    var value = doc.RootElement.GetProperty("value").GetString() ?? "";
    db.SetUserState(decoded, key, value);
    return Results.Ok(new { success = true });
});

// Saját jelszó módosítása (tanuló – ideiglenes jelszó után kötelező)
app.MapPost("/api/auth/change-own-password", (HttpContext ctx, ChangeOwnPasswordRequest req, Database db) =>
{
    var email = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrEmpty(email))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (valid && !tokenIdentity.Equals(email, StringComparison.OrdinalIgnoreCase))
        return Results.Forbid();

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

// Visszajelzés mentése
app.MapPost("/api/feedback", (HttpContext ctx, FeedbackRequest req, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);

    var reqEmail = NormalizeSchoolEmail(req.Email);
    if (string.IsNullOrWhiteSpace(reqEmail) || string.IsNullOrWhiteSpace(req.FeladatNev))
        return Results.BadRequest(new { error = "Hiányzó adat" });
    if (valid && !IsSelfOrPrivileged(tokenIdentity, tokenRole, reqEmail))
        return Results.Forbid();

    if (req.Tipus != "vote" && req.Tipus != "reaction" && req.Tipus != "practice_vote")
        return Results.BadRequest(new { error = "Érvénytelen tipus (vote, reaction vagy practice_vote)" });

    if (req.Ertek < 0 || req.Ertek > 5)
        return Results.BadRequest(new { error = "Érvénytelen érték" });

    db.SaveRating(reqEmail, req.FeladatNev.Trim(), req.Tipus, req.Ertek);
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
    var (valid, emailPart, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(emailPart);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    var list = db.GetMyRatings(email);
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
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
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
app.MapGet("/api/tesztelok/check", (HttpContext ctx, string email, Database db) =>
{
    var target = NormalizeSchoolEmail(email);
    if (string.IsNullOrEmpty(target))
    {
        var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
        if (valid) target = NormalizeSchoolEmail(tokenIdentity);
    }
    if (string.IsNullOrEmpty(target)) return Results.BadRequest(new { error = "email kötelező" });

    return Results.Ok(new { isTesztelő = db.IsTesztelő(target) });
});

// Tesztelő jelentkezés (tanuló, token kell)
app.MapPost("/api/tesztelok/jelentes", async (HttpContext ctx, Database db) =>
{
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();

    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = await reader.ReadToEndAsync();
    var json = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(body);
    var email = NormalizeSchoolEmail(tokenIdentity);
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
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
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
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    db.MarkTeszteloiUzenetOlvasott(id, email);
    return Results.Ok(new { success = true });
});

// ── Feladatkészítők ───────────────────────────────────────────────────────

// Automatikus csatlakozás (bármely bejelentkezett tanuló)
app.MapPost("/api/feladatkeszito/join", (HttpContext ctx, Database db) =>
{
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    db.AddFeladatkeszito(email);
    return Results.Ok(new { success = true });
});

// Státusz ellenőrzés
app.MapGet("/api/feladatkeszito/check", (HttpContext ctx, string email, Database db) =>
{
    var target = NormalizeSchoolEmail(email);
    if (string.IsNullOrEmpty(target))
    {
        var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
        if (valid) target = NormalizeSchoolEmail(tokenIdentity);
    }
    if (string.IsNullOrEmpty(target)) return Results.BadRequest(new { error = "email kötelező" });

    return Results.Ok(new { isFeladatkeszito = db.IsFeladatkeszito(target) });
});

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
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    if (!db.IsFeladatkeszito(email)) return Results.Forbid();
    using var reader = new System.IO.StreamReader(ctx.Request.Body);
    var body = reader.ReadToEndAsync().Result;
    var req = System.Text.Json.JsonSerializer.Deserialize<FeladatJavaslatRequest>(body,
        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    if (req == null || string.IsNullOrWhiteSpace(req.Cim) || string.IsNullOrWhiteSpace(req.Szoveg))
        return Results.BadRequest(new { error = "Cím és szöveg kötelező" });

    var normalizedReq = req with { Email = email };
    var id = db.SaveFeladatJavaslat(normalizedReq);
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
app.MapPost("/api/session/start", (HttpContext ctx, SessionStartRequest req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Page))
        return Results.BadRequest(new { error = "page kötelező" });

    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    var requestedEmail = NormalizeSchoolEmail(req.Email);
    string sessionEmail;
    if (valid)
    {
        var tokenEmail = NormalizeSchoolEmail(tokenIdentity);
        if (string.IsNullOrEmpty(tokenEmail) && !IsPrivilegedRole(tokenRole))
            return Results.Unauthorized();

        if (!IsPrivilegedRole(tokenRole) && !tokenEmail.Equals(requestedEmail, StringComparison.OrdinalIgnoreCase))
            return Results.Forbid();

        sessionEmail = IsPrivilegedRole(tokenRole)
            ? (string.IsNullOrEmpty(requestedEmail) ? tokenEmail : requestedEmail)
            : tokenEmail;
    }
    else
    {
        sessionEmail = requestedEmail;
    }

    if (string.IsNullOrEmpty(sessionEmail))
        return Results.BadRequest(new { error = "email és page kötelező" });

    var validPages = new[] { "portal", "practice", "web", "python", "py-basics", "py-practice", "py-pro" };
    var page = validPages.Contains(req.Page) ? req.Page : "portal";
    var id = db.StartSession(sessionEmail, page);
    return Results.Ok(new { sessionId = id });
});

// Heartbeat (30 másodpercenként)
app.MapPost("/api/session/heartbeat", (HttpContext ctx, HeartbeatRequest req, Database db) =>
{
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (valid)
    {
        var email = NormalizeSchoolEmail(tokenIdentity);
        if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
        var ok = db.UpdateHeartbeat(req.SessionId, email);
        return ok ? Results.Ok(new { ok = true }) : Results.NotFound(new { error = "Session nem található" });
    }
    db.UpdateHeartbeat(req.SessionId);
    return Results.Ok(new { ok = true });
});

// Session lezárása (tab bezárásakor)
app.MapPost("/api/session/end", (HttpContext ctx, SessionEndRequest req, Database db) =>
{
    var (valid, tokenIdentity, _) = InspectAuthContext(ctx);
    if (valid)
    {
        var email = NormalizeSchoolEmail(tokenIdentity);
        if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
        var ok = db.EndSession(req.SessionId, email);
        return ok ? Results.Ok(new { ok = true }) : Results.NotFound(new { error = "Session nem található" });
    }
    db.EndSession(req.SessionId);
    return Results.Ok(new { ok = true });
});

// Tanuló session statisztikái (bejelentkezett felhasználó)
app.MapGet("/api/session/stats/{email}", (string email, HttpContext ctx, Database db) =>
{
    var requested = NormalizeSchoolEmail(email);
    if (string.IsNullOrEmpty(requested))
        return Results.BadRequest(new { error = "Érvénytelen email cím" });

    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    // Tanuló csak saját adatait láthatja, oktató bárkit
    if (!IsSelfOrPrivileged(tokenIdentity, tokenRole, requested))
        return Results.Forbid();

    var stats = db.GetSessionStats(requested);
    return Results.Ok(stats);
});

// Összes tanuló session statisztikája (csak oktató)
app.MapGet("/api/session/all", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetAllSessionStats());
});

// Jelszó visszaállítási kérelem beküldése (nyilvános – tanuló küldi)
app.MapPost("/api/password-reset-request", (PasswordResetRequestInput req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Nev))
        return Results.BadRequest(new { error = "Hiányzó adatok" });
    db.SavePasswordResetRequest(req.Email, req.Nev, req.Osztaly, req.Csoport);
    return Results.Ok(new { success = true });
}).RequireRateLimiting("auth");

// Jelszó visszaállítási kérelmek listája (csak admin)
app.MapGet("/api/password-reset-requests", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetPasswordResetRequests());
});

// Jelszó visszaállítási kérelem törlése (csak admin)
app.MapDelete("/api/password-reset-request/{id}", (HttpContext ctx, int id, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    db.DeletePasswordResetRequest(id);
    return Results.Ok(new { success = true });
});

// ── Quiz eredmények ────────────────────────────────────────────────────────

// Kvíz eredmény mentése (diák küldi)
app.MapPost("/api/quiz-result", (HttpContext ctx, QuizResultRequest req, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    var tokenEmail = valid ? NormalizeSchoolEmail(tokenIdentity) : "";
    string? normalizedEmail = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim().ToLowerInvariant();

    if (valid && !IsPrivilegedRole(tokenRole))
    {
        if (!string.IsNullOrEmpty(tokenEmail))
        {
            var reqEmail = NormalizeSchoolEmail(req.Email);
            if (!string.IsNullOrEmpty(reqEmail) && !reqEmail.Equals(tokenEmail, StringComparison.OrdinalIgnoreCase))
                return Results.Forbid();
            normalizedEmail = tokenEmail;
        }
    }
    else if (valid && IsPrivilegedRole(tokenRole))
    {
        var reqEmail = NormalizeSchoolEmail(req.Email);
        if (!string.IsNullOrEmpty(reqEmail))
            normalizedEmail = reqEmail;
    }

    if (req.MaxPont <= 0 || req.Pont < 0 || req.Pont > req.MaxPont)
        return Results.BadRequest(new { error = "Érvénytelen pont adatok" });

    if (string.IsNullOrWhiteSpace(req.Tipus))
        return Results.BadRequest(new { error = "A típus kötelező" });

    var normalized = req with
    {
        Email = normalizedEmail,
        Szazalek = (int)Math.Round(req.Pont * 100.0 / req.MaxPont)
    };

    var id = db.SaveQuizResult(normalized);
    return Results.Ok(new { success = true, id });
});

// Kvíz eredmények lekérése (csak oktató)
app.MapGet("/api/quiz-results", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var tipus = ctx.Request.Query["tipus"].FirstOrDefault();
    var list = db.GetQuizResults(string.IsNullOrEmpty(tipus) ? null : tipus);
    return Results.Ok(list);
});


// Per-student quiz results (oktató)
app.MapGet("/api/quiz-results/{email}", (string email, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var decoded = Uri.UnescapeDataString(email);
    return Results.Ok(db.GetStudentQuizResults(decoded));
});

// Saját quiz eredmények (tanuló – saját token alapján)
app.MapGet("/api/my-quiz-results", (HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    return Results.Ok(db.GetStudentQuizResults(email));
});

// Per-student progress detail items (saját tanuló + oktató)
app.MapGet("/api/progress/{email}/items", (string email, HttpContext ctx, Database db) =>
{
    var (valid, identity, role) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var decoded = Uri.UnescapeDataString(email);
    if (!IsSelfOrPrivileged(identity, role, NormalizeSchoolEmail(decoded)))
        return Results.Forbid();
    return Results.Ok(db.GetStudentProgressItems(decoded));
});

// ── Számonkérés ──────────────────────────────────────────────────────────────

string GetOktatoEmail(HttpContext ctx)
{
    var (valid, identity, role) = InspectAuthContext(ctx);
    return valid && IsPrivilegedRole(role) ? identity : "";
}

// Számonkérés létrehozása (oktató)
app.MapPost("/api/szamonkeres", (HttpContext ctx, SzamonkeresCreateRequest req, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (string.IsNullOrWhiteSpace(req.Cim)) return Results.BadRequest(new { error = "Cím kötelező" });
    var email = GetOktatoEmail(ctx);
    var id = db.SaveSzamonkeres(req, email);
    return Results.Ok(new { success = true, id });
});

// Oktató saját számonkérései
app.MapGet("/api/szamonkeres", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var email = GetOktatoEmail(ctx);
    return Results.Ok(db.GetSzamonkeresekByOktato(email));
});

// Számonkérés részletei + beadások (oktató)
app.MapGet("/api/szamonkeres/{id:int}", (int id, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var sz = db.GetSzamonkeres(id);
    if (sz == null) return Results.NotFound();
    var email = GetOktatoEmail(ctx);
    if (!sz.OktatoEmail.Equals(email, StringComparison.OrdinalIgnoreCase)) return Results.Forbid();
    var beadasok = db.GetBeadasok(id);
    return Results.Ok(new { szamonkeres = sz, beadasok });
});

// Aktív számonkérések tanulónak
app.MapGet("/api/szamonkeres/aktiv", (HttpContext ctx, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();

    var email = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(email) && !IsPrivilegedRole(tokenRole))
        return Results.Unauthorized();

    string? osztaly;
    string? csoport;

    if (IsPrivilegedRole(tokenRole))
    {
        osztaly = ctx.Request.Query["osztaly"].FirstOrDefault();
        csoport = ctx.Request.Query["csoport"].FirstOrDefault();
    }
    else
    {
        var user = db.GetUserByEmail(email);
        if (user == null) return Results.Forbid();
        osztaly = user.Osztaly;
        csoport = user.Csoport;
    }

    return Results.Ok(db.GetAktivSzamonkeresForStudent(email, osztaly, csoport));
});

// Tanuló beadása
app.MapPost("/api/szamonkeres/{id:int}/beadas", (int id, HttpContext ctx, BeadasCreateRequest req, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();

    if (IsPrivilegedRole(tokenRole))
        return Results.Forbid();

    var tokenEmail = NormalizeSchoolEmail(tokenIdentity);
    if (string.IsNullOrEmpty(tokenEmail))
        return Results.Unauthorized();

    var user = db.GetUserByEmail(tokenEmail);
    if (user == null || !string.Equals(user.Szerep, "tanulo", StringComparison.OrdinalIgnoreCase))
        return Results.Forbid();

    var reqEmail = NormalizeSchoolEmail(req.TanuloEmail);
    if (string.IsNullOrEmpty(reqEmail) || !reqEmail.Equals(tokenEmail, StringComparison.OrdinalIgnoreCase))
        return Results.Forbid();

    var sz = db.GetSzamonkeres(id);
    if (sz == null || sz.Statusz != "aktiv") return Results.BadRequest(new { error = "Nem aktív számonkérés" });

    var assigned = db.GetAktivSzamonkeresForStudent(tokenEmail, user.Osztaly, user.Csoport)
        .Any(x => x.Id == id);
    if (!assigned) return Results.Forbid();

    if (db.BeadasExists(id, tokenEmail, req.FeladatId))
        return Results.Conflict(new { error = "Már beadtad ezt a feladatot" });

    var normalizedReq = req with
    {
        TanuloEmail = tokenEmail,
        TanuloNev = $"{user.Vezeteknev} {user.Keresztnev}",
        Osztaly = user.Osztaly,
        Csoport = user.Csoport
    };

    var beadasId = db.SaveBeadas(id, normalizedReq);
    return Results.Ok(new { success = true, id = beadasId });
});

// Tanuló saját beadásai egy számonkérésen
// Tanuló saját beadásai (oktató ?email= query paraméterrel más tanulóét is lekérheti)
app.MapGet("/api/szamonkeres/{id:int}/sajat", (int id, HttpContext ctx, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    string email;
    if (IsPrivilegedRole(tokenRole))
    {
        var q = ctx.Request.Query["email"].FirstOrDefault();
        email = NormalizeSchoolEmail(!string.IsNullOrEmpty(q) ? q : tokenIdentity);
    }
    else
    {
        email = NormalizeSchoolEmail(tokenIdentity);
    }
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    var sz = db.GetSzamonkeres(id);
    if (sz == null) return Results.NotFound();
    return Results.Ok(db.GetTanuloBeadasok(id, email));
});

// Beadás manuális pontjának beállítása (oktató)
app.MapPatch("/api/szamonkeres/beadas/{beadasId:int}/pont", (int beadasId, HttpContext ctx, SetBeadasPontRequest req, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var ok = db.SetBeadasPont(beadasId, req.Pont, req.Megjegyzes);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Számonkérés lezárása (aktiv → lezart)
app.MapPatch("/api/szamonkeres/{id:int}/lezar", (int id, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var email = GetOktatoEmail(ctx);
    var ok = db.SetSzamonkeresStatusz(id, "lezart", email);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Eredmények kiadása (lezart → kiadva)
app.MapPatch("/api/szamonkeres/{id:int}/kuldj", (int id, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var email = GetOktatoEmail(ctx);
    var ok = db.SetSzamonkeresStatusz(id, "kiadva", email);
    return ok ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Tanuló lekéri a kiadott eredményeit (oktató ?email= query paraméterrel más tanulóét is lekérheti)
app.MapGet("/api/szamonkeres/eredmeny", (HttpContext ctx, Database db) =>
{
    var (valid, tokenIdentity, tokenRole) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    string email;
    if (IsPrivilegedRole(tokenRole))
    {
        var q = ctx.Request.Query["email"].FirstOrDefault();
        email = NormalizeSchoolEmail(!string.IsNullOrEmpty(q) ? q : tokenIdentity);
    }
    else
    {
        email = NormalizeSchoolEmail(tokenIdentity);
    }
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();
    var kiadottak = db.GetKiadottEredmenyek(email);
    return Results.Ok(kiadottak);
});

// ── Oktatói haladás dashboard ─────────────────────────────────────────────────

app.MapGet("/api/haladas", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var osztaly = ctx.Request.Query["osztaly"].FirstOrDefault();
    return Results.Ok(db.GetHaladasByOsztaly(osztaly));
});

// Kötelező elemek teljesítési statisztikája (tanuló token is elég – nincs PII)
app.MapGet("/api/stats/kotelezo", (HttpContext ctx, Database db) =>
{
    var (valid, _, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var evfolyam = ctx.Request.Query["evfolyam"].FirstOrDefault();
    var osztaly  = ctx.Request.Query["osztaly"].FirstOrDefault();
    var csoport  = ctx.Request.Query["csoport"].FirstOrDefault();
    return Results.Ok(db.GetKotelezoStats(evfolyam, osztaly, csoport));
});

app.MapGet("/api/haladas/osszesito", (HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetHaladasOsztalySummary());
});

app.MapGet("/api/haladas/tanulo/{email}", (string email, HttpContext ctx, Database db) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    var decoded = Uri.UnescapeDataString(email);
    var detail = db.GetHaladasTanuloDetail(decoded);
    return detail is null ? Results.NotFound() : Results.Ok(detail);
});

// ── GAS proxy (megoldások & tippek) ──────────────────────────────────────────
// A GAS_URL és GAS_ADMIN_PASSWORD env változókban tárolt, nem a frontendben.

app.MapPost("/api/gas/save-megoldas", async (HttpContext ctx, SaveMegoldasRequest req) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (string.IsNullOrEmpty(gasUrl)) return Results.Problem("GAS_URL nincs konfigurálva");
    using var http = new HttpClient();
    var payload = System.Text.Json.JsonSerializer.Serialize(new
    {
        admin_password = gasAdminPass,
        feladatId = req.FeladatId,
        solution  = req.Solution,
        hint1     = req.Hint1,
        hint2     = req.Hint2,
        hint3     = req.Hint3
    });
    var resp = await http.PostAsync(gasUrl + "?action=saveMegoldas",
        new StringContent(payload, Encoding.UTF8, "application/json"));
    var body = await resp.Content.ReadAsStringAsync();
    return Results.Content(body, "application/json");
});

app.MapGet("/api/gas/get-megoldasok", async (HttpContext ctx) =>
{
    if (!ValidateOktato(ctx)) return Results.Unauthorized();
    if (string.IsNullOrEmpty(gasUrl)) return Results.Problem("GAS_URL nincs konfigurálva");
    using var http = new HttpClient();
    var resp = await http.GetAsync(gasUrl + "?action=getMegoldasok");
    var body = await resp.Content.ReadAsStringAsync();
    return Results.Content(body, "application/json");
});

// ── Kódpárbaj ────────────────────────────────────────────────────────────────

app.MapPost("/api/duel/invite", (HttpContext ctx, DuelInviteRequest req, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var u = db.GetUserByEmail(email);
    if (u == null) return Results.Unauthorized();
    var nev = $"{u.Vezeteknev} {u.Keresztnev}".Trim();
    var opponent = db.GetUserByEmail(NormalizeSchoolEmail(req.OpponentEmail));
    var opNev = opponent != null ? $"{opponent.Vezeteknev} {opponent.Keresztnev}".Trim() : req.OpponentEmail;
    var id = db.CreateDuel(email, nev, NormalizeSchoolEmail(req.OpponentEmail), opNev, req.TaskNumber, req.TaskTitle);
    return Results.Ok(new { id });
});

app.MapGet("/api/duel/incoming", (HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    return Results.Ok(db.GetIncomingDuels(email));
});

app.MapPost("/api/duel/{id}/respond", (int id, HttpContext ctx, DuelRespondRequest req, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var ok = db.RespondDuel(id, email, req.Accept);
    return ok ? Results.Ok(new { ok = true }) : Results.BadRequest(new { error = "Nem sikerült" });
});

app.MapGet("/api/duel/{id}/status", (int id, HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var d = db.GetDuel(id);
    if (d == null) return Results.NotFound();
    var isParticipant = d.ChallengerEmail.Equals(email, StringComparison.OrdinalIgnoreCase)
                     || d.OpponentEmail.Equals(email, StringComparison.OrdinalIgnoreCase);
    if (!isParticipant) return Results.Forbid();
    // Lejárt pending → expired
    if (d.Status == "pending")
    {
        var created = DateTime.Parse(d.CreatedAt);
        if ((DateTime.Now - created).TotalMinutes > 2) { db.RespondDuel(id, d.OpponentEmail, false); d = db.GetDuel(id)!; d.Status = "expired"; }
    }
    return Results.Ok(d);
});

app.MapPost("/api/duel/{id}/submit", (int id, HttpContext ctx, DuelSubmitRequest req, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var (ok, winner) = db.SubmitDuelScore(id, email, req.Score, req.MaxScore, req.ElapsedSeconds);
    return ok ? Results.Ok(new { ok = true, winner }) : Results.BadRequest(new { error = "Nem sikerült" });
});

// ── Duel chat ────────────────────────────────────────────────────────────────
app.MapGet("/api/duel/{id}/chat", (int id, HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var d = db.GetDuel(id);
    if (d == null) return Results.NotFound();
    var isParticipant = d.ChallengerEmail.Equals(email, StringComparison.OrdinalIgnoreCase)
                     || d.OpponentEmail.Equals(email, StringComparison.OrdinalIgnoreCase);
    if (!isParticipant) return Results.Forbid();
    var sinceId = int.TryParse(ctx.Request.Query["since_id"], out var s) ? s : 0;
    return Results.Ok(db.GetChatMessages(sinceId, $"duel_{id}"));
});

app.MapPost("/api/duel/{id}/chat", (int id, HttpContext ctx, ChatSendRequest req, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var d = db.GetDuel(id);
    if (d == null) return Results.NotFound();
    var isParticipant = d.ChallengerEmail.Equals(email, StringComparison.OrdinalIgnoreCase)
                     || d.OpponentEmail.Equals(email, StringComparison.OrdinalIgnoreCase);
    if (!isParticipant) return Results.Forbid();
    if (string.IsNullOrWhiteSpace(req.Message) || req.Message.Length > 500)
        return Results.BadRequest(new { error = "Érvénytelen üzenet" });
    var u = db.GetUserByEmail(email);
    var nev = u != null ? $"{u.Vezeteknev} {u.Keresztnev}".Trim() : email;
    var msgId = db.SendChatMessage(email, nev, "tanuló", req.Message, $"duel_{id}");
    return Results.Ok(new { id = msgId });
});

app.MapGet("/api/duel/stats/{email}", (string email, HttpContext ctx, Database db) =>
{
    var (valid, _, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    return Results.Ok(db.GetDuelStats(NormalizeSchoolEmail(email)));
});

app.MapGet("/api/duel/online", (HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var ef = ctx.Request.Query["evfolyam"].ToString();
    var oz = ctx.Request.Query["osztaly"].ToString();
    var cs = ctx.Request.Query["csoport"].ToString();
    if (string.IsNullOrEmpty(ef) || string.IsNullOrEmpty(oz) || string.IsNullOrEmpty(cs))
        return Results.BadRequest(new { error = "evfolyam, osztaly, csoport kötelező" });
    var email = NormalizeSchoolEmail(identity);
    return Results.Ok(db.GetOnlineGroupMembers(ef, oz, cs, email));
});

// ── Chat ──────────────────────────────────────────────────────────────────────

// Üzenetek lekérése (tesztelő vagy oktató) – channel: 'tesztelok' | 'oktatok'
app.MapGet("/api/chat", (HttpContext ctx, Database db) =>
{
    var (valid, identity, role) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var isTesztelő = db.IsTesztelő(email);
    var isOktato = IsPrivilegedRole(role);
    if (!isOktato && !isTesztelő) return Results.Forbid();
    var sinceId = int.TryParse(ctx.Request.Query["since_id"], out var s) ? s : 0;
    var channelParam = ctx.Request.Query["channel"].ToString();
    // Tesztelő csak a tesztelok csatornát olvashatja
    var channel = (channelParam == "oktatok" && isOktato) ? "oktatok" : "tesztelok";
    return Results.Ok(db.GetChatMessages(sinceId, channel));
});

// Üzenet küldése (tesztelő vagy oktató)
app.MapPost("/api/chat", (HttpContext ctx, ChatSendRequest req, Database db) =>
{
    var (valid, identity, role) = InspectAuthContext(ctx);
    if (!valid) return Results.Unauthorized();
    var email = NormalizeSchoolEmail(identity);
    var isTesztelő = db.IsTesztelő(email);
    var isOktato = IsPrivilegedRole(role);
    if (!isOktato && !isTesztelő) return Results.Forbid();
    if (string.IsNullOrWhiteSpace(req.Message) || req.Message.Length > 2000)
        return Results.BadRequest(new { error = "Érvénytelen üzenet" });
    var u = db.GetUserByEmail(email);
    var nev = u != null ? $"{u.Vezeteknev} {u.Keresztnev}".Trim() : email;
    var szerep = isOktato ? "oktato" : "tesztelő";
    // Tesztelő mindig a tesztelok csatornába ír; oktató választhat
    var channel = (!isOktato || req.Channel != "oktatok") ? "tesztelok" : "oktatok";
    var id = db.SendChatMessage(email, nev, szerep, req.Message, channel);
    return Results.Ok(new { id });
});

// ── Távközlési technikus vizsga ───────────────────────────────────────────────

app.MapPost("/api/tavolkozles/submit", (TavolkozlesSubmitRequest req, Database db) =>
{
    if (string.IsNullOrWhiteSpace(req.Nev))
        return Results.BadRequest(new { error = "Nev megadása kötelező" });
    var valaszokJson = JsonSerializer.Serialize(req.Valaszok ?? new List<TavolkozlesValaszDto>(),
        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    var id = db.SaveTavolkozlesResult(req, valaszokJson);
    return Results.Ok(new { id });
});

app.MapGet("/api/tavolkozles/results", (HttpContext ctx, Database db) =>
{
    var (valid, identity, _) = InspectAuthContext(ctx);
    if (!valid || !identity.Equals("sandorp@kkszki.hu", StringComparison.OrdinalIgnoreCase))
        return Results.Unauthorized();
    return Results.Ok(db.GetTavolkozlesResults());
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

// Extra record a jelszócsere endpoint-hoz
namespace KandoTest
{
    public record ChangePasswordRequest(string Username, string OldPassword, string NewPassword);
    public record DeleteAccountRequest(string Email, string Jelszo);
    public record ResetPasswordRequest(string Email, string NewPassword);
    public record UpdateUserRequest(string Vezeteknev, string Keresztnev, string? Csoport, string? Evfolyam, string? Osztaly);
    public record PasswordResetRequestInput(string Email, string Nev, string? Osztaly, string? Csoport);
    public record SaveMegoldasRequest(string FeladatId, string Solution, string Hint1, string Hint2, string Hint3);
}
