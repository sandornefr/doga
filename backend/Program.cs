using System.Security.Cryptography;
using System.Text;
using KandoTest;

var builder = WebApplication.CreateBuilder(args);

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

// Adatbázis inicializálás
db.Initialize();

// Környezeti változók
var secretKey    = app.Configuration["SECRET_KEY"]    ?? "kando-secret-change-in-production!";
var adminEnvUser = app.Configuration["ADMIN_USERNAME"] ?? "admin";
var adminEnvPass = app.Configuration["ADMIN_PASSWORD"] ?? "kandooktato";

// Alapértelmezett admin létrehozása (ha még nincs a DB-ben)
if (db.GetPasswordHash(adminEnvUser) == null)
{
    db.UpsertTeacher(adminEnvUser, BCrypt.Net.BCrypt.HashPassword(adminEnvPass));
}

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

string CreateToken(string username)
{
    var payload = $"{username}:{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
    var sig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
    return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{payload}.{sig}"));
}

bool ValidateToken(HttpContext ctx)
{
    var auth = ctx.Request.Headers["Authorization"].FirstOrDefault();
    if (auth == null || !auth.StartsWith("Bearer ")) return false;
    try
    {
        var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(auth[7..]));
        var dot = decoded.LastIndexOf('.');
        var payload = decoded[..dot];
        var sig = decoded[(dot + 1)..];
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var expected = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        if (sig != expected) return false;
        var ts = long.Parse(payload.Split(':')[1]);
        return DateTimeOffset.UtcNow.ToUnixTimeSeconds() - ts < 86400; // 24 óra
    }
    catch { return false; }
}

bool ValidateOktato(HttpContext ctx)
{
    var auth = ctx.Request.Headers["Authorization"].FirstOrDefault();
    if (auth == null || !auth.StartsWith("Bearer ")) return false;
    try
    {
        var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(auth[7..]));
        var dot = decoded.LastIndexOf('.');
        var payload = decoded[..dot];
        var sig = decoded[(dot + 1)..];
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var expected = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        if (sig != expected) return false;
        var ts = long.Parse(payload.Split(':')[1]);
        if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() - ts >= 86400) return false;
        // Admin token (no pipe) OR oktato user token
        return !payload.Contains('|') || payload.Contains("|oktato");
    }
    catch { return false; }
}

// Oktatói regisztrációs kód (env változóból)
var teacherCode = app.Configuration["TEACHER_CODE"] ?? "kandooktato";

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
});

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

// Statisztikák (admin)
app.MapGet("/api/stats", (HttpContext ctx, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
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

    if (req.Szerep == "oktato" && req.OktatoiKod != teacherCode)
        return Results.BadRequest(new { error = "Hibás oktatói kód!" });

    var hash = BCrypt.Net.BCrypt.HashPassword(req.Jelszo);
    var normalizedReq = req with { Email = email };
    var success = db.RegisterUser(normalizedReq, hash);

    if (!success)
        return Results.BadRequest(new { error = "Ez az email cím már regisztrálva van!" });

    return Results.Ok(new { success = true, message = "Sikeres regisztráció!" });
});

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
        success  = true,
        token,
        szerep   = user.Szerep,
        nev      = $"{user.Vezeteknev} {user.Keresztnev}",
        email    = user.Email,
        evfolyam = user.Evfolyam,
        osztaly  = user.Osztaly,
        csoport  = user.Csoport
    });
});

// Felhasználók listája (csak admin)
app.MapGet("/api/users", (HttpContext ctx, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
    return Results.Ok(db.GetAllUsers());
});

// Felhasználó törlése admin által
app.MapDelete("/api/users/{email}", (HttpContext ctx, string email, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
    var deleted = db.DeleteUser(Uri.UnescapeDataString(email));
    return deleted ? Results.Ok(new { success = true }) : Results.NotFound();
});

// Felhasználó jelszavának visszaállítása admin által
app.MapPost("/api/users/reset-password", (HttpContext ctx, ResetPasswordRequest req, Database db) =>
{
    if (!ValidateToken(ctx)) return Results.Unauthorized();
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
});

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

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

// Extra record a jelszócsere endpoint-hoz
namespace KandoTest
{
    public record ChangePasswordRequest(string Username, string OldPassword, string NewPassword);
    public record DeleteAccountRequest(string Email, string Jelszo);
    public record ResetPasswordRequest(string Email, string NewPassword);
}
