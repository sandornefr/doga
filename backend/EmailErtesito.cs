using System.Collections.Concurrent;
using System.Net;
using System.Net.Mail;

namespace KandoTest;

// E-mail értesítés a tanárnak, ha egy tanuló jelszó-visszaállítást kér.
// Beállítás környezeti változókkal (titok NEM kerül a kódba):
//   SMTP_HOST        pl.: smtp.gmail.com
//   SMTP_PORT        pl.: 587 (alapérték)
//   SMTP_USER        a küldő fiók (pl.: Gmail cím)
//   SMTP_PASS        a küldő fiók jelszava (Gmailnél alkalmazásjelszó)
//   SMTP_FROM        feladó cím (ha üres: SMTP_USER)
//   ERTESITES_EMAIL  ide megy az értesítés (több cím vesszővel)
// Ha bármelyik kötelező hiányzik, nem küld semmit, a rendszer ugyanúgy működik.
public static class EmailErtesito
{
    // Ugyanarról a fiókról legfeljebb 30 percenként egy levél.
    static readonly TimeSpan FiokSzunet = TimeSpan.FromMinutes(30);
    // Összesen legfeljebb ennyi levél óránként (ha valaki teleküldené a postafiókot).
    const int OrankentiMax = 20;

    static readonly ConcurrentDictionary<string, DateTime> utolsoKuldes = new(StringComparer.OrdinalIgnoreCase);
    static readonly Queue<DateTime> kuldesek = new();
    static readonly object zar = new();

    public static bool Bekapcsolva(IConfiguration cfg) =>
        !string.IsNullOrWhiteSpace(cfg["SMTP_HOST"]) &&
        !string.IsNullOrWhiteSpace(cfg["SMTP_USER"]) &&
        !string.IsNullOrWhiteSpace(cfg["SMTP_PASS"]) &&
        !string.IsNullOrWhiteSpace(cfg["ERTESITES_EMAIL"]);

    // Háttérben küld, a tanuló kérését nem lassítja és hiba esetén sem töri el.
    public static void JelszoKeresErtesites(IConfiguration cfg, string email, string nev, string? osztaly, string? csoport)
    {
        if (!Bekapcsolva(cfg)) return;
        if (!SzabadKuldeni(email)) return;

        var targy = $"Jelszó-visszaállítási kérés: {nev}";
        var sorok = new List<string>
        {
            "Új jelszó-visszaállítási kérés érkezett.",
            "",
            $"Név: {nev}",
            $"E-mail: {email}",
        };
        if (!string.IsNullOrEmpty(osztaly)) sorok.Add($"Osztály: {osztaly}");
        if (!string.IsNullOrEmpty(csoport)) sorok.Add($"Csoport: {csoport}");
        sorok.Add($"Időpont: {MagyarIdo():yyyy.MM.dd. HH:mm}");
        sorok.Add("");
        sorok.Add("A kérést az admin felületen, a jelszó-kérelmeknél tudod kezelni.");
        sorok.Add("");
        sorok.Add("(Ezt a levelet a DTSZR rendszer küldte automatikusan.)");
        var szoveg = string.Join("\n", sorok);

        _ = Task.Run(async () =>
        {
            try { await Kuld(cfg, targy, szoveg); }
            catch (Exception ex) { Console.WriteLine($"[email] Értesítés küldése sikertelen: {ex.Message}"); }
        });
    }

    // Próbalevél a beállítás ellenőrzéséhez (admin felületről hívható).
    public static async Task<(bool ok, string uzenet)> Probalevel(IConfiguration cfg)
    {
        if (!Bekapcsolva(cfg)) return (false, "Az e-mail küldés nincs beállítva (SMTP_HOST, SMTP_USER, SMTP_PASS, ERTESITES_EMAIL).");
        try
        {
            await Kuld(cfg, "DTSZR próbalevél", $"Ha ezt a levelet megkaptad, az e-mail értesítés működik.\n\nIdőpont: {MagyarIdo():yyyy.MM.dd. HH:mm}");
            return (true, "Próbalevél elküldve.");
        }
        catch (Exception ex) { return (false, $"Küldési hiba: {ex.Message}"); }
    }

    static bool SzabadKuldeni(string email)
    {
        var most = DateTime.UtcNow;
        lock (zar)
        {
            if (utolsoKuldes.TryGetValue(email, out var utolso) && most - utolso < FiokSzunet) return false;
            while (kuldesek.Count > 0 && most - kuldesek.Peek() > TimeSpan.FromHours(1)) kuldesek.Dequeue();
            if (kuldesek.Count >= OrankentiMax) return false;
            kuldesek.Enqueue(most);
            utolsoKuldes[email] = most;
            return true;
        }
    }

    static async Task Kuld(IConfiguration cfg, string targy, string szoveg)
    {
        var host = cfg["SMTP_HOST"]!;
        var port = int.TryParse(cfg["SMTP_PORT"], out var p) ? p : 587;
        var user = cfg["SMTP_USER"]!;
        var pass = cfg["SMTP_PASS"]!;
        var from = string.IsNullOrWhiteSpace(cfg["SMTP_FROM"]) ? user : cfg["SMTP_FROM"]!;

        using var msg = new MailMessage
        {
            From = new MailAddress(from, "DTSZR"),
            Subject = targy,
            Body = szoveg,
            IsBodyHtml = false,
            BodyEncoding = System.Text.Encoding.UTF8,
            SubjectEncoding = System.Text.Encoding.UTF8,
        };
        foreach (var cim in cfg["ERTESITES_EMAIL"]!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            msg.To.Add(cim);

        using var smtp = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, pass),
            Timeout = 20000,
        };
        await smtp.SendMailAsync(msg);
    }

    static DateTime MagyarIdo()
    {
        try { return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Europe/Budapest")); }
        catch { return DateTime.Now; }
    }
}
