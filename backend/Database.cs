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
        ");
        try { Exec(conn, "ALTER TABLE submissions ADD COLUMN subject TEXT"); } catch { }
        try { Exec(conn, "ALTER TABLE progress ADD COLUMN mode TEXT DEFAULT 'gyakorlo'"); } catch { }
        try { Exec(conn, "ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0"); } catch { }
        try { Exec(conn, "ALTER TABLE otlet_lada ADD COLUMN tipus TEXT NOT NULL DEFAULT 'otlet'"); } catch { }
        try { Exec(conn, "ALTER TABLE teszteloi_uzenetek ADD COLUMN recipient_email TEXT"); } catch { }
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
        cmd.Parameters.AddWithValue("$s",  r.Szerep);
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
                r.IsDBNull(7) ? null : r.GetString(7)
            ));
        return list;
    }

    // ── Progress ──────────────────────────────────────────────────────────────

    public void SaveProgress(ProgressRequest r)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO progress (email, nev, osztaly, targy, feladat, pont, max_pont, mode)
            VALUES ($email, $nev, $osztaly, $targy, $feladat, $pont, $max_pont, $mode)";
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
        var user = GetUserByEmail(email);
        var csoport = user?.Csoport;
        var osztaly = user?.Osztaly;

        using var conn = Open();
        using var cmd = conn.CreateCommand();

        var groupLabel = csoport != null && osztaly != null
            ? $"{osztaly}/{csoport}-es csoport"
            : osztaly != null ? $"{osztaly} osztály" : "Évfolyam";

        var where = new List<string>();
        if (csoport != null) { where.Add("LOWER(COALESCE(u.csoport,'')) = LOWER($cs)"); cmd.Parameters.AddWithValue("$cs", csoport); }
        else if (osztaly != null) { where.Add("LOWER(COALESCE(p.osztaly,'')) = LOWER($o)"); cmd.Parameters.AddWithValue("$o", osztaly); }

        cmd.CommandText = $@"
            SELECT p.email, p.targy,
                ROUND(AVG(CAST(p.pont AS REAL) / NULLIF(p.max_pont,0) * 100), 1) as avg_pct,
                COUNT(*) as sessions
            FROM progress p
            LEFT JOIN users u ON LOWER(p.email) = LOWER(u.email)
            {(where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "")}
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

        return new StudentRankResult(
            new RankInfo(wi >= 0 ? wi + 1 : 0, web.Count, groupLabel, mw.avg),
            new RankInfo(pi >= 0 ? pi + 1 : 0, py .Count, groupLabel, mp.avg),
            GetStreak(email)
        );
    }

    private static double CompScore(double avgPct, int sessions) =>
        avgPct * 0.7 + Math.Min(sessions, 20) / 20.0 * 30.0;

    public int GetStreak(string email)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT DISTINCT datum FROM progress
            WHERE LOWER(email) = $email AND datum IS NOT NULL AND datum != ''
            ORDER BY datum DESC";
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
        if (datesDesc.Count == 0) return 0;
        var today     = DateTime.Today;
        var yesterday = today.AddDays(-1);
        if (datesDesc[0] != today && datesDesc[0] != yesterday) return 0;
        int streak = 1;
        for (int i = 1; i < datesDesc.Count; i++)
        {
            if ((datesDesc[i - 1] - datesDesc[i]).TotalDays == 1) streak++;
            else break;
        }
        return streak;
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

    // ── Task Ratings ──────────────────────────────────────────────────────────

    public void SaveRating(string email, string feladatNev, string tipus, int ertek)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO task_ratings (email, feladat_nev, tipus, ertek)
            VALUES ($email, $feladat_nev, $tipus, $ertek)
            ON CONFLICT(email, feladat_nev, tipus) DO UPDATE SET ertek = $ertek, created_at = datetime('now','localtime')";
        cmd.Parameters.AddWithValue("$email",       email);
        cmd.Parameters.AddWithValue("$feladat_nev", feladatNev);
        cmd.Parameters.AddWithValue("$tipus",       tipus);
        cmd.Parameters.AddWithValue("$ertek",       ertek);
        cmd.ExecuteNonQuery();
    }

    public List<TaskRatingStat> GetRatingStats()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT feladat_nev, tipus, ertek, COUNT(*) as db
            FROM task_ratings
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
            FROM otlet_lada WHERE statusz = 'megvalasult'
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
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO sessions (user_email, page, login_at, last_heartbeat, duration_sec)
            VALUES ($email, $page, datetime('now','localtime'), datetime('now','localtime'), 0)
            RETURNING id";
        cmd.Parameters.AddWithValue("$email", email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$page",  page);
        return Convert.ToInt32(cmd.ExecuteScalar());
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
}
