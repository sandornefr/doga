using Microsoft.Data.Sqlite;

namespace KandoTest;

// IKT projektmunka beadások (9. évfolyam, pl. „Témaoldal”): tanulónként és feladatonként egy beadás,
// a feltöltött fájlok (html, css, kép) az adatbázisban, BLOB-ként.
public record IktFajlInfo(string Fajlnev, string Mime, long Meret);
public record IktBeadasInfo(
    int Id, string Email, string? Nev, string? Osztaly, string? Csoport, string Feladat,
    string? GithubUrl, string CreatedAt, string UpdatedAt, List<IktFajlInfo> Fajlok);
public record IktFajlUj(string Fajlnev, string Mime, byte[] Tartalom);
public record IktTemaKiosztas(int Id, string Email, string? Nev, string? Osztaly, string? Csoport, string Feladat, int TemaSorszam, string CreatedAt);

public partial class Database
{
    public void InitIktBeadas()
    {
        using var conn = Open();
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS ikt_beadas (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                email       TEXT NOT NULL,
                nev         TEXT,
                osztaly     TEXT,
                csoport     TEXT,
                feladat     TEXT NOT NULL,
                github_url  TEXT,
                created_at  TEXT DEFAULT (datetime('now','localtime')),
                updated_at  TEXT DEFAULT (datetime('now','localtime')),
                UNIQUE(email, feladat)
            );
            CREATE TABLE IF NOT EXISTS ikt_beadas_fajl (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                beadas_id   INTEGER NOT NULL,
                fajlnev     TEXT NOT NULL,
                mime        TEXT NOT NULL,
                meret       INTEGER NOT NULL,
                tartalom    BLOB NOT NULL,
                UNIQUE(beadas_id, fajlnev)
            );
            CREATE INDEX IF NOT EXISTS ix_ikt_beadas_fajl_beadas ON ikt_beadas_fajl(beadas_id);
            CREATE TABLE IF NOT EXISTS ikt_tema_kiosztas (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                email        TEXT NOT NULL,
                nev          TEXT,
                osztaly      TEXT,
                csoport      TEXT,
                feladat      TEXT NOT NULL,
                tema_sorszam INTEGER NOT NULL,
                created_at   TEXT DEFAULT (datetime('now','localtime')),
                UNIQUE(email, feladat)
            );
        ");
    }

    // Beadás mentése. Ha jöttek fájlok, a korábbiak helyére lépnek; ha csak link jött, a fájlok maradnak.
    public int SaveIktBeadas(string email, string? nev, string? osztaly, string? csoport,
        string feladat, string? githubUrl, List<IktFajlUj> fajlok)
    {
        using var conn = Open();
        using var tx = conn.BeginTransaction();
        int id;
        using (var cmd = conn.CreateCommand())
        {
            cmd.Transaction = tx;
            cmd.CommandText = @"
                INSERT INTO ikt_beadas (email, nev, osztaly, csoport, feladat, github_url)
                VALUES ($e,$n,$o,$c,$f,$g)
                ON CONFLICT(email, feladat) DO UPDATE SET
                    nev = $n, osztaly = $o, csoport = $c,
                    github_url = COALESCE($g, github_url),
                    updated_at = datetime('now','localtime');
                SELECT id FROM ikt_beadas WHERE email = $e AND feladat = $f;";
            cmd.Parameters.AddWithValue("$e", email);
            cmd.Parameters.AddWithValue("$n", (object?)nev ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$o", (object?)osztaly ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$c", (object?)csoport ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$f", feladat);
            cmd.Parameters.AddWithValue("$g", (object?)githubUrl ?? DBNull.Value);
            id = Convert.ToInt32(cmd.ExecuteScalar());
        }
        if (fajlok.Count > 0)
        {
            using (var del = conn.CreateCommand())
            {
                del.Transaction = tx;
                del.CommandText = "DELETE FROM ikt_beadas_fajl WHERE beadas_id = $id";
                del.Parameters.AddWithValue("$id", id);
                del.ExecuteNonQuery();
            }
            foreach (var f in fajlok)
            {
                using var ins = conn.CreateCommand();
                ins.Transaction = tx;
                ins.CommandText = @"
                    INSERT INTO ikt_beadas_fajl (beadas_id, fajlnev, mime, meret, tartalom)
                    VALUES ($id,$n,$m,$s,$t)
                    ON CONFLICT(beadas_id, fajlnev) DO UPDATE SET mime = $m, meret = $s, tartalom = $t";
                ins.Parameters.AddWithValue("$id", id);
                ins.Parameters.AddWithValue("$n", f.Fajlnev);
                ins.Parameters.AddWithValue("$m", f.Mime);
                ins.Parameters.AddWithValue("$s", f.Tartalom.LongLength);
                ins.Parameters.AddWithValue("$t", f.Tartalom);
                ins.ExecuteNonQuery();
            }
        }
        tx.Commit();
        return id;
    }

    public IktBeadasInfo? GetIktBeadas(int id) =>
        ReadIktBeadasok("WHERE b.id = $p", "$p", id).FirstOrDefault();

    public IktBeadasInfo? GetIktBeadasSajat(string email, string feladat) =>
        ReadIktBeadasok("WHERE b.email = $p AND b.feladat = $f", "$p", email, feladat).FirstOrDefault();

    public List<IktBeadasInfo> GetIktBeadasok(string feladat) =>
        ReadIktBeadasok("WHERE b.feladat = $p", "$p", feladat);

    private List<IktBeadasInfo> ReadIktBeadasok(string where, string pNev, object pErtek, string? feladat = null)
    {
        using var conn = Open();
        var lista = new List<IktBeadasInfo>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = $@"
                SELECT b.id, b.email, b.nev, b.osztaly, b.csoport, b.feladat, b.github_url, b.created_at, b.updated_at
                FROM ikt_beadas b {where}
                ORDER BY b.osztaly, b.csoport, b.nev";
            cmd.Parameters.AddWithValue(pNev, pErtek);
            if (feladat != null) cmd.Parameters.AddWithValue("$f", feladat);
            using var r = cmd.ExecuteReader();
            while (r.Read())
                lista.Add(new IktBeadasInfo(
                    r.GetInt32(0), r.GetString(1),
                    r.IsDBNull(2) ? null : r.GetString(2),
                    r.IsDBNull(3) ? null : r.GetString(3),
                    r.IsDBNull(4) ? null : r.GetString(4),
                    r.GetString(5),
                    r.IsDBNull(6) ? null : r.GetString(6),
                    r.IsDBNull(7) ? "" : r.GetString(7),
                    r.IsDBNull(8) ? "" : r.GetString(8),
                    new List<IktFajlInfo>()));
        }
        foreach (var b in lista)
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT fajlnev, mime, meret FROM ikt_beadas_fajl WHERE beadas_id = $id ORDER BY fajlnev";
            cmd.Parameters.AddWithValue("$id", b.Id);
            using var r = cmd.ExecuteReader();
            while (r.Read()) b.Fajlok.Add(new IktFajlInfo(r.GetString(0), r.GetString(1), r.GetInt64(2)));
        }
        return lista;
    }

    // Egy fájl tartalma; a fájlnév kis-nagybetű érzéketlen (Windows-on a tanuló nem figyel rá).
    public (string Mime, byte[] Tartalom)? GetIktFajl(int beadasId, string fajlnev)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT mime, tartalom FROM ikt_beadas_fajl
                            WHERE beadas_id = $id AND fajlnev = $n COLLATE NOCASE LIMIT 1";
        cmd.Parameters.AddWithValue("$id", beadasId);
        cmd.Parameters.AddWithValue("$n", fajlnev);
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;
        return (r.GetString(0), (byte[])r["tartalom"]);
    }

    // ── Témasorsolás ──────────────────────────────────────────────────────────
    private static readonly object IktTemaZar = new();

    // A tanuló témája: ha már van, azt adja; ha nincs, a csoportjában (osztály + csoport) még
    // szabad témák közül sorsol egyet; ha mind foglalt, bármelyiket. Zár + IMMEDIATE tranzakció,
    // hogy két egyszerre érkező tanuló ne kapja ugyanazt.
    public IktTemaKiosztas GetOrAssignIktTema(string email, string? nev, string? osztaly, string? csoport,
        string feladat, int temaDb)
    {
        lock (IktTemaZar)
        {
            using var conn = Open();
            using var tx = conn.BeginTransaction(deferred: false);
            var meglevo = ReadIktTemak(conn, tx, "WHERE email = $p AND feladat = $f", email, feladat).FirstOrDefault();
            if (meglevo != null) { tx.Commit(); return meglevo; }

            var foglalt = new HashSet<int>();
            using (var cmd = conn.CreateCommand())
            {
                cmd.Transaction = tx;
                cmd.CommandText = @"SELECT tema_sorszam FROM ikt_tema_kiosztas
                    WHERE feladat = $f AND osztaly IS $o AND csoport IS $c";
                cmd.Parameters.AddWithValue("$f", feladat);
                cmd.Parameters.AddWithValue("$o", (object?)osztaly ?? DBNull.Value);
                cmd.Parameters.AddWithValue("$c", (object?)csoport ?? DBNull.Value);
                using var r = cmd.ExecuteReader();
                while (r.Read()) foglalt.Add(r.GetInt32(0));
            }
            var szabad = Enumerable.Range(1, temaDb).Where(n => !foglalt.Contains(n)).ToList();
            if (szabad.Count == 0) szabad = Enumerable.Range(1, temaDb).ToList();
            var sorszam = szabad[Random.Shared.Next(szabad.Count)];

            using (var ins = conn.CreateCommand())
            {
                ins.Transaction = tx;
                ins.CommandText = @"INSERT INTO ikt_tema_kiosztas (email, nev, osztaly, csoport, feladat, tema_sorszam)
                                    VALUES ($e,$n,$o,$c,$f,$t)";
                ins.Parameters.AddWithValue("$e", email);
                ins.Parameters.AddWithValue("$n", (object?)nev ?? DBNull.Value);
                ins.Parameters.AddWithValue("$o", (object?)osztaly ?? DBNull.Value);
                ins.Parameters.AddWithValue("$c", (object?)csoport ?? DBNull.Value);
                ins.Parameters.AddWithValue("$f", feladat);
                ins.Parameters.AddWithValue("$t", sorszam);
                ins.ExecuteNonQuery();
            }
            var uj = ReadIktTemak(conn, tx, "WHERE email = $p AND feladat = $f", email, feladat).First();
            tx.Commit();
            return uj;
        }
    }

    public List<IktTemaKiosztas> GetIktTemak(string feladat)
    {
        using var conn = Open();
        return ReadIktTemak(conn, null, "WHERE feladat = $p", feladat, null);
    }

    public bool DeleteIktTema(int id)
    {
        lock (IktTemaZar)
        {
            using var conn = Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM ikt_tema_kiosztas WHERE id = $id";
            cmd.Parameters.AddWithValue("$id", id);
            return cmd.ExecuteNonQuery() > 0;
        }
    }

    private static List<IktTemaKiosztas> ReadIktTemak(SqliteConnection conn, SqliteTransaction? tx, string where, string p, string? f)
    {
        using var cmd = conn.CreateCommand();
        cmd.Transaction = tx;
        cmd.CommandText = $@"SELECT id, email, nev, osztaly, csoport, feladat, tema_sorszam, created_at
                             FROM ikt_tema_kiosztas {where} ORDER BY osztaly, csoport, nev";
        cmd.Parameters.AddWithValue("$p", p);
        if (f != null) cmd.Parameters.AddWithValue("$f", f);
        using var r = cmd.ExecuteReader();
        var lista = new List<IktTemaKiosztas>();
        while (r.Read())
            lista.Add(new IktTemaKiosztas(r.GetInt32(0), r.GetString(1),
                r.IsDBNull(2) ? null : r.GetString(2), r.IsDBNull(3) ? null : r.GetString(3),
                r.IsDBNull(4) ? null : r.GetString(4), r.GetString(5), r.GetInt32(6),
                r.IsDBNull(7) ? "" : r.GetString(7)));
        return lista;
    }
}
