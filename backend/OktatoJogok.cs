using Microsoft.Data.Sqlite;

namespace KandoTest;

// Oktatói jogosultságok (Réka kérése, 2026-11-14): az admin oktatónként beállítja, mely
// tananyag-csomagokat és extra szerepeket lát. Az admin (Réka) mindent kap, a táblában nincs sora.
// Csoportszűrés: a nem admin oktató csak az órarendjében szereplő csoportok tanulóit látja.
public record OktatoJogSor(string Email, string Nev, List<string> Jogok);
public record OktatoJogMentes(string Email, List<string>? Jogok);
public record LetezoCsoport(string Evfolyam, string Osztaly, string Csoport, int Letszam);

public partial class Database
{
    // Tananyag-csomagok és extra szerepek. Új kulcs: ide + a portal.html / admin.html listájába.
    public static readonly string[] OktatoCsomagok = { "python", "web", "ikt", "halozat", "interaktiv", "tavkozles" };
    public static readonly string[] OktatoExtraSzerepek = { "agazati_javito", "feladatkeszito" };
    public static IEnumerable<string> OktatoMindenJog => OktatoCsomagok.Concat(OktatoExtraSzerepek);

    public void InitOktatoJogok()
    {
        using var conn = Open();
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS oktato_jogok (
                email      TEXT NOT NULL,
                kulcs      TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                PRIMARY KEY (email, kulcs)
            );");
    }

    public List<string> GetOktatoJogok(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT kulcs FROM oktato_jogok WHERE email = $e ORDER BY kulcs";
        cmd.Parameters.AddWithValue("$e", email.Trim().ToLowerInvariant());
        var list = new List<string>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(r.GetString(0));
        return list;
    }

    // Minden oktató (szerep = oktato) a jogaival – az admin felület pipáihoz.
    public List<OktatoJogSor> GetOktatokJogokkal()
    {
        using var conn = Open();
        var jogok = new Dictionary<string, List<string>>();
        using (var c1 = conn.CreateCommand())
        {
            c1.CommandText = "SELECT email, kulcs FROM oktato_jogok ORDER BY kulcs";
            using var r = c1.ExecuteReader();
            while (r.Read())
            {
                var e = r.GetString(0);
                if (!jogok.TryGetValue(e, out var l)) jogok[e] = l = new List<string>();
                l.Add(r.GetString(1));
            }
        }
        var list = new List<OktatoJogSor>();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT LOWER(email), vezeteknev || ' ' || keresztnev FROM users
                            WHERE szerep = 'oktato' ORDER BY vezeteknev, keresztnev";
        using var rr = cmd.ExecuteReader();
        while (rr.Read())
        {
            var e = rr.GetString(0);
            list.Add(new OktatoJogSor(e, rr.GetString(1), jogok.TryGetValue(e, out var l) ? l : new List<string>()));
        }
        return list;
    }

    public bool LetezoOktato(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM users WHERE LOWER(email) = $e AND szerep = 'oktato'";
        cmd.Parameters.AddWithValue("$e", email.Trim().ToLowerInvariant());
        return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
    }

    // Egy oktató jogainak cseréje (tranzakcióban); csak ismert kulcs kerülhet be.
    public List<string> SetOktatoJogok(string email, IEnumerable<string> jogok)
    {
        var e = email.Trim().ToLowerInvariant();
        var tiszta = jogok.Select(j => (j ?? "").Trim().ToLowerInvariant())
                          .Where(j => OktatoMindenJog.Contains(j)).Distinct().OrderBy(j => j).ToList();
        using var conn = Open();
        using var tx = conn.BeginTransaction();
        using (var del = conn.CreateCommand())
        {
            del.Transaction = tx;
            del.CommandText = "DELETE FROM oktato_jogok WHERE email = $e";
            del.Parameters.AddWithValue("$e", e);
            del.ExecuteNonQuery();
        }
        foreach (var j in tiszta)
        {
            using var ins = conn.CreateCommand();
            ins.Transaction = tx;
            ins.CommandText = "INSERT INTO oktato_jogok (email, kulcs) VALUES ($e, $k)";
            ins.Parameters.AddWithValue("$e", e);
            ins.Parameters.AddWithValue("$k", j);
            ins.ExecuteNonQuery();
        }
        tx.Commit();
        return tiszta;
    }

    // Az oktató órarendjében (az adott tanév bármelyik félévében) szereplő csoportok tanulói (kisbetűs email).
    // Csoport nélküli órarend-sor (pl. 11. évfolyamtól) az egész osztályt jelenti.
    // Teszt Elek mindig benne van, hogy az oktató ki tudja próbálni a felületeit.
    public HashSet<string> OktatoTanuloi(string oktato, string tanev)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT LOWER(u.email) FROM users u
            WHERE u.szerep = 'tanulo' AND EXISTS (
                SELECT 1 FROM orarend o
                WHERE o.oktato = $o AND o.tanev = $t
                  AND o.evfolyam = COALESCE(u.evfolyam, '')
                  AND UPPER(o.osztaly) = UPPER(COALESCE(u.osztaly, ''))
                  AND (COALESCE(o.csoport, '') = '' OR LOWER(o.csoport) = LOWER(COALESCE(u.csoport, ''))))";
        cmd.Parameters.AddWithValue("$o", oktato.Trim().ToLowerInvariant());
        cmd.Parameters.AddWithValue("$t", tanev);
        var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "tesztelek@kkszki.hu" };
        using var r = cmd.ExecuteReader();
        while (r.Read()) set.Add(r.GetString(0));
        return set;
    }

    // A rendszerben létező (regisztrált tanulóval bíró) évfolyam/osztály/csoport kombinációk – az órarend választójához.
    public List<LetezoCsoport> LetezoCsoportok()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT COALESCE(evfolyam,''), UPPER(COALESCE(osztaly,'')), LOWER(COALESCE(csoport,'')), COUNT(*)
            FROM users
            WHERE szerep = 'tanulo' AND LOWER(email) NOT IN ('tesztelek@kkszki.hu','bot@kkszki.hu')
              AND COALESCE(evfolyam,'') <> '' AND COALESCE(osztaly,'') <> ''
            GROUP BY 1, 2, 3 ORDER BY 1, 2, 3";
        var list = new List<LetezoCsoport>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(new LetezoCsoport(r.GetString(0), r.GetString(1), r.GetString(2), r.GetInt32(3)));
        return list;
    }
}
