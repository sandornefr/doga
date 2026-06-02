using Microsoft.Data.Sqlite;

namespace KandoTest;

public class Database
{
    private readonly string _connStr;

    public Database(string dbPath)
    {
        _connStr = $"Data Source={dbPath}";
    }

    public void Initialize()
    {
        using var conn = Open();
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                vezeteknev    TEXT NOT NULL,
                keresztnev    TEXT NOT NULL,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                szerep        TEXT NOT NULL DEFAULT 'tanulo',
                evfolyam      TEXT,
                osztaly       TEXT,
                csoport       TEXT,
                created_at    TEXT DEFAULT (datetime('now', 'localtime'))
            );
            CREATE TABLE IF NOT EXISTS submissions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT NOT NULL,
                email       TEXT NOT NULL,
                osztaly     TEXT,
                csoport     TEXT,
                task_ids    TEXT,
                scores      TEXT,
                max_scores  TEXT,
                total_score INTEGER,
                max_total   INTEGER,
                duration    INTEGER,
                mode        TEXT,
                code_snapshot TEXT,
                submitted_at  TEXT DEFAULT (datetime('now', 'localtime'))
            );
            CREATE TABLE IF NOT EXISTS config (
                key   TEXT PRIMARY KEY,
                value TEXT
            );
            CREATE TABLE IF NOT EXISTS teachers (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                username      TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            );
            INSERT OR IGNORE INTO config (key, value) VALUES ('test_mode', 'practice');
            INSERT OR IGNORE INTO config (key, value) VALUES ('vizsga_kezdes', '');
            INSERT OR IGNORE INTO config (key, value) VALUES ('vizsga_vege', '');
            CREATE TABLE IF NOT EXISTS task_sets (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                nev           TEXT NOT NULL,
                tipus         TEXT NOT NULL DEFAULT 'vizsga',
                python_szoveg TEXT,
                web_zip_b64   TEXT,
                aktiv         INTEGER NOT NULL DEFAULT 0,
                letrehozva    TEXT DEFAULT (datetime('now', 'localtime'))
            );
            CREATE TABLE IF NOT EXISTS progress (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                email     TEXT NOT NULL,
                nev       TEXT,
                osztaly   TEXT,
                targy     TEXT NOT NULL,
                feladat   TEXT NOT NULL,
                pont      INTEGER NOT NULL,
                max_pont  INTEGER NOT NULL,
                datum     TEXT DEFAULT (date('now', 'localtime'))
            );
            CREATE TABLE IF NOT EXISTS task_ratings (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                email        TEXT NOT NULL,
                feladat_nev  TEXT NOT NULL,
                tipus        TEXT NOT NULL,
                ertek        INTEGER NOT NULL,
                created_at   TEXT DEFAULT (datetime('now','localtime')),
                UNIQUE(email, feladat_nev, tipus)
            );
            CREATE TABLE IF NOT EXISTS user_state (
                email       TEXT NOT NULL,
                state_key   TEXT NOT NULL,
                state_value TEXT,
                updated_at  TEXT DEFAULT (datetime('now','localtime')),
                PRIMARY KEY (email, state_key)
            );
            CREATE TABLE IF NOT EXISTS otlet_lada (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                email               TEXT NOT NULL,
                nev                 TEXT NOT NULL,
                osztaly             TEXT,
                szoveg              TEXT NOT NULL,
                tipus               TEXT NOT NULL DEFAULT 'otlet',
                kep_base64          TEXT,
                statusz             TEXT NOT NULL DEFAULT 'uj',
                admin_valasz        TEXT,
                megvalositva_szoveg TEXT,
                created_at          TEXT DEFAULT (datetime('now','localtime')),
                updated_at          TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS tesztelok (
                email      TEXT PRIMARY KEY,
                added_at   TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS feladatkeszitok (
                email      TEXT PRIMARY KEY,
                added_at   TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS feladat_javaslatok (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                email               TEXT NOT NULL,
                nev                 TEXT NOT NULL DEFAULT '',
                osztaly             TEXT,
                cim                 TEXT NOT NULL,
                pont                INTEGER NOT NULL,
                tipus               TEXT NOT NULL,
                szoveg              TEXT NOT NULL,
                megoldas            TEXT,
                statusz             TEXT NOT NULL DEFAULT 'uj',
                visszajelzes        TEXT,
                megvalositva_szoveg TEXT,
                created_at          TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS teszteloi_uzenetek (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                szoveg     TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS teszteloi_uzenet_olvasott (
                uzenet_id  INTEGER NOT NULL,
                email      TEXT NOT NULL,
                PRIMARY KEY (uzenet_id, email)
            );
            CREATE TABLE IF NOT EXISTS teszteloi_kervenyok (
                email      TEXT PRIMARY KEY,
                nev        TEXT NOT NULL DEFAULT '',
                osztaly    TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS sessions (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email     TEXT NOT NULL,
                page           TEXT NOT NULL,
                login_at       TEXT NOT NULL DEFAULT (datetime('now','localtime')),
                last_heartbeat TEXT NOT NULL DEFAULT (datetime('now','localtime')),
                logout_at      TEXT,
                duration_sec   INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS duels (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                challenger_email   TEXT NOT NULL,
                challenger_nev     TEXT NOT NULL DEFAULT '',
                opponent_email     TEXT NOT NULL,
                opponent_nev       TEXT NOT NULL DEFAULT '',
                task_number        INTEGER NOT NULL,
                task_title         TEXT NOT NULL DEFAULT '',
                status             TEXT NOT NULL DEFAULT 'pending',
                challenger_score   INTEGER,
                challenger_max     INTEGER,
                challenger_time    INTEGER,
                opponent_score     INTEGER,
                opponent_max       INTEGER,
                opponent_time      INTEGER,
                winner_email       TEXT,
                created_at         TEXT NOT NULL DEFAULT (datetime('now','localtime')),
                accepted_at        TEXT,
                finished_at        TEXT
            );
            CREATE TABLE IF NOT EXISTS chat_messages (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_email   TEXT NOT NULL,
                sender_nev     TEXT NOT NULL DEFAULT '',
                sender_szerep  TEXT NOT NULL DEFAULT '',
                message        TEXT NOT NULL,
                channel        TEXT NOT NULL DEFAULT 'tesztelok',
                created_at     TEXT NOT NULL DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS password_reset_requests (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                email      TEXT NOT NULL,
                nev        TEXT NOT NULL,
                osztaly    TEXT,
                csoport    TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
        ");
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS tavolkozles_results (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                nev             TEXT NOT NULL,
                datum           TEXT NOT NULL,
                felhasznalt_ido TEXT,
                helyes          INTEGER NOT NULL,
                helytelen       INTEGER NOT NULL,
                ures            INTEGER NOT NULL,
                osszesen        INTEGER NOT NULL,
                szazalek        INTEGER NOT NULL,
                valaszok_json   TEXT NOT NULL DEFAULT '[]',
                submitted_at    TEXT DEFAULT (datetime('now','localtime'))
            );
        ");
        try { Exec(conn, "ALTER TABLE submissions ADD COLUMN subject TEXT"); } catch { }
        try { Exec(conn, "ALTER TABLE progress ADD COLUMN mode TEXT DEFAULT 'gyakorlo'"); } catch { }
        try { Exec(conn, "ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0"); } catch { }
        try { Exec(conn, "ALTER TABLE otlet_lada ADD COLUMN tipus TEXT NOT NULL DEFAULT 'otlet'"); } catch { }
        try { Exec(conn, "ALTER TABLE progress ADD COLUMN cel_honap INTEGER"); } catch { }
        try { Exec(conn, "ALTER TABLE szamonkeres ADD COLUMN perc_limit INTEGER NOT NULL DEFAULT 60"); } catch { }
        try { Exec(conn, "ALTER TABLE szamonkeres ADD COLUMN started_at TEXT"); } catch { }
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS password_reset_codes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                email      TEXT NOT NULL,
                code       TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                used       INTEGER NOT NULL DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
        ");
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS havijegyek (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                email               TEXT NOT NULL,
                ev                  INTEGER NOT NULL,
                honap               INTEGER NOT NULL,
                jegy                INTEGER,
                python_szaz         REAL NOT NULL DEFAULT 0,
                web_szaz            REAL NOT NULL DEFAULT 0,
                quiz_szaz           REAL NOT NULL DEFAULT 0,
                aktiv_napok         INTEGER NOT NULL DEFAULT 0,
                otlet_db            INTEGER NOT NULL DEFAULT 0,
                tananyag_db         INTEGER NOT NULL DEFAULT 0,
                ossz_szaz           REAL NOT NULL DEFAULT 0,
                szorgalmi_jelolt    INTEGER NOT NULL DEFAULT 0,
                szorgalmi_jegy_db   INTEGER NOT NULL DEFAULT 0,
                dicseret_javasolt   INTEGER NOT NULL DEFAULT 0,
                veglegesitve        INTEGER NOT NULL DEFAULT 0,
                tanari_megjegyzes   TEXT,
                updated_at          TEXT DEFAULT (datetime('now')),
                UNIQUE(email, ev, honap)
            );
        ");
        try { Exec(conn, "ALTER TABLE teszteloi_uzenetek ADD COLUMN recipient_email TEXT"); } catch { }
        try { Exec(conn, "ALTER TABLE havijegyek ADD COLUMN halozat_szaz REAL NOT NULL DEFAULT 0"); } catch { }
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS quiz_results (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                nev          TEXT NOT NULL,
                email        TEXT,
                osztaly      TEXT,
                csoport      TEXT,
                tipus        TEXT NOT NULL,
                pont         INTEGER NOT NULL,
                max_pont     INTEGER NOT NULL,
                szazalek     INTEGER NOT NULL,
                jegy         INTEGER,
                ido_mp       INTEGER,
                submitted_at TEXT DEFAULT (datetime('now', 'localtime'))
            );
            CREATE TABLE IF NOT EXISTS szamonkeres (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                oktato_email TEXT NOT NULL,
                cim          TEXT NOT NULL,
                csoportok    TEXT NOT NULL DEFAULT '[]',
                feladatok    TEXT NOT NULL DEFAULT '[]',
                ponthatarak  TEXT NOT NULL DEFAULT '{}',
                statusz      TEXT NOT NULL DEFAULT 'varakozas',
                perc_limit   INTEGER NOT NULL DEFAULT 60,
                started_at   TEXT,
                created_at   TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS szamonkeres_beadas (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                szamonkeres_id   INTEGER NOT NULL,
                tanulo_email     TEXT NOT NULL,
                tanulo_nev       TEXT NOT NULL,
                osztaly          TEXT,
                csoport          TEXT,
                feladat_id       TEXT NOT NULL,
                kod              TEXT,
                auto_pont        INTEGER NOT NULL DEFAULT 0,
                manualis_pont    INTEGER,
                max_pont         INTEGER NOT NULL DEFAULT 0,
                megjegyzes       TEXT,
                submitted_at     TEXT DEFAULT (datetime('now','localtime'))
            );
        ");
    }

    // ── Számonkérés ───────────────────────────────────────────────────────────

    public int SaveSzamonkeres(SzamonkeresCreateRequest req, string oktatoEmail)
    {
        using var conn = Open();
        // Meglévő DB-nél pótoljuk az új oszlopokat ha még nem léteznek
        foreach (var col in new[] {
            "ALTER TABLE szamonkeres ADD COLUMN perc_limit INTEGER NOT NULL DEFAULT 60",
            "ALTER TABLE szamonkeres ADD COLUMN started_at TEXT"
        }) {
            try { using var a = conn.CreateCommand(); a.CommandText = col; a.ExecuteNonQuery(); } catch {}
        }
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO szamonkeres
            (oktato_email,cim,csoportok,feladatok,ponthatarak,perc_limit,statusz)
            VALUES ($email,$cim,$cs,$fj,$ph,$pl,'varakozas')";
        cmd.Parameters.AddWithValue("$email", oktatoEmail);
        cmd.Parameters.AddWithValue("$cim",   req.Cim);
        cmd.Parameters.AddWithValue("$cs",    req.Csoportok);
        cmd.Parameters.AddWithValue("$fj",    req.Feladatok);
        cmd.Parameters.AddWithValue("$ph",    req.Ponthatarak);
        cmd.Parameters.AddWithValue("$pl",    req.PercLimit);
        cmd.ExecuteNonQuery();
        using var id = conn.CreateCommand();
        id.CommandText = "SELECT last_insert_rowid()";
        return (int)(long)id.ExecuteScalar()!;
    }

    public bool InditSzamonkeres(int id, string oktatoEmail)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"UPDATE szamonkeres
            SET statusz='aktiv', started_at=datetime('now','localtime')
            WHERE id=$id AND oktato_email=$email AND statusz='varakozas'";
        cmd.Parameters.AddWithValue("$id",    id);
        cmd.Parameters.AddWithValue("$email", oktatoEmail);
        return cmd.ExecuteNonQuery() > 0;
    }

    public bool LezarSzamonkeres(int id, string oktatoEmail)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"UPDATE szamonkeres SET statusz='lezart'
            WHERE id=$id AND oktato_email=$email AND statusz='aktiv'";
        cmd.Parameters.AddWithValue("$id",    id);
        cmd.Parameters.AddWithValue("$email", oktatoEmail);
        return cmd.ExecuteNonQuery() > 0;
    }

    public List<SzamonkeresItem> GetSzamonkeresekByOktato(string oktatoEmail)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT s.id,s.cim,s.oktato_email,s.csoportok,s.feladatok,s.ponthatarak,s.statusz,s.created_at,
                   COUNT(b.id) as beadasok,
                   COALESCE(s.started_at,'') as started_at, COALESCE(s.perc_limit,60) as perc_limit
            FROM szamonkeres s
            LEFT JOIN szamonkeres_beadas b ON b.szamonkeres_id = s.id
            WHERE s.oktato_email = $email
            GROUP BY s.id ORDER BY s.created_at DESC";
        cmd.Parameters.AddWithValue("$email", oktatoEmail);
        return ReadSzamonkeresItems(cmd);
    }

    public SzamonkeresItem? GetSzamonkeres(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT s.id,s.cim,s.oktato_email,s.csoportok,s.feladatok,s.ponthatarak,s.statusz,s.created_at,
                   COUNT(b.id) as beadasok,
                   COALESCE(s.started_at,'') as started_at, COALESCE(s.perc_limit,60) as perc_limit
            FROM szamonkeres s
            LEFT JOIN szamonkeres_beadas b ON b.szamonkeres_id = s.id
            WHERE s.id = $id GROUP BY s.id";
        cmd.Parameters.AddWithValue("$id", id);
        return ReadSzamonkeresItems(cmd).FirstOrDefault();
    }

    public List<SzamonkeresItem> GetAktivSzamonkeresForStudent(string email, string? osztaly, string? csoport)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id,cim,oktato_email,csoportok,feladatok,ponthatarak,statusz,created_at,0 as beadasok,
                   COALESCE(started_at,'') as started_at, COALESCE(perc_limit,60) as perc_limit
            FROM szamonkeres WHERE statusz IN ('varakozas','aktiv')";
        var all = ReadSzamonkeresItems(cmd);
        // Filter in C# — csoportok is JSON array, match osztaly+csoport, osztaly, or individual email
        return all.Where(s => {
            var cs = System.Text.Json.JsonSerializer.Deserialize<List<string>>(s.Csoportok) ?? new();
            var tanuloCsoport = string.IsNullOrEmpty(osztaly) ? null
                : string.IsNullOrEmpty(csoport) ? osztaly
                : $"{osztaly}/{csoport}";
            return cs.Any(c =>
                // Csoport alapú egyezés
                (tanuloCsoport != null &&
                 (c.Equals(tanuloCsoport, StringComparison.OrdinalIgnoreCase) ||
                  c.Equals(osztaly, StringComparison.OrdinalIgnoreCase))) ||
                // Egyéni tanuló email alapú egyezés (pl. "email:tanuloname@kkszki.hu")
                c.Equals($"email:{email}", StringComparison.OrdinalIgnoreCase));
        }).ToList();
    }

    private static List<SzamonkeresItem> ReadSzamonkeresItems(SqliteCommand cmd)
    {
        var list = new List<SzamonkeresItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new SzamonkeresItem {
                Id            = r.GetInt32(0),
                Cim           = r.GetString(1),
                OktatoEmail   = r.GetString(2),
                Csoportok     = r.GetString(3),
                Feladatok     = r.GetString(4),
                Ponthatarak   = r.GetString(5),
                Statusz       = r.GetString(6),
                CreatedAt     = r.GetString(7),
                BeadasokSzama = r.GetInt32(8),
                StartedAt     = r.IsDBNull(9) ? null : r.GetString(9),
                PercLimit     = r.IsDBNull(10) ? 60 : r.GetInt32(10)
            });
        return list;
    }

    public List<BeadasItem> GetBeadasok(int szamonkeresId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT id,szamonkeres_id,tanulo_email,tanulo_nev,osztaly,csoport,
            feladat_id,kod,auto_pont,manualis_pont,max_pont,megjegyzes,submitted_at
            FROM szamonkeres_beadas WHERE szamonkeres_id=$id ORDER BY submitted_at DESC";
        cmd.Parameters.AddWithValue("$id", szamonkeresId);
        return ReadBeadasok(cmd);
    }

    public List<BeadasItem> GetTanuloBeadasok(int szamonkeresId, string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT id,szamonkeres_id,tanulo_email,tanulo_nev,osztaly,csoport,
            feladat_id,kod,auto_pont,manualis_pont,max_pont,megjegyzes,submitted_at
            FROM szamonkeres_beadas WHERE szamonkeres_id=$id AND LOWER(tanulo_email)=LOWER($email)";
        cmd.Parameters.AddWithValue("$id",    szamonkeresId);
        cmd.Parameters.AddWithValue("$email", email);
        return ReadBeadasok(cmd);
    }

    public bool BeadasExists(int szamonkeresId, string email, string feladatId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM szamonkeres_beadas WHERE szamonkeres_id=$id AND LOWER(tanulo_email)=LOWER($email) AND feladat_id=$fid";
        cmd.Parameters.AddWithValue("$id",    szamonkeresId);
        cmd.Parameters.AddWithValue("$email", email);
        cmd.Parameters.AddWithValue("$fid",   feladatId);
        return (long)cmd.ExecuteScalar()! > 0;
    }

    public int SaveBeadas(int szamonkeresId, BeadasCreateRequest req)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO szamonkeres_beadas
            (szamonkeres_id,tanulo_email,tanulo_nev,osztaly,csoport,feladat_id,kod,auto_pont,max_pont)
            VALUES ($sid,$email,$nev,$osz,$cso,$fid,$kod,$ap,$mp)";
        cmd.Parameters.AddWithValue("$sid",   szamonkeresId);
        cmd.Parameters.AddWithValue("$email", req.TanuloEmail);
        cmd.Parameters.AddWithValue("$nev",   req.TanuloNev);
        cmd.Parameters.AddWithValue("$osz",   (object?)req.Osztaly  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$cso",   (object?)req.Csoport  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$fid",   req.FeladatId);
        cmd.Parameters.AddWithValue("$kod",   (object?)req.Kod      ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$ap",    req.AutoPont);
        cmd.Parameters.AddWithValue("$mp",    req.MaxPont);
        cmd.ExecuteNonQuery();
        using var id = conn.CreateCommand();
        id.CommandText = "SELECT last_insert_rowid()";
        return (int)(long)id.ExecuteScalar()!;
    }

    public bool SetBeadasPont(int beadasId, int pont, string? megjegyzes)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE szamonkeres_beadas SET manualis_pont=$p,megjegyzes=$m WHERE id=$id";
        cmd.Parameters.AddWithValue("$p",   pont);
        cmd.Parameters.AddWithValue("$m",   (object?)megjegyzes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$id",  beadasId);
        return cmd.ExecuteNonQuery() > 0;
    }

    public bool SetSzamonkeresStatusz(int id, string statusz, string oktatoEmail)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE szamonkeres SET statusz=$s WHERE id=$id AND oktato_email=$email";
        cmd.Parameters.AddWithValue("$s",     statusz);
        cmd.Parameters.AddWithValue("$id",    id);
        cmd.Parameters.AddWithValue("$email", oktatoEmail);
        return cmd.ExecuteNonQuery() > 0;
    }

    public List<object> GetKiadottEredmenyek(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT s.id,s.cim,s.ponthatarak,s.created_at,
                   COALESCE(SUM(COALESCE(b.manualis_pont,b.auto_pont)),0) as ossz,
                   COALESCE(SUM(b.max_pont),0) as maxp
            FROM szamonkeres s
            JOIN szamonkeres_beadas b ON b.szamonkeres_id=s.id
            WHERE s.statusz='kiadva' AND LOWER(b.tanulo_email)=LOWER($email)
            GROUP BY s.id ORDER BY s.created_at DESC";
        cmd.Parameters.AddWithValue("$email", email);
        var list = new List<object>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var ossz = r.GetInt32(4);
            var maxp = r.GetInt32(5);
            var szaz = maxp > 0 ? (int)Math.Round(ossz * 100.0 / maxp) : 0;
            list.Add(new {
                szamonkeresId = r.GetInt32(0),
                cim           = r.GetString(1),
                ponthatarak   = r.GetString(2),
                createdAt     = r.GetString(3),
                osszPont      = ossz,
                maxPont       = maxp,
                szazalek      = szaz
            });
        }
        return list;
    }

    private static List<BeadasItem> ReadBeadasok(SqliteCommand cmd)
    {
        var list = new List<BeadasItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new BeadasItem {
                Id            = r.GetInt32(0),
                SzamonkeresId = r.GetInt32(1),
                TanuloEmail   = r.GetString(2),
                TanuloNev     = r.GetString(3),
                Osztaly       = r.IsDBNull(4)  ? null : r.GetString(4),
                Csoport       = r.IsDBNull(5)  ? null : r.GetString(5),
                FeladatId     = r.GetString(6),
                Kod           = r.IsDBNull(7)  ? null : r.GetString(7),
                AutoPont      = r.GetInt32(8),
                ManualisPont  = r.IsDBNull(9)  ? null : r.GetInt32(9),
                MaxPont       = r.GetInt32(10),
                Megjegyzes    = r.IsDBNull(11) ? null : r.GetString(11),
                SubmittedAt   = r.GetString(12)
            });
        return list;
    }

    // ── Config ────────────────────────────────────────────────────────────────

    public string? GetConfig(string key)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT value FROM config WHERE key = $key";
        cmd.Parameters.AddWithValue("$key", key);
        return cmd.ExecuteScalar()?.ToString();
    }

    public void SetConfig(string key, string value)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR REPLACE INTO config (key, value) VALUES ($key, $value)";
        cmd.Parameters.AddWithValue("$key", key);
        cmd.Parameters.AddWithValue("$value", value);
        cmd.ExecuteNonQuery();
    }

    // ── Submissions ───────────────────────────────────────────────────────────

    public int SaveSubmission(SubmissionRequest r)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO submissions
                (name, email, osztaly, csoport, task_ids, scores, max_scores,
                 total_score, max_total, duration, mode, code_snapshot, subject)
            VALUES
                ($name, $email, $osztaly, $csoport, $task_ids, $scores, $max_scores,
                 $total_score, $max_total, $duration, $mode, $code_snapshot, $subject);
            SELECT last_insert_rowid();";

        cmd.Parameters.AddWithValue("$name",          r.Name);
        cmd.Parameters.AddWithValue("$email",         r.Email);
        cmd.Parameters.AddWithValue("$osztaly",       r.Osztaly ?? "");
        cmd.Parameters.AddWithValue("$csoport",       (object?)r.Csoport ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$task_ids",      r.TaskIds);
        cmd.Parameters.AddWithValue("$scores",        r.Scores);
        cmd.Parameters.AddWithValue("$max_scores",    r.MaxScores);
        cmd.Parameters.AddWithValue("$total_score",   r.TotalScore);
        cmd.Parameters.AddWithValue("$max_total",     r.MaxTotal);
        cmd.Parameters.AddWithValue("$duration",      r.Duration);
        cmd.Parameters.AddWithValue("$mode",          r.Mode);
        cmd.Parameters.AddWithValue("$code_snapshot", (object?)r.CodeSnapshot ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$subject",       r.Subject ?? "");

        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<Submission> GetSubmissions(string? osztaly = null, string? csoport = null, string? subject = null, string? mode = null)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();

        var where = new List<string>();
        // 0 pontos gyakorló beadások sosem hasznosak – ezeket kizárjuk
        where.Add("NOT (mode = 'practice' AND total_score = 0)");
        if (osztaly != null) { where.Add("osztaly = $osztaly"); cmd.Parameters.AddWithValue("$osztaly", osztaly); }
        if (csoport != null) { where.Add("csoport = $csoport"); cmd.Parameters.AddWithValue("$csoport", csoport); }
        if (subject != null) { where.Add("subject = $subject"); cmd.Parameters.AddWithValue("$subject", subject); }
        if (mode != null) { where.Add("mode = $mode"); cmd.Parameters.AddWithValue("$mode", mode); }

        cmd.CommandText = $@"
            SELECT id, name, email, osztaly, csoport, task_ids, scores, max_scores,
                   total_score, max_total, duration, mode, subject, submitted_at
            FROM submissions
            {(where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "")}
            ORDER BY submitted_at DESC";

        return ReadSubmissions(cmd, includeCode: false);
    }

    public Submission? GetSubmission(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, name, email, osztaly, csoport, task_ids, scores, max_scores,
                   total_score, max_total, duration, mode, subject, code_snapshot, submitted_at
            FROM submissions WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        return ReadSubmissions(cmd, includeCode: true).FirstOrDefault();
    }

    public bool UpdateSubmissionScores(int id, string scores, string maxScores, int totalScore, int maxTotal)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE submissions SET scores = $scores, max_scores = $maxScores, total_score = $totalScore, max_total = $maxTotal WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.Parameters.AddWithValue("$scores", scores);
        cmd.Parameters.AddWithValue("$maxScores", maxScores);
        cmd.Parameters.AddWithValue("$totalScore", totalScore);
        cmd.Parameters.AddWithValue("$maxTotal", maxTotal);
        return cmd.ExecuteNonQuery() > 0;
    }

    public void DeleteSubmission(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM submissions WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.ExecuteNonQuery();
    }

    public int DeleteSubmissions(string? osztaly, string? csoport, string? subject, string? mode)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        var where = new List<string>();
        if (osztaly != null) { where.Add("osztaly = $osztaly"); cmd.Parameters.AddWithValue("$osztaly", osztaly); }
        if (csoport != null) { where.Add("csoport = $csoport"); cmd.Parameters.AddWithValue("$csoport", csoport); }
        if (subject != null) { where.Add("subject = $subject"); cmd.Parameters.AddWithValue("$subject", subject); }
        if (mode    != null) { where.Add("mode = $mode");       cmd.Parameters.AddWithValue("$mode", mode); }
        cmd.CommandText = $"DELETE FROM submissions {(where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "")}";
        return cmd.ExecuteNonQuery();
    }

    public Stats GetStats()
    {
        using var conn = Open();

        var stats = new Stats();

        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN date(submitted_at) = date('now', 'localtime') THEN 1 ELSE 0 END) as today,
                    AVG(duration) as avg_dur,
                    AVG(CAST(total_score AS REAL) / NULLIF(max_total, 0) * 100) as avg_pct
                FROM submissions";
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                stats.TotalSubmissions  = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
                stats.TodaySubmissions  = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                stats.AvgDuration       = reader.IsDBNull(2) ? 0 : Math.Round(reader.GetDouble(2));
                stats.AvgScore          = reader.IsDBNull(3) ? 0 : Math.Round(reader.GetDouble(3), 1);
            }
        }

        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT osztaly, COUNT(*) as cnt,
                       AVG(CAST(total_score AS REAL) / NULLIF(max_total, 0) * 100) as avg_pct
                FROM submissions GROUP BY osztaly ORDER BY osztaly";
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                stats.ByClass.Add(new ClassStat
                {
                    Osztaly  = reader.IsDBNull(0) ? "" : reader.GetString(0),
                    Count    = reader.GetInt32(1),
                    AvgScore = reader.IsDBNull(2) ? 0 : Math.Round(reader.GetDouble(2), 1)
                });
            }
        }

        return stats;
    }

    // ── Teachers ──────────────────────────────────────────────────────────────

    public void UpsertTeacher(string username, string passwordHash)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO teachers (username, password_hash) VALUES ($u, $h)
            ON CONFLICT(username) DO UPDATE SET password_hash = $h";
        cmd.Parameters.AddWithValue("$u", username);
        cmd.Parameters.AddWithValue("$h", passwordHash);
        cmd.ExecuteNonQuery();
    }

    public string? GetPasswordHash(string username)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT password_hash FROM teachers WHERE username = $u";
        cmd.Parameters.AddWithValue("$u", username);
        return cmd.ExecuteScalar()?.ToString();
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public void UpsertUser(string vezeteknev, string keresztnev, string email, string passwordHash, string szerep)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO users (vezeteknev, keresztnev, email, password_hash, szerep)
            VALUES ($v, $k, $e, $ph, $s)
            ON CONFLICT(email) DO NOTHING";
        cmd.Parameters.AddWithValue("$v",  vezeteknev);
        cmd.Parameters.AddWithValue("$k",  keresztnev);
        cmd.Parameters.AddWithValue("$e",  email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$ph", passwordHash);
        cmd.Parameters.AddWithValue("$s",  szerep);
        cmd.ExecuteNonQuery();
    }

    public bool RegisterUser(RegisterRequest r, string passwordHash)
    {
        var szerep = (r.Szerep ?? "tanulo").Trim().ToLowerInvariant();
        if (szerep != "tanulo" && szerep != "oktato")
            szerep = "tanulo";

        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT OR IGNORE INTO users
                (vezeteknev, keresztnev, email, password_hash, szerep, evfolyam, osztaly, csoport)
            VALUES ($v, $k, $e, $ph, $s, $ev, $o, $cs);
            SELECT changes();";
        cmd.Parameters.AddWithValue("$v",  r.Vezeteknev);
        cmd.Parameters.AddWithValue("$k",  r.Keresztnev);
        cmd.Parameters.AddWithValue("$e",  r.Email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$ph", passwordHash);
        cmd.Parameters.AddWithValue("$s",  szerep);
        cmd.Parameters.AddWithValue("$ev", (object?)r.Evfolyam ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$o",  (object?)r.Osztaly  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$cs", (object?)r.Csoport  ?? DBNull.Value);
        return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
    }

    public UserRecord? GetUserByEmail(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, vezeteknev, keresztnev, email, password_hash,
                   szerep, evfolyam, osztaly, csoport, must_change_password
            FROM users WHERE email = $e";
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;
        return new UserRecord(
            r.GetInt32(0),
            r.GetString(1), r.GetString(2), r.GetString(3), r.GetString(4),
            r.GetString(5),
            r.IsDBNull(6) ? null : r.GetString(6),
            r.IsDBNull(7) ? null : r.GetString(7),
            r.IsDBNull(8) ? null : r.GetString(8),
            r.IsDBNull(9) ? false : r.GetInt32(9) == 1
        );
    }

    public bool DeleteUser(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM users WHERE email = $e";
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public bool UpdateUserBasic(string email, string vezeteknev, string keresztnev, string? csoport, string? evfolyam, string? osztaly)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE users SET vezeteknev = $v, keresztnev = $k, csoport = $c, evfolyam = $ef, osztaly = $o WHERE email = $e";
        cmd.Parameters.AddWithValue("$v", vezeteknev);
        cmd.Parameters.AddWithValue("$k", keresztnev);
        cmd.Parameters.AddWithValue("$c", (object?)csoport ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$ef", (object?)evfolyam ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$o", (object?)osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public bool ResetUserPassword(string email, string newHash)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE users SET password_hash = $h, must_change_password = 1 WHERE email = $e";
        cmd.Parameters.AddWithValue("$h", newHash);
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public List<UserListItem> GetAllUsers()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT vezeteknev, keresztnev, email, szerep, evfolyam, osztaly, csoport, created_at
            FROM users ORDER BY osztaly, csoport, vezeteknev, keresztnev";
        using var r = cmd.ExecuteReader();
        var list = new List<UserListItem>();
        while (r.Read())
            list.Add(new UserListItem(
                $"{r.GetString(0)} {r.GetString(1)}",
                r.GetString(2),
                r.GetString(3),
                r.IsDBNull(4) ? null : r.GetString(4),
                r.IsDBNull(5) ? null : r.GetString(5),
                r.IsDBNull(6) ? null : r.GetString(6),
                r.IsDBNull(7) ? null : r.GetString(7),
                r.GetString(0),
                r.GetString(1)
            ));
        return list;
    }

    // ── Progress ──────────────────────────────────────────────────────────────

    public void SaveProgress(ProgressRequest r)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO progress (email, nev, osztaly, targy, feladat, pont, max_pont, mode, datum)
            VALUES ($email, $nev, $osztaly, $targy, $feladat, $pont, $max_pont, $mode, datetime('now', 'localtime'))";
        cmd.Parameters.AddWithValue("$email",   r.Email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$nev",     (object?)r.Nev     ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$osztaly", (object?)r.Osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$targy",   r.Targy.ToLower());
        cmd.Parameters.AddWithValue("$feladat", r.Feladat);
        cmd.Parameters.AddWithValue("$pont",    r.Pont);
        cmd.Parameters.AddWithValue("$max_pont",r.MaxPont);
        cmd.Parameters.AddWithValue("$mode",    r.Mode ?? "gyakorlo");
        cmd.ExecuteNonQuery();
    }

    public StudentProgress GetStudentProgress(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT targy, pont, max_pont, datum
            FROM progress WHERE email = $email ORDER BY datum DESC";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());

        var records = new List<(string targy, int pont, int maxPont, string datum)>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            records.Add((r.GetString(0), r.GetInt32(1), r.GetInt32(2),
                         r.IsDBNull(3) ? "" : r.GetString(3)));

        return new StudentProgress(
            CalcSubjectProgress(records.Where(x => x.targy == "web").ToList()),
            CalcSubjectProgress(records.Where(x => x.targy == "python").ToList())
        );
    }

    public List<ProgressSummaryItem> GetAllProgressSummary()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT email, nev, osztaly, targy, pont, max_pont, datum
            FROM progress ORDER BY email, datum DESC";

        var raw = new Dictionary<string, (string? nev, string? osztaly,
            List<(string targy, int pont, int maxPont, string datum)> rows)>();

        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var email   = r.GetString(0);
            var nev     = r.IsDBNull(1) ? null : r.GetString(1);
            var osztaly = r.IsDBNull(2) ? null : r.GetString(2);
            var targy   = r.GetString(3);
            var pont    = r.GetInt32(4);
            var maxPont = r.GetInt32(5);
            var datum   = r.IsDBNull(6) ? "" : r.GetString(6);

            if (!raw.ContainsKey(email))
                raw[email] = (nev, osztaly, new());
            raw[email].rows.Add((targy, pont, maxPont, datum));
        }

        return raw.Select(kv => new ProgressSummaryItem
        {
            Email   = kv.Key,
            Nev     = kv.Value.nev,
            Osztaly = kv.Value.osztaly,
            Web     = CalcSubjectProgress(kv.Value.rows.Where(x => x.targy == "web").ToList()),
            Python  = CalcSubjectProgress(kv.Value.rows.Where(x => x.targy == "python").ToList())
        }).OrderBy(x => x.Osztaly).ThenBy(x => x.Nev).ToList();
    }

    private static SubjectProgress CalcSubjectProgress(
        List<(string targy, int pont, int maxPont, string datum)> records)
    {
        if (records.Count == 0) return new SubjectProgress(0, 0, 0, null);
        var pcts = records.Select(x => x.maxPont > 0 ? (double)x.pont / x.maxPont * 100 : 0).ToList();
        return new SubjectProgress(
            records.Count,
            Math.Round(pcts.Average(), 1),
            Math.Round(pcts.Max(), 1),
            records.First().datum
        );
    }

    // ── Task Sets ─────────────────────────────────────────────────────────────

    public int SaveTaskSet(TaskSetRequest r)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO task_sets (nev, tipus, python_szoveg, web_zip_b64)
            VALUES ($nev, $tipus, $py, $web);
            SELECT last_insert_rowid();";
        cmd.Parameters.AddWithValue("$nev",   r.Nev);
        cmd.Parameters.AddWithValue("$tipus", r.Tipus ?? "vizsga");
        cmd.Parameters.AddWithValue("$py",    (object?)r.PythonSzoveg ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$web",   (object?)r.WebZipB64    ?? DBNull.Value);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<TaskSetItem> GetTaskSets()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, nev, tipus, aktiv,
                   (python_szoveg IS NOT NULL AND python_szoveg != '') as has_python,
                   (web_zip_b64   IS NOT NULL AND web_zip_b64   != '') as has_web,
                   letrehozva
            FROM task_sets ORDER BY letrehozva DESC";
        var list = new List<TaskSetItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new TaskSetItem
            {
                Id         = r.GetInt32(0),
                Nev        = r.GetString(1),
                Tipus      = r.IsDBNull(2) ? "vizsga" : r.GetString(2),
                Aktiv      = r.GetInt32(3) == 1,
                HasPython  = r.GetInt32(4) == 1,
                HasWeb     = r.GetInt32(5) == 1,
                Letrehozva = r.IsDBNull(6) ? null : r.GetString(6)
            });
        return list;
    }

    // tipus: "gyakorlo" | "live" | "vizsga"
    public TaskSetDetail? GetActiveTaskSet(string tipus)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, nev, tipus, python_szoveg, web_zip_b64, letrehozva
            FROM task_sets WHERE aktiv = 1 AND tipus = $tipus LIMIT 1";
        cmd.Parameters.AddWithValue("$tipus", tipus);
        return ReadTaskSetDetail(cmd);
    }

    public TaskSetDetail? GetTaskSet(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, nev, tipus, python_szoveg, web_zip_b64, letrehozva
            FROM task_sets WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        return ReadTaskSetDetail(cmd);
    }

    public bool SetActiveTaskSet(int id)
    {
        using var conn = Open();
        // Csak az ugyanolyan típusú feladatsorok közül deaktiválja a többit
        using var getCmd = conn.CreateCommand();
        getCmd.CommandText = "SELECT tipus FROM task_sets WHERE id = $id";
        getCmd.Parameters.AddWithValue("$id", id);
        var tipus = getCmd.ExecuteScalar()?.ToString();
        if (tipus == null) return false;

        using var deactCmd = conn.CreateCommand();
        deactCmd.CommandText = "UPDATE task_sets SET aktiv = 0 WHERE tipus = $tipus";
        deactCmd.Parameters.AddWithValue("$tipus", tipus);
        deactCmd.ExecuteNonQuery();

        using var actCmd = conn.CreateCommand();
        actCmd.CommandText = "UPDATE task_sets SET aktiv = 1 WHERE id = $id";
        actCmd.Parameters.AddWithValue("$id", id);
        return actCmd.ExecuteNonQuery() > 0;
    }

    public bool DeleteTaskSet(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM task_sets WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        return cmd.ExecuteNonQuery() > 0;
    }

    private static TaskSetDetail? ReadTaskSetDetail(SqliteCommand cmd)
    {
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;
        return new TaskSetDetail
        {
            Id           = r.GetInt32(0),
            Nev          = r.GetString(1),
            Tipus        = r.IsDBNull(2) ? "vizsga" : r.GetString(2),
            PythonSzoveg = r.IsDBNull(3) ? null : r.GetString(3),
            WebZipB64    = r.IsDBNull(4) ? null : r.GetString(4),
            Letrehozva   = r.IsDBNull(5) ? null : r.GetString(5)
        };
    }

    public List<LeaderboardItem> GetLeaderboard(string? osztaly, string? csoport, string? mode)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();

        var where = new List<string>();
        if (mode != null)   { where.Add("p.mode = $mode");                             cmd.Parameters.AddWithValue("$mode",    mode); }
        if (osztaly != null){ where.Add("LOWER(COALESCE(p.osztaly,'')) = LOWER($o)");  cmd.Parameters.AddWithValue("$o",       osztaly); }
        if (csoport != null){ where.Add("LOWER(COALESCE(u.csoport,'')) = LOWER($cs)"); cmd.Parameters.AddWithValue("$cs",      csoport); }

        cmd.CommandText = $@"
            SELECT
                p.email,
                MAX(p.nev)     as nev,
                MAX(p.osztaly) as osztaly,
                u.csoport,
                p.targy,
                COUNT(*)       as sessions,
                ROUND(AVG(CAST(p.pont AS REAL) / NULLIF(p.max_pont,0) * 100), 1) as avg_pct,
                ROUND(MAX(CAST(p.pont AS REAL) / NULLIF(p.max_pont,0) * 100), 1) as best_pct,
                MAX(p.datum)   as last_session
            FROM progress p
            LEFT JOIN users u ON LOWER(p.email) = LOWER(u.email)
            {(where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "")}
            GROUP BY p.email, p.targy
            ORDER BY p.email";

        var raw = new Dictionary<string, (string? nev, string? osztaly, string? csoport,
            List<(string targy, int sessions, double avgPct, double bestPct, string? lastSession)> subjects)>();

        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var email   = r.GetString(0);
            var nev     = r.IsDBNull(1) ? null : r.GetString(1);
            var osz     = r.IsDBNull(2) ? null : r.GetString(2);
            var cs      = r.IsDBNull(3) ? null : r.GetString(3);
            var targy   = r.GetString(4);
            var sess    = r.GetInt32(5);
            var avgPct  = r.IsDBNull(6) ? 0.0 : r.GetDouble(6);
            var bestPct = r.IsDBNull(7) ? 0.0 : r.GetDouble(7);
            var last    = r.IsDBNull(8) ? null : r.GetString(8);
            if (!raw.ContainsKey(email))
                raw[email] = (nev, osz, cs, new());
            raw[email].subjects.Add((targy, sess, avgPct, bestPct, last));
        }

        var items = raw.Select(kv =>
        {
            var wd = kv.Value.subjects.FirstOrDefault(x => x.targy == "web");
            var pd = kv.Value.subjects.FirstOrDefault(x => x.targy == "python");
            var web = wd != default
                ? new SubjectProgress(wd.sessions, wd.avgPct, wd.bestPct, wd.lastSession)
                : new SubjectProgress(0, 0, 0, null);
            var py = pd != default
                ? new SubjectProgress(pd.sessions, pd.avgPct, pd.bestPct, pd.lastSession)
                : new SubjectProgress(0, 0, 0, null);
            var wp = CompScore(web.AvgPercent, web.Sessions);
            var pp = CompScore(py.AvgPercent, py.Sessions);
            return new LeaderboardItem
            {
                Email      = kv.Key,
                Nev        = kv.Value.nev,
                Osztaly    = kv.Value.osztaly,
                Csoport    = kv.Value.csoport,
                Web        = web,
                Python     = py,
                WebPont    = Math.Round(wp, 1),
                PythonPont = Math.Round(pp, 1),
                OsszesPont = Math.Round((wp + pp) / 2, 1)
            };
        }).OrderByDescending(x => x.OsszesPont).ToList();

        for (int i = 0; i < items.Count; i++) items[i].Rank = i + 1;

        var streaks = GetAllStreaks();
        foreach (var item in items)
            if (streaks.TryGetValue(item.Email.ToLower(), out var s)) item.Streak = s;

        return items;
    }

    public StudentRankResult GetStudentRank(string email)
    {
        var user     = GetUserByEmail(email);
        var csoport  = user?.Csoport;
        var osztaly  = user?.Osztaly;
        var evfolyam = user?.Evfolyam;

        var (wcso, pcso) = csoport != null && osztaly != null && evfolyam != null
            ? GetRankInScope(email,
                "LOWER(COALESCE(u.evfolyam,''))=LOWER($ef) AND LOWER(COALESCE(u.osztaly,''))=LOWER($o) AND LOWER(COALESCE(u.csoport,''))=LOWER($cs)",
                new() { {"$ef", evfolyam}, {"$o", osztaly}, {"$cs", csoport} }, $"{evfolyam}.{osztaly}/{csoport}-es csoport")
            : (null, null);

        var (wosz, posz) = osztaly != null && evfolyam != null
            ? GetRankInScope(email,
                "LOWER(COALESCE(u.evfolyam,''))=LOWER($ef) AND LOWER(COALESCE(u.osztaly,''))=LOWER($o)",
                new() { {"$ef", evfolyam}, {"$o", osztaly} }, $"{evfolyam}.{osztaly} osztály")
            : (null, null);

        var (wevf, pevf) = evfolyam != null
            ? GetRankInScope(email, "LOWER(COALESCE(u.evfolyam,''))=LOWER($ef)",
                new() { {"$ef", evfolyam} }, $"{evfolyam}. évfolyam")
            : (null, null);

        var (wkando, pkando) = GetRankInScope(email, null, new(), "Kandó");

        var qcso  = csoport != null && osztaly != null && evfolyam != null
            ? GetQuizRankInScope(email,
                "LOWER(COALESCE(u.evfolyam,''))=LOWER($ef) AND LOWER(COALESCE(u.osztaly,''))=LOWER($o) AND LOWER(COALESCE(u.csoport,''))=LOWER($cs)",
                new() { {"$ef", evfolyam}, {"$o", osztaly}, {"$cs", csoport} }, $"{evfolyam}.{osztaly}/{csoport}-es csoport")
            : null;
        var qosz  = osztaly != null && evfolyam != null
            ? GetQuizRankInScope(email,
                "LOWER(COALESCE(u.evfolyam,''))=LOWER($ef) AND LOWER(COALESCE(u.osztaly,''))=LOWER($o)",
                new() { {"$ef", evfolyam}, {"$o", osztaly} }, $"{evfolyam}.{osztaly} osztály")
            : null;
        var qevf  = evfolyam != null
            ? GetQuizRankInScope(email, "LOWER(COALESCE(u.evfolyam,''))=LOWER($ef)",
                new() { {"$ef", evfolyam} }, $"{evfolyam}. évfolyam")
            : null;
        var qkando = GetQuizRankInScope(email, null, new(), "Kandó");

        return new StudentRankResult(
            new ThreeScopeRanks(wcso, wosz, wevf, wkando),
            new ThreeScopeRanks(pcso, posz, pevf, pkando),
            new ThreeScopeRanks(qcso, qosz, qevf, qkando),
            GetStreak(email)
        );
    }

    private RankInfo? GetQuizRankInScope(
        string email, string? whereClause,
        Dictionary<string, string?> parms, string groupLabel)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();

        foreach (var kv in parms)
            cmd.Parameters.AddWithValue(kv.Key, (object?)kv.Value ?? DBNull.Value);

        cmd.CommandText = $@"
            SELECT qr.email, MAX(qr.szazalek) as best_pct
            FROM quiz_results qr
            LEFT JOIN users u ON LOWER(qr.email) = LOWER(u.email)
            WHERE qr.email IS NOT NULL AND qr.email != ''
            {(whereClause != null ? "AND " + whereClause : "")}
            GROUP BY qr.email";

        var results = new List<(string email, int best)>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            results.Add((r.GetString(0), r.IsDBNull(1) ? 0 : r.GetInt32(1)));

        results = results.OrderByDescending(x => x.best).ToList();
        var idx = results.FindIndex(x => x.email.Equals(email, StringComparison.OrdinalIgnoreCase));
        if (idx < 0) return null;

        return new RankInfo(idx + 1, results.Count, groupLabel, results[idx].best);
    }

    private (RankInfo? web, RankInfo? python) GetRankInScope(
        string email, string? whereClause,
        Dictionary<string, string?> parms, string groupLabel)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();

        foreach (var kv in parms)
            cmd.Parameters.AddWithValue(kv.Key, (object?)kv.Value ?? DBNull.Value);

        cmd.CommandText = $@"
            SELECT p.email, p.targy,
                ROUND(AVG(CAST(p.pont AS REAL) / NULLIF(p.max_pont,0) * 100), 1) as avg_pct,
                COUNT(*) as sessions
            FROM progress p
            LEFT JOIN users u ON LOWER(p.email) = LOWER(u.email)
            {(whereClause != null ? "WHERE " + whereClause : "")}
            GROUP BY p.email, p.targy";

        var web = new List<(string email, double avg, int sess)>();
        var py  = new List<(string email, double avg, int sess)>();

        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var e    = r.GetString(0);
            var t    = r.GetString(1);
            var avg  = r.IsDBNull(2) ? 0.0 : r.GetDouble(2);
            var sess = r.GetInt32(3);
            if (t == "web") web.Add((e, avg, sess));
            else            py.Add((e, avg, sess));
        }

        web = web.OrderByDescending(x => CompScore(x.avg, x.sess)).ToList();
        py  = py .OrderByDescending(x => CompScore(x.avg, x.sess)).ToList();

        var wi = web.FindIndex(x => x.email.Equals(email, StringComparison.OrdinalIgnoreCase));
        var pi = py .FindIndex(x => x.email.Equals(email, StringComparison.OrdinalIgnoreCase));
        var mw = wi >= 0 ? web[wi] : default;
        var mp = pi >= 0 ? py [pi] : default;

        return (
            wi >= 0 ? new RankInfo(wi + 1, web.Count, groupLabel, mw.avg) : null,
            pi >= 0 ? new RankInfo(pi + 1, py.Count,  groupLabel, mp.avg) : null
        );
    }

    private static double CompScore(double avgPct, int sessions) =>
        avgPct * 0.7 + Math.Min(sessions, 20) / 20.0 * 30.0;

    public List<CompletionStatItem> GetCompletionStats()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT
                u.email,
                u.vezeteknev || ' ' || u.keresztnev AS nev,
                u.evfolyam, u.osztaly, u.csoport,
                MAX(CASE WHEN s.state_key='tananyag_html'          THEN s.state_value END),
                MAX(CASE WHEN s.state_key='tananyag_css'           THEN s.state_value END),
                MAX(CASE WHEN s.state_key='tananyag_bootstrap'     THEN s.state_value END),
                (SELECT CASE WHEN COUNT(DISTINCT tipus) >= 3 THEN MIN(submitted_at) ELSE NULL END
                 FROM quiz_results WHERE LOWER(email)=LOWER(u.email) AND tipus IN ('html','css','bootstrap')),
                (SELECT MIN(datum) FROM progress
                 WHERE LOWER(email)=LOWER(u.email) AND targy='web'
                 AND feladat IN ('bogyos','humanoid','baglyok','egijelensegek','evmadarai','gombak','hobbiallatok','hullok','tropusi_gyumolcsok')),
                MAX(CASE WHEN s.state_key='python_kezdo'           THEN s.state_value END),
                MAX(CASE WHEN s.state_key='python_halado'          THEN s.state_value END),
                (SELECT MIN(datum) FROM progress
                 WHERE LOWER(email)=LOWER(u.email) AND targy='python')
            FROM users u
            LEFT JOIN user_state s ON LOWER(u.email) = LOWER(s.email)
            WHERE u.szerep = 'tanulo'
            GROUP BY u.email
            ORDER BY u.evfolyam, u.osztaly, u.csoport, u.vezeteknev, u.keresztnev";

        var list = new List<CompletionStatItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new CompletionStatItem {
                Email              = r.GetString(0),
                Nev                = r.IsDBNull(1)  ? null : r.GetString(1),
                Evfolyam           = r.IsDBNull(2)  ? null : r.GetString(2),
                Osztaly            = r.IsDBNull(3)  ? null : r.GetString(3),
                Csoport            = r.IsDBNull(4)  ? null : r.GetString(4),
                TananyagHtml       = r.IsDBNull(5)  ? null : r.GetString(5),
                TananyagCss        = r.IsDBNull(6)  ? null : r.GetString(6),
                TananyagBootstrap  = r.IsDBNull(7)  ? null : r.GetString(7),
                WebTudasproba      = r.IsDBNull(8)  ? null : r.GetString(8),
                WebAgazati         = r.IsDBNull(9)  ? null : r.GetString(9),
                PythonKezdo        = r.IsDBNull(10) ? null : r.GetString(10),
                PythonHalado       = r.IsDBNull(11) ? null : r.GetString(11),
                PythonAgazatiDone  = r.IsDBNull(12) ? null : r.GetString(12),
            });
        return list;
    }

    // ── Oktatói haladás dashboard ────────────────────────────────────────────

    static readonly string HaladasBaseSql = @"
        SELECT
            u.vezeteknev || ' ' || u.keresztnev AS nev,
            u.email, u.evfolyam, u.osztaly, u.csoport,
            MAX(CASE WHEN s.state_key='tananyag_html'          THEN s.state_value END),
            MAX(CASE WHEN s.state_key='tananyag_css'           THEN s.state_value END),
            MAX(CASE WHEN s.state_key='tananyag_bootstrap'     THEN s.state_value END),
            MAX(CASE WHEN s.state_key='tananyag_emmet'         THEN s.state_value END),
            MAX(CASE WHEN s.state_key='tananyag_javascript'    THEN s.state_value END),
            MAX(CASE WHEN s.state_key='tananyag_devtools'      THEN s.state_value END),
            MAX(CASE WHEN s.state_key='python_kezdo'           THEN s.state_value END),
            MAX(CASE WHEN s.state_key='python_halado'          THEN s.state_value END),
            MAX(CASE WHEN s.state_key='python_pro_algoritmus'  THEN s.state_value END),
            COALESCE(py.sessions,0), COALESCE(py.avg_pct,0), COALESCE(py.best_pct,0), py.last_date,
            COALESCE(wb.sessions,0), COALESCE(wb.avg_pct,0), COALESCE(wb.best_pct,0), wb.last_date,
            COALESCE(wag.sessions,0),
            COALESCE(ikt.db,0), COALESCE(ikt.best_pct,0),
            COALESCE(tp.best_pct,0),
            sess.last_login
        FROM users u
        LEFT JOIN user_state s ON LOWER(u.email)=LOWER(s.email)
        LEFT JOIN (
            SELECT LOWER(user_email) as email, MAX(login_at) as last_login
            FROM sessions GROUP BY LOWER(user_email)
        ) sess ON LOWER(u.email)=sess.email
        LEFT JOIN (
            SELECT email, COUNT(*) as sessions,
                   ROUND(AVG(CAST(pont AS REAL)/NULLIF(max_pont,0)*100),1) as avg_pct,
                   ROUND(MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100),1) as best_pct,
                   MAX(datum) as last_date
            FROM progress WHERE targy='python' GROUP BY LOWER(email)
        ) py ON LOWER(u.email)=LOWER(py.email)
        LEFT JOIN (
            SELECT email, COUNT(*) as sessions,
                   ROUND(AVG(CAST(pont AS REAL)/NULLIF(max_pont,0)*100),1) as avg_pct,
                   ROUND(MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100),1) as best_pct,
                   MAX(datum) as last_date
            FROM progress WHERE targy='web' GROUP BY LOWER(email)
        ) wb ON LOWER(u.email)=LOWER(wb.email)
        LEFT JOIN (
            SELECT LOWER(email) as email, COUNT(*) as sessions
            FROM progress
            WHERE targy='web' AND feladat IN (
                'bogyos','humanoid','baglyok','egijelensegek','evmadarai',
                'gombak','hobbiallatok','hullok','tropusi_gyumolcsok')
            GROUP BY LOWER(email)
        ) wag ON LOWER(u.email)=wag.email
        LEFT JOIN (
            SELECT LOWER(email) as email, COUNT(*) as db,
                   ROUND(MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100),1) as best_pct
            FROM quiz_results WHERE tipus='interaktiv' GROUP BY LOWER(email)
        ) ikt ON LOWER(u.email)=ikt.email
        LEFT JOIN (
            SELECT LOWER(email) as email,
                   ROUND(MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100),1) as best_pct
            FROM quiz_results WHERE tipus IN ('html','css','bootstrap') GROUP BY LOWER(email)
        ) tp ON LOWER(u.email)=tp.email
        WHERE u.szerep='tanulo'";

    static HaladasItem ReadHaladasRow(Microsoft.Data.Sqlite.SqliteDataReader r)
    {
        // col 0-4: nev, email, evfolyam, osztaly, csoport
        // col 5-9:  tananyag_html/css/bootstrap/emmet/javascript
        // col 10:   tananyag_devtools
        // col 11-13: python_kezdo, python_halado, python_pro_algoritmus
        // col 14-17: py sessions/avg/best/last
        // col 18-21: wb sessions/avg/best/last
        // col 22: wag sessions (web ágazati 9 feladat)
        // col 23-24: ikt db, ikt best_pct
        // col 25: tp best_pct
        // col 26: last_login (sessions tábla)
        var th = r.IsDBNull(5)  ? null : r.GetString(5);
        var tc = r.IsDBNull(6)  ? null : r.GetString(6);
        var tb = r.IsDBNull(7)  ? null : r.GetString(7);
        var te = r.IsDBNull(8)  ? null : r.GetString(8);
        var tj = r.IsDBNull(9)  ? null : r.GetString(9);
        var td = r.IsDBNull(10) ? null : r.GetString(10);
        var pk = r.IsDBNull(11) ? null : r.GetString(11);
        var ph = r.IsDBNull(12) ? null : r.GetString(12);
        var pp = r.IsDBNull(13) ? null : r.GetString(13);
        var pyLast    = r.IsDBNull(17) ? null : r.GetString(17);
        var wbLast    = r.IsDBNull(21) ? null : r.GetString(21);
        var lastLogin = r.IsDBNull(26) ? null : r.GetString(26);
        var dates = new[] { th, tc, tb, te, tj, td, pk, ph, pp, pyLast, wbLast, lastLogin }
                        .Where(d => d != null).ToList();
        string? lastActive = dates.Count > 0 ? dates.Max() : null;
        return new HaladasItem {
            Nev                = r.IsDBNull(0) ? null : r.GetString(0),
            Email              = r.GetString(1),
            Evfolyam           = r.IsDBNull(2) ? null : r.GetString(2),
            Osztaly            = r.IsDBNull(3) ? null : r.GetString(3),
            Csoport            = r.IsDBNull(4) ? null : r.GetString(4),
            TananyagHtml       = th,
            TananyagCss        = tc,
            TananyagBootstrap  = tb,
            TananyagEmmet      = te,
            TananyagJavascript = tj,
            TananyagDevtools   = td,
            PythonKezdo        = pk,
            PythonHalado       = ph,
            PythonProAlgoritmus= pp,
            PythonSessions     = r.GetInt32(14),
            PythonAvgPct       = r.GetDouble(15),
            PythonBestPct      = r.GetDouble(16),
            PythonLastDate     = pyLast,
            WebSessions        = r.GetInt32(18),
            WebAvgPct          = r.GetDouble(19),
            WebBestPct         = r.GetDouble(20),
            WebLastDate        = wbLast,
            WebAgazatiSessions = r.GetInt32(22),
            InteraktivDb       = r.GetInt32(23),
            InteraktivBestPct  = r.GetDouble(24),
            TudasproBestPct    = r.GetDouble(25),
            LastActive         = lastActive
        };
    }

    public object GetKotelezoStats(string? evfolyam, string? osztaly, string? csoport)
    {
        var all = GetHaladasByOsztaly(null);
        var scope = all.Where(s =>
            (evfolyam == null || string.Equals(s.Evfolyam, evfolyam, StringComparison.OrdinalIgnoreCase)) &&
            (osztaly  == null || string.Equals(s.Osztaly,  osztaly,  StringComparison.OrdinalIgnoreCase)) &&
            (csoport  == null || string.Equals(s.Csoport,  csoport,  StringComparison.OrdinalIgnoreCase))
        ).ToList();
        int total = scope.Count;
        if (total == 0) return new { total = 0, items = Array.Empty<object>() };
        var keys = new[] {
            ("tananyagHtml",      "HTML tananyag"),
            ("tananyagCss",       "CSS tananyag"),
            ("tananyagBootstrap", "Bootstrap tananyag"),
            ("webAgazati",        "Ágazati WEB feladatok"),
            ("tudasproBest",      "Tudáspróba"),
            ("pythonKezdo",       "Python Kezdő szint"),
            ("pythonHalado",      "Python Haladó szint"),
            ("pythonSessions",    "Python Ágazati feladatok"),
            ("interaktiv",        "Interaktív teszt"),
        };
        var items = keys.Select(k => {
            int done = k.Item1 switch {
                "tananyagHtml"      => scope.Count(s => s.TananyagHtml      != null),
                "tananyagCss"       => scope.Count(s => s.TananyagCss       != null),
                "tananyagBootstrap" => scope.Count(s => s.TananyagBootstrap != null),
                "webAgazati"        => scope.Count(s => s.WebAgazatiSessions > 0),
                "tudasproBest"      => scope.Count(s => s.TudasproBestPct   > 0),
                "pythonKezdo"       => scope.Count(s => s.PythonKezdo       != null),
                "pythonHalado"      => scope.Count(s => s.PythonHalado      != null),
                "pythonSessions"    => scope.Count(s => s.PythonSessions     > 0),
                "interaktiv"        => scope.Count(s => s.InteraktivDb       > 0),
                _                   => 0
            };
            return new { key = k.Item1, label = k.Item2, done, total, pct = total > 0 ? (int)Math.Round(done * 100.0 / total) : 0 };
        }).ToArray();
        return new { total, items };
    }

    public List<HaladasItem> GetHaladasByOsztaly(string? osztaly)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        if (!string.IsNullOrEmpty(osztaly))
        {
            cmd.CommandText = HaladasBaseSql +
                " AND LOWER(u.osztaly)=LOWER($o) GROUP BY u.email ORDER BY u.vezeteknev,u.keresztnev";
            cmd.Parameters.AddWithValue("$o", osztaly);
        }
        else
        {
            cmd.CommandText = HaladasBaseSql +
                " GROUP BY u.email ORDER BY u.osztaly,u.vezeteknev,u.keresztnev";
        }
        var list = new List<HaladasItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(ReadHaladasRow(r));
        return list;
    }

    public HaladasTanuloDetail? GetHaladasTanuloDetail(string email)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = HaladasBaseSql +
            " AND LOWER(u.email)=LOWER($e) GROUP BY u.email";
        cmd.Parameters.AddWithValue("$e", email);
        HaladasTanuloDetail? item = null;
        using (var r = cmd.ExecuteReader())
        {
            if (r.Read())
            {
                var base_ = ReadHaladasRow(r);
                item = new HaladasTanuloDetail {
                    Email=base_.Email, Nev=base_.Nev, Evfolyam=base_.Evfolyam,
                    Osztaly=base_.Osztaly, Csoport=base_.Csoport,
                    TananyagHtml=base_.TananyagHtml, TananyagCss=base_.TananyagCss,
                    TananyagBootstrap=base_.TananyagBootstrap, TananyagEmmet=base_.TananyagEmmet,
                    TananyagJavascript=base_.TananyagJavascript,
                    PythonSessions=base_.PythonSessions, PythonAvgPct=base_.PythonAvgPct,
                    PythonBestPct=base_.PythonBestPct, PythonLastDate=base_.PythonLastDate,
                    WebSessions=base_.WebSessions, WebAvgPct=base_.WebAvgPct,
                    WebBestPct=base_.WebBestPct, WebLastDate=base_.WebLastDate,
                    LastActive=base_.LastActive
                };
            }
        }
        if (item == null) return null;
        // Számonkérés eredmények
        using var cmd2 = conn.CreateCommand();
        cmd2.CommandText = @"
            SELECT s.id, s.cim, s.oktato_email,
                   COALESCE(b.manualis_pont, b.auto_pont) as pont,
                   b.max_pont, b.submitted_at
            FROM szamonkeres_beadas b
            JOIN szamonkeres s ON s.id=b.szamonkeres_id
            WHERE LOWER(b.tanulo_email)=LOWER($e) AND s.statusz='kiadva'
            ORDER BY b.submitted_at DESC";
        cmd2.Parameters.AddWithValue("$e", email);
        using var r2 = cmd2.ExecuteReader();
        while (r2.Read())
        {
            var pont = r2.GetInt32(3);
            var maxp = r2.GetInt32(4);
            item.Szamonkeres.Add(new SzamonkeresEredmenyItem {
                SzamonkeresId = r2.GetInt32(0),
                Cim           = r2.GetString(1),
                OktatoEmail   = r2.GetString(2),
                OsszPont      = pont,
                MaxPont       = maxp,
                Szazalek      = maxp > 0 ? (int)Math.Round(pont * 100.0 / maxp) : 0,
                SubmittedAt   = r2.GetString(5)
            });
        }
        return item;
    }

    public List<HaladasOsztalyStat> GetHaladasOsztalySummary()
    {
        var all = GetHaladasByOsztaly(null);
        var cutoff = DateTime.Today.AddDays(-14).ToString("yyyy-MM-dd");
        return all
            .Where(x => x.Osztaly != null)
            .GroupBy(x => x.Osztaly!)
            .Select(g =>
            {
                var students = g.ToList();
                return new HaladasOsztalyStat {
                    Osztaly = g.Key,
                    TanuloCount = students.Count,
                    AktivCount = students.Count(s =>
                        s.LastActive != null && string.Compare(s.LastActive, cutoff) >= 0),
                    TananyagAtlag = Math.Round(students.Average(s =>
                        (s.TananyagHtml != null ? 1 : 0) +
                        (s.TananyagCss != null ? 1 : 0) +
                        (s.TananyagBootstrap != null ? 1 : 0) +
                        (s.TananyagEmmet != null ? 1 : 0) +
                        (s.TananyagJavascript != null ? 1 : 0)), 1),
                    PythonFeladAtlag = Math.Round(students.Average(s => (double)s.PythonSessions), 1),
                    WebFeladAtlag    = Math.Round(students.Average(s => (double)s.WebSessions), 1)
                };
            })
            .OrderBy(x => x.Osztaly)
            .ToList();
    }

    public int GetStreak(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT DATE(datum) FROM progress
            WHERE LOWER(email) = $email AND datum IS NOT NULL AND datum != ''
            ORDER BY 1 DESC";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        var dates = new List<DateTime>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            if (DateTime.TryParse(r.GetString(0), out var d))
                dates.Add(d.Date);
        return CalcStreak(dates);
    }

    public Dictionary<string, int> GetAllStreaks()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT LOWER(email), datum FROM progress
            WHERE datum IS NOT NULL AND datum != ''
            ORDER BY email, datum DESC";
        var byEmail = new Dictionary<string, List<DateTime>>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var e = r.GetString(0);
            if (DateTime.TryParse(r.GetString(1), out var d))
            {
                if (!byEmail.ContainsKey(e)) byEmail[e] = new();
                byEmail[e].Add(d.Date);
            }
        }
        return byEmail.ToDictionary(
            kv => kv.Key,
            kv => CalcStreak(kv.Value.Distinct().OrderByDescending(x => x).ToList())
        );
    }

    private static int CalcStreak(List<DateTime> datesDesc)
    {
        // Aktív napok összesített száma (nem egymást követő, nem veszíthető el)
        return datesDesc.Count;
    }

    public bool UpdatePassword(string email, string newHash)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE users SET password_hash = $h, must_change_password = 0 WHERE email = $e";
        cmd.Parameters.AddWithValue("$h", newHash);
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    // ── Jelszó reset kódok ────────────────────────────────────────────────────

    public (bool found, string nev) SaveResetCode(string email, string code)
    {
        var user = GetUserByEmail(email);
        if (user == null) return (false, "");
        using var conn = Open();
        // Régi kódok törlése ehhez az emailhez
        using (var del = conn.CreateCommand())
        {
            del.CommandText = "DELETE FROM password_reset_codes WHERE LOWER(email) = LOWER($e)";
            del.Parameters.AddWithValue("$e", email);
            del.ExecuteNonQuery();
        }
        using var ins = conn.CreateCommand();
        ins.CommandText = @"
            INSERT INTO password_reset_codes (email, code, expires_at)
            VALUES ($e, $c, datetime('now', '+15 minutes'))";
        ins.Parameters.AddWithValue("$e", email.ToLower().Trim());
        ins.Parameters.AddWithValue("$c", code);
        ins.ExecuteNonQuery();
        return (true, $"{user.Vezeteknev} {user.Keresztnev}");
    }

    public bool VerifyAndConsumeResetCode(string email, string code, string newPasswordHash)
    {
        using var conn = Open();
        using var sel = conn.CreateCommand();
        sel.CommandText = @"
            SELECT id FROM password_reset_codes
            WHERE LOWER(email) = LOWER($e)
              AND code = $c
              AND used = 0
              AND datetime(expires_at) > datetime('now')
            LIMIT 1";
        sel.Parameters.AddWithValue("$e", email);
        sel.Parameters.AddWithValue("$c", code);
        var id = sel.ExecuteScalar();
        if (id == null) return false;

        using var upd = conn.CreateCommand();
        upd.CommandText = "UPDATE password_reset_codes SET used = 1 WHERE id = $id";
        upd.Parameters.AddWithValue("$id", id);
        upd.ExecuteNonQuery();

        return UpdatePassword(email, newPasswordHash);
    }

    // ── Task Ratings ──────────────────────────────────────────────────────────

    public void SaveRating(string email, string feladatNev, string tipus, int ertek)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        if (ertek <= 0)
        {
            // Visszavonás: töröljük a sort
            cmd.CommandText = @"
                DELETE FROM task_ratings
                WHERE email = $email AND feladat_nev = $feladat_nev AND tipus = $tipus";
        }
        else
        {
            cmd.CommandText = @"
                INSERT INTO task_ratings (email, feladat_nev, tipus, ertek)
                VALUES ($email, $feladat_nev, $tipus, $ertek)
                ON CONFLICT(email, feladat_nev, tipus) DO UPDATE SET ertek = $ertek, created_at = datetime('now','localtime')";
        }
        cmd.Parameters.AddWithValue("$email",       email);
        cmd.Parameters.AddWithValue("$feladat_nev", feladatNev);
        cmd.Parameters.AddWithValue("$tipus",       tipus);
        if (ertek > 0) cmd.Parameters.AddWithValue("$ertek", ertek);
        cmd.ExecuteNonQuery();
    }

    public List<TaskRatingStat> GetRatingStats()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT feladat_nev, tipus, ertek, COUNT(*) as db
            FROM task_ratings
            WHERE ertek > 0
            GROUP BY feladat_nev, tipus, ertek
            ORDER BY feladat_nev, tipus, ertek";
        var list = new List<TaskRatingStat>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new TaskRatingStat
            {
                FeladatNev = r.GetString(0),
                Tipus      = r.GetString(1),
                Ertek      = r.GetInt32(2),
                Db         = r.GetInt32(3)
            });
        return list;
    }

    public List<(string FeladatNev, string Tipus, int Ertek)> GetMyRatings(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT feladat_nev, tipus, ertek
            FROM task_ratings WHERE email = $email";
        cmd.Parameters.AddWithValue("$email", email);
        var list = new List<(string, string, int)>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add((r.GetString(0), r.GetString(1), r.GetInt32(2)));
        return list;
    }

    // ── User State ────────────────────────────────────────────────────────────

    public string? GetUserState(string email, string key)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT state_value FROM user_state WHERE email = $email AND state_key = $key";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$key",   key);
        var result = cmd.ExecuteScalar();
        return result is DBNull or null ? null : (string)result;
    }

    public void SetUserState(string email, string key, string value)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO user_state (email, state_key, state_value, updated_at)
            VALUES ($email, $key, $value, datetime('now','localtime'))
            ON CONFLICT(email, state_key) DO UPDATE SET state_value = $value, updated_at = datetime('now','localtime')";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$key",   key);
        cmd.Parameters.AddWithValue("$value", value);
        cmd.ExecuteNonQuery();
    }

    // ── Ötlet Láda ────────────────────────────────────────────────────────────

    public int SaveIdea(string email, string nev, string? osztaly, string szoveg, string? kepBase64, string tipus = "otlet")
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO otlet_lada (email, nev, osztaly, szoveg, tipus, kep_base64)
            VALUES ($email, $nev, $osztaly, $szoveg, $tipus, $kep)
            RETURNING id";
        cmd.Parameters.AddWithValue("$email",   email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$nev",     nev);
        cmd.Parameters.AddWithValue("$osztaly", (object?)osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$szoveg",  szoveg);
        cmd.Parameters.AddWithValue("$tipus",   tipus == "hiba" ? "hiba" : "otlet");
        cmd.Parameters.AddWithValue("$kep",     (object?)kepBase64 ?? DBNull.Value);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<IdeaItem> GetIdeas(bool includeKep = false)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, email, nev, osztaly, szoveg, tipus,
                   (kep_base64 IS NOT NULL) as has_kep,
                   statusz, admin_valasz, megvalositva_szoveg, created_at
            FROM otlet_lada ORDER BY
                CASE statusz WHEN 'uj' THEN 0 WHEN 'olvasott' THEN 1 ELSE 2 END,
                created_at DESC";
        var list = new List<IdeaItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new IdeaItem {
                Id = r.GetInt32(0), Email = r.GetString(1), Nev = r.GetString(2),
                Osztaly = r.IsDBNull(3) ? null : r.GetString(3),
                Szoveg = r.GetString(4), Tipus = r.GetString(5),
                HasKep = r.GetInt32(6) == 1,
                Statusz = r.GetString(7),
                AdminValasz = r.IsDBNull(8) ? null : r.GetString(8),
                MegvalositvaSzoveg = r.IsDBNull(9) ? null : r.GetString(9),
                CreatedAt = r.GetString(10)
            });
        return list;
    }

    public string? GetIdeaKep(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT kep_base64 FROM otlet_lada WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        var r = cmd.ExecuteScalar();
        return r is DBNull or null ? null : (string)r;
    }

    public bool UpdateIdea(int id, string statusz, string? adminValasz, string? megvalositvaSzoveg)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE otlet_lada
            SET statusz = $statusz, admin_valasz = $valasz,
                megvalositva_szoveg = $megv, updated_at = datetime('now','localtime')
            WHERE id = $id";
        cmd.Parameters.AddWithValue("$id",      id);
        cmd.Parameters.AddWithValue("$statusz", statusz);
        cmd.Parameters.AddWithValue("$valasz",  (object?)adminValasz ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$megv",    (object?)megvalositvaSzoveg ?? DBNull.Value);
        return cmd.ExecuteNonQuery() > 0;
    }

    public void DeleteIdea(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM otlet_lada WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.ExecuteNonQuery();
    }

    public List<IdeaItem> GetMyIdeas(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, nev, osztaly, szoveg,
                   (kep_base64 IS NOT NULL) as has_kep,
                   statusz, admin_valasz, megvalositva_szoveg, created_at
            FROM otlet_lada WHERE email = $email ORDER BY created_at DESC";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        var list = new List<IdeaItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new IdeaItem {
                Id = r.GetInt32(0), Email = email, Nev = r.GetString(1),
                Osztaly = r.IsDBNull(2) ? null : r.GetString(2),
                Szoveg = r.GetString(3), HasKep = r.GetInt32(4) == 1,
                Statusz = r.GetString(5),
                AdminValasz = r.IsDBNull(6) ? null : r.GetString(6),
                MegvalositvaSzoveg = r.IsDBNull(7) ? null : r.GetString(7),
                CreatedAt = r.GetString(8)
            });
        return list;
    }

    public void SaveMegvalasultOtlet(string nev, string? osztaly, string szoveg)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO otlet_lada (email, nev, osztaly, szoveg, statusz, megvalositva_szoveg, updated_at)
            VALUES ('', $nev, $osztaly, $szoveg, 'megvalasult', $szoveg, datetime('now','localtime'))";
        cmd.Parameters.AddWithValue("$nev",     nev);
        cmd.Parameters.AddWithValue("$osztaly", (object?)osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$szoveg",  szoveg);
        cmd.ExecuteNonQuery();
    }

    public List<object> GetPublicIdeas()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT nev, osztaly, megvalositva_szoveg, created_at
            FROM otlet_lada WHERE statusz = 'megvalasult' AND tipus = 'otlet'
            ORDER BY updated_at DESC LIMIT 20";
        var list = new List<object>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new {
                nev = r.GetString(0),
                osztaly = r.IsDBNull(1) ? null : r.GetString(1),
                megvalositvaSzoveg = r.IsDBNull(2) ? null : r.GetString(2),
                createdAt = r.GetString(3)
            });
        return list;
    }

    // ── Tesztelők ─────────────────────────────────────────────────────────────

    public void AddTesztelő(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR IGNORE INTO tesztelok (email) VALUES ($email)";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.ExecuteNonQuery();
    }

    public void RemoveTesztelő(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM tesztelok WHERE email = $email";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.ExecuteNonQuery();
    }

    public List<string> GetTesztelők()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT email FROM tesztelok ORDER BY added_at DESC";
        var list = new List<string>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(r.GetString(0));
        return list;
    }

    public bool IsTesztelő(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM tesztelok WHERE email = $email";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
    }

    public void SaveTeszteloiKervenyt(string email, string nev, string? osztaly)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR REPLACE INTO teszteloi_kervenyok (email, nev, osztaly) VALUES ($email, $nev, $osztaly)";
        cmd.Parameters.AddWithValue("$email",   email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$nev",     nev);
        cmd.Parameters.AddWithValue("$osztaly", (object?)osztaly ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    public List<TeszteloiKervenyek> GetTeszteloiKervenyok()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT email, nev, osztaly, created_at FROM teszteloi_kervenyok ORDER BY created_at DESC";
        var list = new List<TeszteloiKervenyek>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new TeszteloiKervenyek(r.GetString(0), r.GetString(1), r.IsDBNull(2) ? null : r.GetString(2), r.GetString(3)));
        return list;
    }

    public void DeleteTeszteloiKervenyt(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM teszteloi_kervenyok WHERE email = $email";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.ExecuteNonQuery();
    }

    // ── Tesztelői üzenetek ────────────────────────────────────────────────────

    public int SaveTeszteloiUzenet(string szoveg, string? recipient = null)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO teszteloi_uzenetek (szoveg, recipient_email) VALUES ($szoveg, $r) RETURNING id";
        cmd.Parameters.AddWithValue("$szoveg", szoveg);
        cmd.Parameters.AddWithValue("$r", (object?)recipient?.ToLower().Trim() ?? DBNull.Value);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<TeszteloiUzenetItem> GetTeszteloiUzenetek(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.id, u.szoveg, u.created_at,
                   (SELECT COUNT(*) FROM teszteloi_uzenet_olvasott o
                    WHERE o.uzenet_id = u.id AND o.email = $email) as olvasott
            FROM teszteloi_uzenetek u
            WHERE u.recipient_email IS NULL OR u.recipient_email = $email
            ORDER BY u.created_at DESC";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        var list = new List<TeszteloiUzenetItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new TeszteloiUzenetItem {
                Id = r.GetInt32(0), Szoveg = r.GetString(1),
                CreatedAt = r.GetString(2), Olvasott = r.GetInt32(3) > 0
            });
        return list;
    }

    public List<AdminUzenetItem> GetTeszteloiUzenetekAdmin()
    {
        using var conn = Open();
        // Összes üzenet + ki olvasta
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.id, u.szoveg, u.created_at,
                   GROUP_CONCAT(o.email) as olvaso_emailek
            FROM teszteloi_uzenetek u
            LEFT JOIN teszteloi_uzenet_olvasott o ON o.uzenet_id = u.id
            GROUP BY u.id ORDER BY u.created_at DESC";
        var dict = new Dictionary<int, AdminUzenetItem>();
        using (var r = cmd.ExecuteReader())
            while (r.Read())
            {
                var item = new AdminUzenetItem {
                    Id = r.GetInt32(0), Szoveg = r.GetString(1), CreatedAt = r.GetString(2)
                };
                var olvEmail = r.IsDBNull(3) ? "" : r.GetString(3);
                item.Olvastak = olvEmail.Length > 0
                    ? olvEmail.Split(',').Select(e => e.Trim()).Where(e => e.Length > 0).ToList()
                    : new List<string>();
                dict[item.Id] = item;
            }
        // Jelenlegi tesztelők
        using var t = conn.CreateCommand();
        t.CommandText = "SELECT email FROM tesztelok";
        var tesztelok = new List<string>();
        using (var r = t.ExecuteReader())
            while (r.Read()) tesztelok.Add(r.GetString(0));
        foreach (var item in dict.Values)
        {
            item.OsszTesztelő = tesztelok.Count;
            item.NemOlvastak  = tesztelok.Where(e => !item.Olvastak.Contains(e)).ToList();
        }
        return dict.Values.ToList();
    }

    public void MarkTeszteloiUzenetOlvasott(int uzenetId, string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT OR IGNORE INTO teszteloi_uzenet_olvasott (uzenet_id, email)
            VALUES ($uid, $email)";
        cmd.Parameters.AddWithValue("$uid",   uzenetId);
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.ExecuteNonQuery();
    }

    // ── Feladatkészítők ───────────────────────────────────────────────────────

    public void AddFeladatkeszito(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR IGNORE INTO feladatkeszitok (email) VALUES ($email)";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.ExecuteNonQuery();
    }

    public bool IsFeladatkeszito(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM feladatkeszitok WHERE email = $email";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
    }

    public List<string> GetFeladatkeszitok()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT email FROM feladatkeszitok ORDER BY added_at DESC";
        var list = new List<string>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(r.GetString(0));
        return list;
    }

    public void RemoveFeladatkeszito(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM feladatkeszitok WHERE email = $email";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.ExecuteNonQuery();
    }

    public int SaveFeladatJavaslat(FeladatJavaslatRequest req)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO feladat_javaslatok (email, nev, osztaly, cim, pont, tipus, szoveg, megoldas)
            VALUES ($email, $nev, $osztaly, $cim, $pont, $tipus, $szoveg, $megoldas) RETURNING id";
        cmd.Parameters.AddWithValue("$email",   req.Email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$nev",     req.Nev);
        cmd.Parameters.AddWithValue("$osztaly", (object?)req.Osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$cim",     req.Cim);
        cmd.Parameters.AddWithValue("$pont",    req.Pont);
        cmd.Parameters.AddWithValue("$tipus",   req.Tipus);
        cmd.Parameters.AddWithValue("$szoveg",  req.Szoveg);
        cmd.Parameters.AddWithValue("$megoldas",(object?)req.Megoldas ?? DBNull.Value);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<FeladatJavaslatItem> GetFeladatJavaslatok()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT id, email, nev, osztaly, cim, pont, tipus, szoveg, megoldas,
            statusz, visszajelzes, megvalositva_szoveg, created_at
            FROM feladat_javaslatok ORDER BY created_at DESC";
        var list = new List<FeladatJavaslatItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new FeladatJavaslatItem {
                Id = r.GetInt32(0), Email = r.GetString(1), Nev = r.GetString(2),
                Osztaly = r.IsDBNull(3) ? null : r.GetString(3),
                Cim = r.GetString(4), Pont = r.GetInt32(5), Tipus = r.GetString(6),
                Szoveg = r.GetString(7), Megoldas = r.IsDBNull(8) ? null : r.GetString(8),
                Statusz = r.GetString(9),
                Visszajelzes = r.IsDBNull(10) ? null : r.GetString(10),
                MegvalositvaSzoveg = r.IsDBNull(11) ? null : r.GetString(11),
                CreatedAt = r.GetString(12)
            });
        return list;
    }

    public void UpdateFeladatJavaslat(int id, FeladatJavaslatUpdateRequest req)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"UPDATE feladat_javaslatok
            SET statusz=$s, visszajelzes=$v, megvalositva_szoveg=$m WHERE id=$id";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.Parameters.AddWithValue("$s",  req.Statusz);
        cmd.Parameters.AddWithValue("$v",  (object?)req.Visszajelzes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$m",  (object?)req.MegvalositvaSzoveg ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    public List<FeladatKeszitőStat> GetFeladatKeszitokStats()
    {
        var javaslatok = GetFeladatJavaslatok();
        return javaslatok
            .GroupBy(j => j.Email)
            .Select(g => new FeladatKeszitőStat {
                Email       = g.Key,
                Nev         = g.First().Nev,
                Osztaly     = g.First().Osztaly,
                Osszes      = g.Count(),
                Elfogadva   = g.Count(j => j.Statusz == "elfogadva"),
                Megvalositva= g.Count(j => j.Statusz == "megvalositva"),
                TypusDb     = g.GroupBy(j => j.Tipus).ToDictionary(t => t.Key, t => t.Count())
            })
            .OrderByDescending(s => s.Osszes)
            .ToList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SqliteConnection Open()
    {
        var conn = new SqliteConnection(_connStr);
        conn.Open();
        return conn;
    }

    private static void Exec(SqliteConnection conn, string sql)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }

    private static List<Submission> ReadSubmissions(SqliteCommand cmd, bool includeCode)
    {
        var list = new List<Submission>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var s = new Submission
            {
                Id          = r.GetInt32(r.GetOrdinal("id")),
                Name        = r.GetString(r.GetOrdinal("name")),
                Email       = r.GetString(r.GetOrdinal("email")),
                Osztaly     = r.IsDBNull(r.GetOrdinal("osztaly"))    ? "" : r.GetString(r.GetOrdinal("osztaly")),
                Csoport     = r.IsDBNull(r.GetOrdinal("csoport"))    ? null : r.GetString(r.GetOrdinal("csoport")),
                TaskIds     = r.IsDBNull(r.GetOrdinal("task_ids"))   ? "" : r.GetString(r.GetOrdinal("task_ids")),
                Scores      = r.IsDBNull(r.GetOrdinal("scores"))     ? "" : r.GetString(r.GetOrdinal("scores")),
                MaxScores   = r.IsDBNull(r.GetOrdinal("max_scores")) ? "" : r.GetString(r.GetOrdinal("max_scores")),
                TotalScore  = r.IsDBNull(r.GetOrdinal("total_score"))? 0  : r.GetInt32(r.GetOrdinal("total_score")),
                MaxTotal    = r.IsDBNull(r.GetOrdinal("max_total"))  ? 0  : r.GetInt32(r.GetOrdinal("max_total")),
                Duration    = r.IsDBNull(r.GetOrdinal("duration"))   ? 0  : r.GetInt32(r.GetOrdinal("duration")),
                Mode        = r.IsDBNull(r.GetOrdinal("mode"))       ? "" : r.GetString(r.GetOrdinal("mode")),
            };
            var subjectOrd = r.GetOrdinal("subject");
            s.Subject = r.IsDBNull(subjectOrd) ? null : r.GetString(subjectOrd);
            if (includeCode)
            {
                var codeOrd = r.GetOrdinal("code_snapshot");
                s.CodeSnapshot = r.IsDBNull(codeOrd) ? null : r.GetString(codeOrd);
            }
            var atOrd = r.GetOrdinal("submitted_at");
            s.SubmittedAt = r.IsDBNull(atOrd) ? "" : r.GetString(atOrd);
            list.Add(s);
        }
        return list;
    }

    // ── Sessions ──────────────────────────────────────────────────────────────

    public int StartSession(string email, string page)
    {
        using var conn = Open();
        // Ha már van aktív session (heartbeat az utóbbi 120 mp-ben), adjuk vissza azt
        using var checkCmd = conn.CreateCommand();
        checkCmd.CommandText = @"
            SELECT id FROM sessions
            WHERE LOWER(user_email) = LOWER($email) AND page = $page
              AND logout_at IS NULL
              AND (julianday('now') - julianday(last_heartbeat)) * 86400 < 120
            ORDER BY id DESC LIMIT 1";
        checkCmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        checkCmd.Parameters.AddWithValue("$page",  page);
        var existing = checkCmd.ExecuteScalar();
        if (existing != null) return Convert.ToInt32(existing);

        // Nincs aktív session – új létrehozása
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO sessions (user_email, page, login_at, last_heartbeat, duration_sec)
            VALUES ($email, $page, datetime('now','localtime'), datetime('now','localtime'), 0)
            RETURNING id";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$page",  page);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public bool UpdateHeartbeat(int sessionId, string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE sessions
            SET last_heartbeat = datetime('now','localtime'),
                duration_sec   = CAST((julianday('now') - julianday(login_at)) * 86400 AS INTEGER)
            WHERE id = $id AND LOWER(user_email) = LOWER($email) AND logout_at IS NULL";
        cmd.Parameters.AddWithValue("$id", sessionId);
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public void UpdateHeartbeat(int sessionId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE sessions
            SET last_heartbeat = datetime('now','localtime'),
                duration_sec   = CAST((julianday('now') - julianday(login_at)) * 86400 AS INTEGER)
            WHERE id = $id AND logout_at IS NULL";
        cmd.Parameters.AddWithValue("$id", sessionId);
        cmd.ExecuteNonQuery();
    }

    public bool EndSession(int sessionId, string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE sessions
            SET logout_at    = datetime('now','localtime'),
                duration_sec = CAST((julianday('now') - julianday(login_at)) * 86400 AS INTEGER)
            WHERE id = $id AND LOWER(user_email) = LOWER($email) AND logout_at IS NULL";
        cmd.Parameters.AddWithValue("$id", sessionId);
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public void EndSession(int sessionId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE sessions
            SET logout_at    = datetime('now','localtime'),
                duration_sec = CAST((julianday('now') - julianday(login_at)) * 86400 AS INTEGER)
            WHERE id = $id AND logout_at IS NULL";
        cmd.Parameters.AddWithValue("$id", sessionId);
        cmd.ExecuteNonQuery();
    }

    public List<SessionPageStat> GetSessionStats(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        // Befejezett sessionök duration_sec-je + folyamatban lévő (legfeljebb 120 mp régi heartbeat)
        cmd.CommandText = @"
            SELECT page,
                   SUM(CASE
                       WHEN logout_at IS NOT NULL THEN duration_sec
                       WHEN (julianday('now') - julianday(last_heartbeat)) * 86400 < 120
                            THEN CAST((julianday('now') - julianday(login_at)) * 86400 AS INTEGER)
                       ELSE duration_sec
                   END) as total_sec,
                   COUNT(*) as session_count
            FROM sessions
            WHERE LOWER(user_email) = LOWER($email)
            GROUP BY page";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        var list = new List<SessionPageStat>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new SessionPageStat
            {
                Page         = r.GetString(0),
                TotalSec     = r.IsDBNull(1) ? 0 : (int)(double)r.GetDouble(1),
                SessionCount = r.GetInt32(2)
            });
        return list;
    }

    public List<UserSessionStat> GetAllSessionStats()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT s.user_email, u.vezeteknev || ' ' || u.keresztnev as nev, u.osztaly, s.page,
                   SUM(CASE
                       WHEN s.logout_at IS NOT NULL THEN s.duration_sec
                       WHEN (julianday('now') - julianday(s.last_heartbeat)) * 86400 < 120
                            THEN CAST((julianday('now') - julianday(s.login_at)) * 86400 AS INTEGER)
                       ELSE s.duration_sec
                   END) as total_sec,
                   COUNT(*) as session_count
            FROM sessions s
            LEFT JOIN users u ON LOWER(s.user_email) = LOWER(u.email)
            GROUP BY s.user_email, s.page
            ORDER BY s.user_email, s.page";
        var rows = new List<(string email, string? nev, string? osztaly, string page, int totalSec, int count)>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            rows.Add((
                r.GetString(0),
                r.IsDBNull(1) ? null : r.GetString(1),
                r.IsDBNull(2) ? null : r.GetString(2),
                r.GetString(3),
                r.IsDBNull(4) ? 0 : (int)r.GetDouble(4),
                r.GetInt32(5)
            ));

        // Csoportosítás email szerint
        var byEmail = new Dictionary<string, UserSessionStat>(StringComparer.OrdinalIgnoreCase);
        foreach (var row in rows)
        {
            if (!byEmail.TryGetValue(row.email, out var stat))
            {
                stat = new UserSessionStat { Email = row.email, Nev = row.nev, Osztaly = row.osztaly };
                byEmail[row.email] = stat;
            }
            stat.Pages.Add(new SessionPageStat { Page = row.page, TotalSec = row.totalSec, SessionCount = row.count });
            stat.TotalSec += row.totalSec;
        }
        return byEmail.Values.OrderByDescending(x => x.TotalSec).ToList();
    }

    // ── Jelszó visszaállítási kérelmek ───────────────────────────────────────

    public void SavePasswordResetRequest(string email, string nev, string? osztaly, string? csoport)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            DELETE FROM password_reset_requests WHERE LOWER(email) = LOWER($email);
            INSERT INTO password_reset_requests (email, nev, osztaly, csoport)
            VALUES ($email, $nev, $osztaly, $csoport)";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$nev", nev);
        cmd.Parameters.AddWithValue("$osztaly", (object?)osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$csoport", (object?)csoport ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    public List<PasswordResetRequestRow> GetPasswordResetRequests()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id, email, nev, osztaly, csoport, created_at FROM password_reset_requests ORDER BY created_at DESC";
        var list = new List<PasswordResetRequestRow>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new PasswordResetRequestRow(
                r.GetInt32(0),
                r.GetString(1),
                r.GetString(2),
                r.IsDBNull(3) ? null : r.GetString(3),
                r.IsDBNull(4) ? null : r.GetString(4),
                r.GetString(5)
            ));
        return list;
    }

    public void DeletePasswordResetRequest(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM password_reset_requests WHERE id = $id";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.ExecuteNonQuery();
    }

    // ── Quiz eredmények ───────────────────────────────────────────────────────

    public int SaveQuizResult(QuizResultRequest req)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO quiz_results (nev, email, osztaly, csoport, tipus, pont, max_pont, szazalek, jegy, ido_mp)
            VALUES ($nev, $email, $osztaly, $csoport, $tipus, $pont, $maxPont, $szazalek, $jegy, $idoMp)";
        cmd.Parameters.AddWithValue("$nev",      req.Nev);
        cmd.Parameters.AddWithValue("$email",    req.Email ?? "");
        cmd.Parameters.AddWithValue("$osztaly",  req.Osztaly ?? "");
        cmd.Parameters.AddWithValue("$csoport",  req.Csoport ?? "");
        cmd.Parameters.AddWithValue("$tipus",    req.Tipus);
        cmd.Parameters.AddWithValue("$pont",     req.Pont);
        cmd.Parameters.AddWithValue("$maxPont",  req.MaxPont);
        cmd.Parameters.AddWithValue("$szazalek", req.Szazalek);
        cmd.Parameters.AddWithValue("$jegy",     req.Jegy ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("$idoMp",    req.IdoMp ?? (object)DBNull.Value);
        cmd.ExecuteNonQuery();
        using var idCmd = conn.CreateCommand();
        idCmd.CommandText = "SELECT last_insert_rowid()";
        return (int)(long)idCmd.ExecuteScalar()!;
    }

    public List<ProgressDetailItem> GetStudentProgressItems(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT targy, feladat, pont, max_pont, datum
            FROM progress WHERE LOWER(email) = LOWER($email) ORDER BY datum DESC";
        cmd.Parameters.AddWithValue("$email", email.Trim());
        var list = new List<ProgressDetailItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new ProgressDetailItem {
                Targy   = r.GetString(0),
                Feladat = r.IsDBNull(1) ? "" : r.GetString(1),
                Pont    = r.GetInt32(2),
                MaxPont = r.GetInt32(3),
                Datum   = r.IsDBNull(4) ? "" : r.GetString(4)
            });
        return list;
    }

    public List<QuizResultItem> GetStudentQuizResults(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT id, nev, email, osztaly, csoport, tipus, pont, max_pont, szazalek, jegy, ido_mp, submitted_at
            FROM quiz_results WHERE LOWER(email) = LOWER($email) ORDER BY submitted_at DESC";
        cmd.Parameters.AddWithValue("$email", email.Trim());
        var list = new List<QuizResultItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new QuizResultItem {
                Id          = r.GetInt32(0),
                Nev         = r.GetString(1),
                Email       = r.IsDBNull(2)  ? "" : r.GetString(2),
                Osztaly     = r.IsDBNull(3)  ? "" : r.GetString(3),
                Csoport     = r.IsDBNull(4)  ? "" : r.GetString(4),
                Tipus       = r.GetString(5),
                Pont        = r.GetInt32(6),
                MaxPont     = r.GetInt32(7),
                Szazalek    = r.GetInt32(8),
                Jegy        = r.IsDBNull(9)  ? null : r.GetInt32(9),
                IdoMp       = r.IsDBNull(10) ? null : r.GetInt32(10),
                SubmittedAt = r.GetString(11)
            });
        return list;
    }

    public List<QuizResultItem> GetQuizResults(string? tipus = null)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = tipus == null
            ? "SELECT id, nev, email, osztaly, csoport, tipus, pont, max_pont, szazalek, jegy, ido_mp, submitted_at FROM quiz_results ORDER BY submitted_at DESC LIMIT 500"
            : "SELECT id, nev, email, osztaly, csoport, tipus, pont, max_pont, szazalek, jegy, ido_mp, submitted_at FROM quiz_results WHERE tipus = $tipus ORDER BY submitted_at DESC LIMIT 500";
        if (tipus != null) cmd.Parameters.AddWithValue("$tipus", tipus);
        var list = new List<QuizResultItem>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new QuizResultItem
            {
                Id          = r.GetInt32(0),
                Nev         = r.GetString(1),
                Email       = r.IsDBNull(2) ? "" : r.GetString(2),
                Osztaly     = r.IsDBNull(3) ? "" : r.GetString(3),
                Csoport     = r.IsDBNull(4) ? "" : r.GetString(4),
                Tipus       = r.GetString(5),
                Pont        = r.GetInt32(6),
                MaxPont     = r.GetInt32(7),
                Szazalek    = r.GetInt32(8),
                Jegy        = r.IsDBNull(9) ? null : r.GetInt32(9),
                IdoMp       = r.IsDBNull(10) ? null : r.GetInt32(10),
                SubmittedAt = r.GetString(11)
            });
        return list;
    }

    // ── Kódpárbaj ─────────────────────────────────────────────────────────────

    public int CreateDuel(string challengerEmail, string challengerNev, string opponentEmail, string opponentNev, int taskNumber, string taskTitle)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO duels (challenger_email,challenger_nev,opponent_email,opponent_nev,task_number,task_title)
            VALUES ($ce,$cn,$oe,$on,$tn,$tt) RETURNING id";
        cmd.Parameters.AddWithValue("$ce", challengerEmail.ToLower().Trim());
        cmd.Parameters.AddWithValue("$cn", challengerNev);
        cmd.Parameters.AddWithValue("$oe", opponentEmail.ToLower().Trim());
        cmd.Parameters.AddWithValue("$on", opponentNev);
        cmd.Parameters.AddWithValue("$tn", taskNumber);
        cmd.Parameters.AddWithValue("$tt", taskTitle);
        var id = Convert.ToInt32(cmd.ExecuteScalar());
        // Bot automatikusan elfogadja
        if (opponentEmail.Trim().ToLower() == "bot@kkszki.hu")
        {
            using var accept = conn.CreateCommand();
            accept.CommandText = "UPDATE duels SET status='active', accepted_at=datetime('now','localtime') WHERE id=$id";
            accept.Parameters.AddWithValue("$id", id);
            accept.ExecuteNonQuery();
        }
        return id;
    }

    public DuelRecord? GetDuel(int id)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id,challenger_email,challenger_nev,opponent_email,opponent_nev,task_number,task_title,status,challenger_score,challenger_max,challenger_time,opponent_score,opponent_max,opponent_time,winner_email,created_at,accepted_at,finished_at FROM duels WHERE id=$id";
        cmd.Parameters.AddWithValue("$id", id);
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;
        return ReadDuelRow(r);
    }

    public List<DuelRecord> GetIncomingDuels(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        // Lejárt (>2 perc) pending meghívók automatikusan expired-dé válnak
        using var expCmd = conn.CreateCommand();
        expCmd.CommandText = "UPDATE duels SET status='expired' WHERE status='pending' AND (julianday('now') - julianday(created_at))*1440 > 2";
        expCmd.ExecuteNonQuery();

        cmd.CommandText = "SELECT id,challenger_email,challenger_nev,opponent_email,opponent_nev,task_number,task_title,status,challenger_score,challenger_max,challenger_time,opponent_score,opponent_max,opponent_time,winner_email,created_at,accepted_at,finished_at FROM duels WHERE LOWER(opponent_email)=LOWER($e) AND status='pending' ORDER BY id DESC";
        cmd.Parameters.AddWithValue("$e", email);
        using var r = cmd.ExecuteReader();
        var list = new List<DuelRecord>();
        while (r.Read()) list.Add(ReadDuelRow(r));
        return list;
    }

    public bool RespondDuel(int id, string opponentEmail, bool accept)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        var newStatus = accept ? "active" : "declined";
        var acceptedAt = accept ? "datetime('now','localtime')" : "NULL";
        cmd.CommandText = $"UPDATE duels SET status='{newStatus}', accepted_at={acceptedAt} WHERE id=$id AND LOWER(opponent_email)=LOWER($e) AND status='pending'";
        cmd.Parameters.AddWithValue("$id", id);
        cmd.Parameters.AddWithValue("$e", opponentEmail);
        return cmd.ExecuteNonQuery() > 0;
    }

    public void MigrateDuelTime()
    {
        try { using var c = Open(); Exec(c, "ALTER TABLE duels ADD COLUMN challenger_time INTEGER"); } catch {}
        try { using var c = Open(); Exec(c, "ALTER TABLE duels ADD COLUMN opponent_time INTEGER");   } catch {}
    }

    public (bool ok, string? winner) SubmitDuelScore(int id, string email, int score, int maxScore, int elapsedSeconds)
    {
        using var conn = Open();
        var d = GetDuel(id);
        if (d == null || d.Status != "active") return (false, null);

        bool isChallenger = d.ChallengerEmail.Equals(email, StringComparison.OrdinalIgnoreCase);
        bool isOpponent   = d.OpponentEmail.Equals(email, StringComparison.OrdinalIgnoreCase);
        if (!isChallenger && !isOpponent) return (false, null);

        using var upd = conn.CreateCommand();
        if (isChallenger)
            upd.CommandText = "UPDATE duels SET challenger_score=$s, challenger_max=$m, challenger_time=$t WHERE id=$id";
        else
            upd.CommandText = "UPDATE duels SET opponent_score=$s, opponent_max=$m, opponent_time=$t WHERE id=$id";
        upd.Parameters.AddWithValue("$s", score);
        upd.Parameters.AddWithValue("$m", maxScore);
        upd.Parameters.AddWithValue("$t", elapsedSeconds);
        upd.Parameters.AddWithValue("$id", id);
        upd.ExecuteNonQuery();

        d = GetDuel(id)!;
        // Bot auto-submit: ha a kihívó beadott és a bot még nem
        if (isChallenger && d.OpponentEmail.Equals("bot@kkszki.hu", StringComparison.OrdinalIgnoreCase) && d.OpponentScore == null)
        {
            var rng = new Random();
            int botScore = (int)Math.Round(maxScore * (0.3 + rng.NextDouble() * 0.6));
            int botTime  = rng.Next(300, 560);
            using var botUpd = conn.CreateCommand();
            botUpd.CommandText = "UPDATE duels SET opponent_score=$s, opponent_max=$m, opponent_time=$t WHERE id=$id";
            botUpd.Parameters.AddWithValue("$s", botScore);
            botUpd.Parameters.AddWithValue("$m", maxScore);
            botUpd.Parameters.AddWithValue("$t", botTime);
            botUpd.Parameters.AddWithValue("$id", id);
            botUpd.ExecuteNonQuery();
            d = GetDuel(id)!;
        }
        if (d.ChallengerScore == null || d.OpponentScore == null) return (true, null);

        // Győztes: nagyobb %, egyenlő % esetén kevesebb idő
        string? winner = null;
        double cp = (d.ChallengerMax ?? 0) > 0 ? (double)d.ChallengerScore!.Value / d.ChallengerMax!.Value : 0;
        double op = (d.OpponentMax   ?? 0) > 0 ? (double)d.OpponentScore!.Value   / d.OpponentMax!.Value   : 0;
        if (cp > op) winner = d.ChallengerEmail;
        else if (op > cp) winner = d.OpponentEmail;
        else
        {
            // Pontegyenlőség → gyorsabb nyer (kisebb idő)
            int ct = d.ChallengerTime ?? 600;
            int ot = d.OpponentTime   ?? 600;
            if      (ct < ot) winner = d.ChallengerEmail;
            else if (ot < ct) winner = d.OpponentEmail;
            // Teljesen egyforma: winner = null (rendkívül ritka)
        }

        using var fin = conn.CreateCommand();
        fin.CommandText = "UPDATE duels SET status='finished', winner_email=$w, finished_at=datetime('now','localtime') WHERE id=$id";
        fin.Parameters.AddWithValue("$w", winner ?? (object)DBNull.Value);
        fin.Parameters.AddWithValue("$id", id);
        fin.ExecuteNonQuery();
        return (true, winner);
    }

    public DuelStats GetDuelStats(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT
            COUNT(CASE WHEN winner_email IS NOT NULL AND LOWER(winner_email)=LOWER($e) THEN 1 END) as wins,
            COUNT(CASE WHEN status='finished' AND winner_email IS NOT NULL AND LOWER(winner_email)!=LOWER($e) THEN 1 END) as losses,
            COUNT(CASE WHEN status='finished' THEN 1 END) as total
            FROM duels WHERE LOWER(challenger_email)=LOWER($e) OR LOWER(opponent_email)=LOWER($e)";
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return new DuelStats();
        return new DuelStats { Wins = r.GetInt32(0), Losses = r.GetInt32(1), Total = r.GetInt32(2) };
    }

    public List<OnlineUser> GetOnlineGroupMembers(string evfolyam, string osztaly, string csoport, string excludeEmail)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT u.email, u.vezeteknev||' '||u.keresztnev
            FROM users u
            JOIN sessions s ON LOWER(u.email)=LOWER(s.user_email)
            WHERE u.szerep='tanulo'
              AND u.evfolyam=$ef AND u.osztaly=$oz AND u.csoport=$cs
              AND LOWER(u.email) != LOWER($ex)
              AND s.logout_at IS NULL
              AND (julianday('now') - julianday(s.last_heartbeat))*86400 < 300";
        cmd.Parameters.AddWithValue("$ef", evfolyam);
        cmd.Parameters.AddWithValue("$oz", osztaly);
        cmd.Parameters.AddWithValue("$cs", csoport);
        cmd.Parameters.AddWithValue("$ex", excludeEmail.ToLower().Trim());
        using var r = cmd.ExecuteReader();
        var list = new List<OnlineUser>();
        while (r.Read()) list.Add(new OnlineUser { Email = r.GetString(0), Nev = r.IsDBNull(1) ? "" : r.GetString(1) });
        // Piton Professzor mindig "online"
        list.Add(new OnlineUser { Email = "bot@kkszki.hu", Nev = "Piton Professzor", IsBot = true });
        return list;
    }

    private static DuelRecord ReadDuelRow(Microsoft.Data.Sqlite.SqliteDataReader r) => new()
    {
        Id              = r.GetInt32(0),
        ChallengerEmail = r.GetString(1),
        ChallengerNev   = r.IsDBNull(2)  ? "" : r.GetString(2),
        OpponentEmail   = r.GetString(3),
        OpponentNev     = r.IsDBNull(4)  ? "" : r.GetString(4),
        TaskNumber      = r.GetInt32(5),
        TaskTitle       = r.IsDBNull(6)  ? "" : r.GetString(6),
        Status          = r.GetString(7),
        ChallengerScore = r.IsDBNull(8)  ? null : r.GetInt32(8),
        ChallengerMax   = r.IsDBNull(9)  ? null : r.GetInt32(9),
        ChallengerTime  = r.IsDBNull(10) ? null : r.GetInt32(10),
        OpponentScore   = r.IsDBNull(11) ? null : r.GetInt32(11),
        OpponentMax     = r.IsDBNull(12) ? null : r.GetInt32(12),
        OpponentTime    = r.IsDBNull(13) ? null : r.GetInt32(13),
        WinnerEmail     = r.IsDBNull(14) ? null : r.GetString(14),
        CreatedAt       = r.GetString(15),
        AcceptedAt      = r.IsDBNull(16) ? null : r.GetString(16),
        FinishedAt      = r.IsDBNull(17) ? null : r.GetString(17),
    };

    // ── Chat ──────────────────────────────────────────────────────────────────

    public void MigrateChatChannel()
    {
        try
        {
            using var conn = Open();
            Exec(conn, "ALTER TABLE chat_messages ADD COLUMN channel TEXT NOT NULL DEFAULT 'tesztelok'");
        }
        catch { /* oszlop már létezik */ }
    }

    public List<ChatMessage> GetChatMessages(int sinceId, string channel)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id, sender_email, sender_nev, sender_szerep, message, channel, created_at FROM chat_messages WHERE id > $sid AND channel=$ch ORDER BY id ASC LIMIT 200";
        cmd.Parameters.AddWithValue("$sid", sinceId);
        cmd.Parameters.AddWithValue("$ch", channel);
        using var r = cmd.ExecuteReader();
        var list = new List<ChatMessage>();
        while (r.Read())
            list.Add(new ChatMessage {
                Id           = r.GetInt32(0),
                SenderEmail  = r.GetString(1),
                SenderNev    = r.IsDBNull(2) ? "" : r.GetString(2),
                SenderSzerep = r.IsDBNull(3) ? "" : r.GetString(3),
                Message      = r.GetString(4),
                Channel      = r.IsDBNull(5) ? "tesztelok" : r.GetString(5),
                CreatedAt    = r.GetString(6)
            });
        return list;
    }

    public int SendChatMessage(string email, string nev, string szerep, string message, string channel)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO chat_messages (sender_email, sender_nev, sender_szerep, message, channel) VALUES ($e,$n,$s,$m,$ch) RETURNING id";
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$n", nev);
        cmd.Parameters.AddWithValue("$s", szerep);
        cmd.Parameters.AddWithValue("$m", message.Trim());
        cmd.Parameters.AddWithValue("$ch", channel);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    // ── Távközlési technikus vizsga ───────────────────────────────────────────
    public int SaveTavolkozlesResult(TavolkozlesSubmitRequest req, string valaszokJson)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO tavolkozles_results
            (nev,datum,felhasznalt_ido,helyes,helytelen,ures,osszesen,szazalek,valaszok_json)
            VALUES ($nev,$datum,$ido,$helyes,$helytelen,$ures,$osszesen,$szazalek,$valaszok)";
        cmd.Parameters.AddWithValue("$nev",       req.Nev.Trim());
        cmd.Parameters.AddWithValue("$datum",     req.Datum ?? DateTime.Now.ToString("yyyy.MM.dd. HH:mm"));
        cmd.Parameters.AddWithValue("$ido",       (object?)req.FelhasznaltIdo ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$helyes",    req.Eredmeny.Helyes);
        cmd.Parameters.AddWithValue("$helytelen", req.Eredmeny.Helytelen);
        cmd.Parameters.AddWithValue("$ures",      req.Eredmeny.Ures);
        cmd.Parameters.AddWithValue("$osszesen",  req.Eredmeny.Osszesen);
        cmd.Parameters.AddWithValue("$szazalek",  req.Eredmeny.Szazalek);
        cmd.Parameters.AddWithValue("$valaszok",  valaszokJson);
        cmd.ExecuteNonQuery();
        using var idCmd = conn.CreateCommand();
        idCmd.CommandText = "SELECT last_insert_rowid()";
        return (int)(long)idCmd.ExecuteScalar()!;
    }

    public List<TavolkozlesResultItem> GetTavolkozlesResults()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT id,nev,datum,felhasznalt_ido,helyes,helytelen,ures,osszesen,szazalek,valaszok_json,submitted_at
            FROM tavolkozles_results ORDER BY submitted_at DESC";
        using var r = cmd.ExecuteReader();
        var list = new List<TavolkozlesResultItem>();
        while (r.Read())
            list.Add(new TavolkozlesResultItem
            {
                Id            = r.GetInt32(0),
                Nev           = r.GetString(1),
                Datum         = r.GetString(2),
                FelhasznaltIdo = r.IsDBNull(3) ? null : r.GetString(3),
                Helyes        = r.GetInt32(4),
                Helytelen     = r.GetInt32(5),
                Ures          = r.GetInt32(6),
                Osszesen      = r.GetInt32(7),
                Szazalek      = r.GetInt32(8),
                ValaszokJson  = r.IsDBNull(9) ? "[]" : r.GetString(9),
                SubmittedAt   = r.GetString(10)
            });
        return list;
    }
    // ── Ágazati leaderboard ─────────────────────────────────────────────────
    public List<AgazatiTaskRank> GetAgazatiLeaderboard(string myEmail, string? osztaly, string? csoport, string? evfolyam)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();

        // Szűrő felépítése users join alapján
        var where = new List<string> { "p.targy = 'agazati' AND p.pont >= p.max_pont" };
        if (!string.IsNullOrEmpty(osztaly))  where.Add($"(u.osztaly = '{osztaly.Replace("'","")}' OR p.osztaly LIKE '%.{osztaly.Replace("'","")}')");
        if (!string.IsNullOrEmpty(csoport))  where.Add($"u.csoport = '{csoport.Replace("'","")}'");
        if (!string.IsNullOrEmpty(evfolyam)) where.Add($"u.evfolyam = '{evfolyam.Replace("'","")}'");

        cmd.CommandText = $@"
            SELECT p.feladat,
                   COUNT(DISTINCT LOWER(p.email)) AS megoldok,
                   MIN(CASE WHEN LOWER(p.email)=LOWER($me) THEN p.datum END) AS sajat_datum,
                   (SELECT COUNT(*)+1 FROM progress p2
                    LEFT JOIN users u2 ON LOWER(u2.email)=LOWER(p2.email)
                    WHERE p2.targy='agazati' AND p2.pont>=p2.max_pont AND p2.feladat=p.feladat
                      AND p2.datum < MIN(CASE WHEN LOWER(p.email)=LOWER($me) THEN p.datum END)
                   ) AS sajat_rang
            FROM progress p
            LEFT JOIN users u ON LOWER(u.email)=LOWER(p.email)
            WHERE {string.Join(" AND ", where)}
            GROUP BY p.feladat
            ORDER BY megoldok DESC, p.feladat ASC";
        cmd.Parameters.AddWithValue("$me", myEmail.Trim().ToLower());

        var list = new List<AgazatiTaskRank>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new AgazatiTaskRank {
                Feladat    = r.GetString(0),
                Megoldok   = r.GetInt32(1),
                SajatDatum = r.IsDBNull(2) ? null : r.GetString(2),
                SajatRang  = r.IsDBNull(3) ? (int?)null : r.GetInt32(3)
            });
        return list;
    }

    public List<StreakRankItem> GetStreakLeaderboard(string? osztaly, string? csoport, string? evfolyam)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        var where = new List<string>();
        if (!string.IsNullOrEmpty(osztaly))  where.Add($"u.osztaly = '{osztaly.Replace("'","")}'");
        if (!string.IsNullOrEmpty(csoport))  where.Add($"u.csoport = '{csoport.Replace("'","")}'");
        if (!string.IsNullOrEmpty(evfolyam)) where.Add($"u.evfolyam = '{evfolyam.Replace("'","")}'");
        var whereStr = where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "";

        cmd.CommandText = $@"
            SELECT u.vezeteknev || ' ' || u.keresztnev AS nev,
                   u.email, u.osztaly, u.csoport, u.evfolyam,
                   COUNT(DISTINCT DATE(p.datum)) AS aktiv_napok
            FROM users u
            LEFT JOIN progress p ON LOWER(p.email)=LOWER(u.email)
            {whereStr}
            GROUP BY u.email
            ORDER BY aktiv_napok DESC
            LIMIT 100";
        var list = new List<StreakRankItem>();
        using var r = cmd.ExecuteReader();
        int rank = 1;
        while (r.Read())
            list.Add(new StreakRankItem {
                Rang      = rank++,
                Nev       = r.GetString(0),
                Email     = r.GetString(1),
                Osztaly   = r.IsDBNull(2) ? null : r.GetString(2),
                Csoport   = r.IsDBNull(3) ? null : r.GetString(3),
                Evfolyam  = r.IsDBNull(4) ? null : r.GetString(4),
                AktivNap  = r.GetInt32(5)
            });
        return list;
    }

    public List<DuelRankItem> GetDuelLeaderboard(string? osztaly, string? csoport, string? evfolyam)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        var where = new List<string> { "d.status='finished' AND d.opponent_email != 'bot@kkszki.hu'" };
        if (!string.IsNullOrEmpty(osztaly))  where.Add($"(u.osztaly='{osztaly.Replace("'","")}')" );
        if (!string.IsNullOrEmpty(csoport))  where.Add($"(u.csoport='{csoport.Replace("'","")}')" );
        if (!string.IsNullOrEmpty(evfolyam)) where.Add($"(u.evfolyam='{evfolyam.Replace("'","")}')" );

        cmd.CommandText = $@"
            SELECT u.vezeteknev||' '||u.keresztnev AS nev, u.email, u.osztaly, u.csoport, u.evfolyam,
                   COUNT(CASE WHEN LOWER(d.winner_email)=LOWER(u.email) THEN 1 END) AS gyozelem,
                   COUNT(CASE WHEN d.winner_email IS NOT NULL AND LOWER(d.winner_email)!=LOWER(u.email) THEN 1 END) AS vereseg,
                   COUNT(CASE WHEN d.winner_email IS NULL THEN 1 END) AS dontetlon
            FROM users u
            JOIN duels d ON LOWER(d.challenger_email)=LOWER(u.email) OR LOWER(d.opponent_email)=LOWER(u.email)
            WHERE {string.Join(" AND ", where)}
            GROUP BY u.email
            ORDER BY gyozelem DESC, vereseg ASC
            LIMIT 100";
        var list = new List<DuelRankItem>();
        using var r = cmd.ExecuteReader();
        int rank = 1;
        while (r.Read())
            list.Add(new DuelRankItem {
                Rang      = rank++,
                Nev       = r.GetString(0),
                Email     = r.GetString(1),
                Osztaly   = r.IsDBNull(2) ? null : r.GetString(2),
                Csoport   = r.IsDBNull(3) ? null : r.GetString(3),
                Evfolyam  = r.IsDBNull(4) ? null : r.GetString(4),
                Gyozelem  = r.GetInt32(5),
                Vereseg   = r.GetInt32(6),
                Dontetlon = r.GetInt32(7)
            });
        return list;
    }

    public bool SetProgressCelHonap(int progressId, string email, int celHonap)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"UPDATE progress SET cel_honap=$ch
                            WHERE id=$id AND LOWER(email)=$e";
        cmd.Parameters.AddWithValue("$ch", celHonap);
        cmd.Parameters.AddWithValue("$id", progressId);
        cmd.Parameters.AddWithValue("$e",  email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public int SetProgressCelHonapMai(string email, int celHonap)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"UPDATE progress SET cel_honap=$ch
                            WHERE LOWER(email)=$e
                              AND DATE(datum)=DATE('now')
                              AND (cel_honap IS NULL OR cel_honap != $ch)";
        cmd.Parameters.AddWithValue("$ch", celHonap);
        cmd.Parameters.AddWithValue("$e",  email.ToLower().Trim());
        return cmd.ExecuteNonQuery();
    }

    // ── Havi jegyek ──────────────────────────────────────────────────────────

    // Tartalom megjelenési dátumok: melyik hónaptól számítható be az adott tartalom
    private static readonly Dictionary<string, int> TartalmakHonapTol = new()
    {
        { "python",      3 }, { "web",         3 },
        { "tananyag_html", 3 }, { "tananyag_css", 3 },
        { "tananyag_bootstrap", 4 }, { "quiz_html", 4 }, { "quiz_css", 4 },
        { "quiz_bootstrap", 4 }, { "interaktiv", 4 }, { "kodparbaj", 4 },
        { "halozat",     5 },
    };

    private static int CalcJegy(double ossz) =>
        ossz >= 80 ? 5 : ossz >= 60 ? 4 : ossz >= 40 ? 3 : ossz >= 21 ? 2 : 1;

    // WEB-only csoport: Python-t más tanár értékeli (10.B/1, 10.B/2, 10.K/infó)
    private static bool IsWebOnlyCsoport(string? evfolyam, string? osztaly, string? csoport)
    {
        if (evfolyam != "10") return false;
        var o = osztaly?.Trim().ToUpperInvariant() ?? "";
        var cs = csoport?.Trim().ToLowerInvariant() ?? "";
        if (o == "B" && (cs == "1" || cs == "2")) return true;
        if (o == "K" && cs.Contains("inf")) return true;
        return false;
    }

    // ── Kvóták (darabszám/hónap) ──────────────────────────────────────────────
    // Python: 3 feladat/hónap × 3 hónap = 9 összesen
    // WEB:    1 feladat/hónap × 3 hónap = 3 összesen
    // Interaktív: 1 teszt/hónap, elérhető 4. hónaptól = 2 összesen
    // Háló:   1 elvégzés, csak 5. hónap
    private static int PythonKvota(int honap)    => 3 * (honap - 2);           // 3,6,9
    private static int WebKvota(int honap)        => honap - 2;                 // 1,2,3
    private static int InteraktivKvota(int honap) => Math.Max(0, honap - 3);   // 0,1,2

    public HaviJegyRow CalcHaviJegy(string email, int ev, int honap)
    {
        using var conn = Open();
        var user = GetUserByEmail(email);
        var e    = email.ToLower().Trim();

        // ── Python: összes elvégzett egyedi feladat száma (kumulatív) ──────
        double pythonSzaz = 0;
        if (honap >= TartalmakHonapTol["python"])
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(DISTINCT feladat) FROM progress
                WHERE LOWER(email)=$e AND LOWER(targy) IN ('python','agazati')
                  AND CAST(strftime('%Y',datum) AS INTEGER)=$y";
            cmd.Parameters.AddWithValue("$e", e);
            cmd.Parameters.AddWithValue("$y", ev);
            int db  = Convert.ToInt32(cmd.ExecuteScalar());
            int kvt = PythonKvota(honap);
            pythonSzaz = kvt > 0 ? Math.Min(db / (double)kvt * 100, 100) : 100;
        }

        // ── WEB: összes elvégzett egyedi feladat száma (kumulatív) ─────────
        double webSzaz = 0;
        if (honap >= TartalmakHonapTol["web"])
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(DISTINCT feladat) FROM progress
                WHERE LOWER(email)=$e AND LOWER(targy)='web'
                  AND CAST(strftime('%Y',datum) AS INTEGER)=$y";
            cmd.Parameters.AddWithValue("$e", e);
            cmd.Parameters.AddWithValue("$y", ev);
            int db  = Convert.ToInt32(cmd.ExecuteScalar());
            int kvt = WebKvota(honap);
            webSzaz = kvt > 0 ? Math.Min(db / (double)kvt * 100, 100) : 100;
        }

        // ── Interaktív teszt: elvégzett tesztek száma (kumulatív) ──────────
        double interaktivSzaz = 100; // ha még nem kötelező, ne büntessen
        if (honap >= TartalmakHonapTol["interaktiv"])
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(*) FROM quiz_results
                WHERE LOWER(email)=$e AND LOWER(tipus) IN ('html','css','bootstrap','interaktiv')
                  AND CAST(strftime('%Y', submitted_at) AS INTEGER)=$y";
            cmd.Parameters.AddWithValue("$e", e);
            cmd.Parameters.AddWithValue("$y", ev);
            int db  = Convert.ToInt32(cmd.ExecuteScalar());
            int kvt = InteraktivKvota(honap);
            interaktivSzaz = kvt > 0 ? Math.Min(db / (double)kvt * 100, 100) : 100;
        }

        // ── Háló: csak május, 1 elvégzés kell ──────────────────────────────
        double halozatSzaz = 100; // nem büntessen ha még nem elérhető
        if (honap >= TartalmakHonapTol["halozat"])
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(*) FROM progress
                WHERE LOWER(email)=$e AND LOWER(targy)='halozat'
                  AND CAST(strftime('%Y',datum) AS INTEGER)=$y";
            cmd.Parameters.AddWithValue("$e", e);
            cmd.Parameters.AddWithValue("$y", ev);
            int db = Convert.ToInt32(cmd.ExecuteScalar());
            halozatSzaz = db >= 1 ? 100 : 0;
        }

        // ── Aktív napok az adott hónapban ──────────────────────────────────
        int aktivNapok = 0;
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(DISTINCT DATE(datum)) FROM progress
                WHERE LOWER(email)=$e
                  AND CAST(strftime('%m',datum) AS INTEGER)=$h
                  AND CAST(strftime('%Y',datum) AS INTEGER)=$y";
            cmd.Parameters.AddWithValue("$e", e);
            cmd.Parameters.AddWithValue("$h", honap);
            cmd.Parameters.AddWithValue("$y", ev);
            aktivNapok = Convert.ToInt32(cmd.ExecuteScalar());
        }

        // ── Ötletláda: CSAK szorgalmi, nem számít a jegybe ─────────────────
        int otletDb = 0;
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(*) FROM otlet_lada
                WHERE LOWER(email)=$e
                  AND CAST(strftime('%m',created_at) AS INTEGER)=$h
                  AND CAST(strftime('%Y',created_at) AS INTEGER)=$y";
            cmd.Parameters.AddWithValue("$e", e);
            cmd.Parameters.AddWithValue("$h", honap);
            cmd.Parameters.AddWithValue("$y", ev);
            otletDb = Convert.ToInt32(cmd.ExecuteScalar());
        }

        // ── Tananyag ───────────────────────────────────────────────────────
        int tananyagDb = 0;
        var tananyagKulcsok = new[] { "tananyagHtml","tananyagCss","tananyagBootstrap","pythonKezdo","pythonHalado" };
        foreach (var k in tananyagKulcsok)
        {
            var v = GetUserState(email, k);
            if (!string.IsNullOrEmpty(v) && v != "false" && v != "0") tananyagDb++;
        }

        // ── Súlyozott összpont (csoport alapján) ───────────────────────────
        double aktivSzaz  = Math.Min(aktivNapok / 8.0 * 100, 100);
        double tananyagBo = Math.Round(tananyagDb / 5.0 * 5, 1);

        bool webOnly = IsWebOnlyCsoport(user?.Evfolyam, user?.Osztaly, user?.Csoport);
        double osszSzaz;

        if (honap >= TartalmakHonapTol["halozat"])
        {
            // Május: Python 28% + WEB 22% + Interaktív 20% + Háló 20% + Aktív 10%
            if (webOnly)
                osszSzaz = webSzaz * 0.35 + interaktivSzaz * 0.30 + halozatSzaz * 0.25 + aktivSzaz * 0.10;
            else
                osszSzaz = pythonSzaz * 0.28 + webSzaz * 0.22 + interaktivSzaz * 0.20
                         + halozatSzaz * 0.20 + aktivSzaz * 0.10;
        }
        else
        {
            // Március–Április: Python 35% + WEB 30% + Interaktív 25% + Aktív 10%
            if (webOnly)
                osszSzaz = webSzaz * 0.55 + interaktivSzaz * 0.35 + aktivSzaz * 0.10;
            else
                osszSzaz = pythonSzaz * 0.35 + webSzaz * 0.30 + interaktivSzaz * 0.25
                         + aktivSzaz * 0.10;
        }
        osszSzaz = Math.Min(osszSzaz + tananyagBo, 105);

        int jegy = CalcJegy(osszSzaz);

        // ── Szorgalmi: Ötletláda most már CSAK ide számít ──────────────────
        bool szorgJelolt = osszSzaz >= 90
            || aktivNapok >= 15
            || otletDb >= 3
            || tananyagDb == 5;

        bool dicsJavasolt = osszSzaz >= 95 || aktivNapok >= 20 || otletDb >= 8;

        return new HaviJegyRow
        {
            Email            = email.ToLower().Trim(),
            Ev               = ev,
            Honap            = honap,
            Jegy             = jegy,
            PythonSzaz       = Math.Round(pythonSzaz,    1),
            WebSzaz          = Math.Round(webSzaz,       1),
            QuizSzaz         = Math.Round(interaktivSzaz,1),
            HalozatSzaz      = Math.Round(halozatSzaz,   1),
            AktivNapok       = aktivNapok,
            OtletDb          = otletDb,
            TananyagDb       = tananyagDb,
            OsszSzaz         = Math.Round(osszSzaz,      1),
            SzorgalmiJelolt  = szorgJelolt,
            DicseretJavasolt = dicsJavasolt,
        };
    }

    public AktualisReszlet CalcAktualisReszlet(string email, int ev, int honap)
    {
        var alap = CalcHaviJegy(email, ev, honap);
        using var conn = Open();
        var e = email.ToLower().Trim();

        double profiSzaz = 0, kavezosMaxSzaz = 0, halozatMaxSzaz = 0;

        // Python profi szint
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"SELECT MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100)
                FROM progress WHERE LOWER(email)=$e AND LOWER(targy)='python' AND feladat LIKE 'pro_%'";
            cmd.Parameters.AddWithValue("$e", e);
            var v = cmd.ExecuteScalar();
            if (v != DBNull.Value && v != null) profiSzaz = Convert.ToDouble(v);
        }

        // Web kávézó
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"SELECT MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100)
                FROM progress WHERE LOWER(email)=$e AND LOWER(targy)='web' AND feladat LIKE 'kavezos_%'";
            cmd.Parameters.AddWithValue("$e", e);
            var v = cmd.ExecuteScalar();
            if (v != DBNull.Value && v != null) kavezosMaxSzaz = Convert.ToDouble(v);
        }

        // Hálózat szimulátor
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"SELECT MAX(CAST(pont AS REAL)/NULLIF(max_pont,0)*100)
                FROM progress WHERE LOWER(email)=$e AND LOWER(targy)='halozat'";
            cmd.Parameters.AddWithValue("$e", e);
            var v = cmd.ExecuteScalar();
            if (v != DBNull.Value && v != null) halozatMaxSzaz = Convert.ToDouble(v);
        }

        return new AktualisReszlet(alap, Math.Round(profiSzaz, 1), Math.Round(kavezosMaxSzaz, 1), Math.Round(halozatMaxSzaz, 1));
    }

    public void UpsertHaviJegy(HaviJegyRow r)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO havijegyek
                (email,ev,honap,jegy,python_szaz,web_szaz,quiz_szaz,halozat_szaz,
                 aktiv_napok,otlet_db,tananyag_db,ossz_szaz,
                 szorgalmi_jelolt,dicseret_javasolt,updated_at)
            VALUES
                ($e,$ev,$h,$j,$py,$wb,$qz,$hal,$ak,$ot,$ta,$os,$sz,$dc,datetime('now'))
            ON CONFLICT(email,ev,honap) DO UPDATE SET
                jegy=$j, python_szaz=$py, web_szaz=$wb, quiz_szaz=$qz, halozat_szaz=$hal,
                aktiv_napok=$ak, otlet_db=$ot, tananyag_db=$ta, ossz_szaz=$os,
                szorgalmi_jelolt=$sz, dicseret_javasolt=$dc, updated_at=datetime('now')
            WHERE veglegesitve=0";
        cmd.Parameters.AddWithValue("$e",  r.Email);
        cmd.Parameters.AddWithValue("$ev", r.Ev);
        cmd.Parameters.AddWithValue("$h",  r.Honap);
        cmd.Parameters.AddWithValue("$j",  r.Jegy ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("$py",  r.PythonSzaz);
        cmd.Parameters.AddWithValue("$wb",  r.WebSzaz);
        cmd.Parameters.AddWithValue("$qz",  r.QuizSzaz);
        cmd.Parameters.AddWithValue("$hal", r.HalozatSzaz);
        cmd.Parameters.AddWithValue("$ak",  r.AktivNapok);
        cmd.Parameters.AddWithValue("$ot", r.OtletDb);
        cmd.Parameters.AddWithValue("$ta", r.TananyagDb);
        cmd.Parameters.AddWithValue("$os", r.OsszSzaz);
        cmd.Parameters.AddWithValue("$sz", r.SzorgalmiJelolt ? 1 : 0);
        cmd.Parameters.AddWithValue("$dc", r.DicseretJavasolt ? 1 : 0);
        cmd.ExecuteNonQuery();
    }

    public List<HaviJegyRow> GetHaviJegyek(int ev, int honap)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT h.id,h.email,h.ev,h.honap,h.jegy,
                   h.python_szaz,h.web_szaz,h.quiz_szaz,
                   h.aktiv_napok,h.otlet_db,h.tananyag_db,h.ossz_szaz,
                   h.szorgalmi_jelolt,h.szorgalmi_jegy_db,h.dicseret_javasolt,
                   h.veglegesitve,h.tanari_megjegyzes,
                   u.vezeteknev||' '||u.keresztnev AS nev, u.osztaly, u.csoport, u.evfolyam,
                   COALESCE(h.halozat_szaz,0)
            FROM havijegyek h
            JOIN users u ON LOWER(u.email)=LOWER(h.email)
            WHERE h.ev=$ev AND h.honap=$h
              AND LOWER(h.email) NOT IN ('tesztelek@kkszki.hu','bot@kkszki.hu')
              AND u.evfolyam = '10'
            ORDER BY u.evfolyam, u.osztaly, u.csoport, nev";
        cmd.Parameters.AddWithValue("$ev", ev);
        cmd.Parameters.AddWithValue("$h",  honap);
        var list = new List<HaviJegyRow>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(ReadHaviJegyRow(r));
        return list;
    }

    public List<HaviJegyRow> GetSajatHaviJegyek(string email)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id,email,ev,honap,jegy,
                   python_szaz,web_szaz,quiz_szaz,
                   aktiv_napok,otlet_db,tananyag_db,ossz_szaz,
                   szorgalmi_jelolt,szorgalmi_jegy_db,dicseret_javasolt,
                   veglegesitve,tanari_megjegyzes,
                   NULL,NULL,NULL,NULL,
                   COALESCE(halozat_szaz,0)
            FROM havijegyek
            WHERE LOWER(email)=$e AND veglegesitve=1
            ORDER BY ev,honap";
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        var list = new List<HaviJegyRow>();
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(ReadHaviJegyRow(r));
        return list;
    }

    public bool PatchHaviJegy(int id, int? jegy, int? szorgalmiJegyDb, bool? veglegesitve,
                               bool? dicseretAdva, string? megjegyzes)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        var sets = new List<string> { "updated_at=datetime('now')" };
        if (jegy.HasValue)           { sets.Add("jegy=$j");                cmd.Parameters.AddWithValue("$j",  jegy.Value); }
        if (szorgalmiJegyDb.HasValue){ sets.Add("szorgalmi_jegy_db=$sz");  cmd.Parameters.AddWithValue("$sz", szorgalmiJegyDb.Value); }
        if (veglegesitve.HasValue)   { sets.Add("veglegesitve=$v");        cmd.Parameters.AddWithValue("$v",  veglegesitve.Value ? 1 : 0); }
        if (megjegyzes != null)      { sets.Add("tanari_megjegyzes=$m");   cmd.Parameters.AddWithValue("$m",  megjegyzes); }
        cmd.CommandText = $"UPDATE havijegyek SET {string.Join(",", sets)} WHERE id=$id";
        cmd.Parameters.AddWithValue("$id", id);
        return cmd.ExecuteNonQuery() > 0;
    }

    private static HaviJegyRow ReadHaviJegyRow(Microsoft.Data.Sqlite.SqliteDataReader r) => new()
    {
        Id               = r.GetInt32(0),
        Email            = r.GetString(1),
        Ev               = r.GetInt32(2),
        Honap            = r.GetInt32(3),
        Jegy             = r.IsDBNull(4) ? null : r.GetInt32(4),
        PythonSzaz       = r.GetDouble(5),
        WebSzaz          = r.GetDouble(6),
        QuizSzaz         = r.GetDouble(7),
        AktivNapok       = r.GetInt32(8),
        OtletDb          = r.GetInt32(9),
        TananyagDb       = r.GetInt32(10),
        OsszSzaz         = r.GetDouble(11),
        SzorgalmiJelolt  = r.GetInt32(12) == 1,
        SzorgalmiJegyDb  = r.GetInt32(13),
        DicseretJavasolt = r.GetInt32(14) == 1,
        Veglegesitve     = r.GetInt32(15) == 1,
        TanariMegjegyzes = r.IsDBNull(16) ? null : r.GetString(16),
        Nev              = r.IsDBNull(17) ? null : r.GetString(17),
        Osztaly          = r.IsDBNull(18) ? null : r.GetString(18),
        Csoport          = r.IsDBNull(19) ? null : r.GetString(19),
        Evfolyam         = r.IsDBNull(20) ? null : r.GetString(20),
        HalozatSzaz      = r.IsDBNull(21) ? 0 : r.GetDouble(21),
    };
    public List<VizsgaBecslésRow> GetVizsgaBecslések()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT u.email,
                   u.vezeteknev||' '||u.keresztnev AS nev,
                   u.osztaly, u.csoport, u.evfolyam,
                   MAX(CASE WHEN us.state_key='vizsga_onbecsles' THEN us.state_value END) AS onbecsles,
                   MAX(CASE WHEN us.state_key='vizsga_tenyleges' THEN us.state_value END) AS tenyleges
            FROM users u
            LEFT JOIN user_state us ON LOWER(us.email)=LOWER(u.email)
              AND us.state_key IN ('vizsga_onbecsles','vizsga_tenyleges')
            WHERE u.evfolyam='10'
              AND LOWER(u.email) NOT IN ('tesztelek@kkszki.hu','bot@kkszki.hu')
            GROUP BY u.email
            ORDER BY u.osztaly, u.csoport, nev";
        var list = new List<VizsgaBecslésRow>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(new VizsgaBecslésRow(
                r.GetString(0), r.GetString(1),
                r.IsDBNull(2) ? null : r.GetString(2),
                r.IsDBNull(3) ? null : r.GetString(3),
                r.IsDBNull(4) ? null : r.GetString(4),
                r.IsDBNull(5) ? null : r.GetString(5),
                r.IsDBNull(6) ? null : r.GetString(6)
            ));
        return list;
    }
}

public record PasswordResetRequestRow(int Id, string Email, string Nev, string? Osztaly, string? Csoport, string CreatedAt);
