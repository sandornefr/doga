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
        ");
        try { Exec(conn, "ALTER TABLE submissions ADD COLUMN subject TEXT"); } catch { }
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
                   szerep, evfolyam, osztaly, csoport
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
            r.IsDBNull(8) ? null : r.GetString(8)
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
        cmd.CommandText = "UPDATE users SET password_hash = $h WHERE email = $e";
        cmd.Parameters.AddWithValue("$h", newHash);
        cmd.Parameters.AddWithValue("$e", email.ToLower().Trim());
        return cmd.ExecuteNonQuery() > 0;
    }

    public List<UserListItem> GetAllUsers()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT vezeteknev, keresztnev, email, szerep, osztaly, csoport, created_at
            FROM users ORDER BY created_at DESC";
        using var r = cmd.ExecuteReader();
        var list = new List<UserListItem>();
        while (r.Read())
            list.Add(new UserListItem(
                $"{r.GetString(0)} {r.GetString(1)}",
                r.GetString(2),
                r.GetString(3),
                r.IsDBNull(4) ? null : r.GetString(4),
                r.IsDBNull(5) ? null : r.GetString(5),
                r.IsDBNull(6) ? null : r.GetString(6)
            ));
        return list;
    }

    // ── Progress ──────────────────────────────────────────────────────────────

    public void SaveProgress(ProgressRequest r)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO progress (email, nev, osztaly, targy, feladat, pont, max_pont)
            VALUES ($email, $nev, $osztaly, $targy, $feladat, $pont, $max_pont)";
        cmd.Parameters.AddWithValue("$email",   r.Email.ToLower().Trim());
        cmd.Parameters.AddWithValue("$nev",     (object?)r.Nev     ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$osztaly", (object?)r.Osztaly ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$targy",   r.Targy.ToLower());
        cmd.Parameters.AddWithValue("$feladat", r.Feladat);
        cmd.Parameters.AddWithValue("$pont",    r.Pont);
        cmd.Parameters.AddWithValue("$max_pont",r.MaxPont);
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
            int i = 0;
            var s = new Submission
            {
                Id          = r.GetInt32(i++),
                Name        = r.GetString(i++),
                Email       = r.GetString(i++),
                Osztaly     = r.IsDBNull(i) ? "" : r.GetString(i++),
                Csoport     = r.IsDBNull(i) ? null : r.GetString(i++),
                TaskIds     = r.IsDBNull(i) ? "" : r.GetString(i++),
                Scores      = r.IsDBNull(i) ? "" : r.GetString(i++),
                MaxScores   = r.IsDBNull(i) ? "" : r.GetString(i++),
                TotalScore  = r.IsDBNull(i) ? 0  : r.GetInt32(i++),
                MaxTotal    = r.IsDBNull(i) ? 0  : r.GetInt32(i++),
                Duration    = r.IsDBNull(i) ? 0  : r.GetInt32(i++),
                Mode        = r.IsDBNull(i) ? "" : r.GetString(i++),
            };
            s.Subject = r.IsDBNull(i) ? null : r.GetString(i++);
            if (includeCode)
            {
                s.CodeSnapshot = r.IsDBNull(i) ? null : r.GetString(i++);
            }
            else i++;
            s.SubmittedAt = r.IsDBNull(i) ? "" : r.GetString(i);
            list.Add(s);
        }
        return list;
    }
}
