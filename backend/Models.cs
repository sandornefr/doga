namespace KandoTest;

public record LoginRequest(string Username, string Password);

public record ConfigRequest(string TestMode, string? VizsgaKezdes, string? VizsgaVege);

public record SubmissionRequest(
    string Name,
    string Email,
    string Osztaly,
    string? Csoport,
    string TaskIds,
    string Scores,
    string MaxScores,
    int TotalScore,
    int MaxTotal,
    int Duration,
    string Mode,
    string? CodeSnapshot,
    string? Subject
);

public class Submission
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Osztaly { get; set; } = "";
    public string? Csoport { get; set; }
    public string TaskIds { get; set; } = "";
    public string Scores { get; set; } = "";
    public string MaxScores { get; set; } = "";
    public int TotalScore { get; set; }
    public int MaxTotal { get; set; }
    public int Duration { get; set; }
    public string Mode { get; set; } = "";
    public string? Subject { get; set; }
    public string? CodeSnapshot { get; set; }
    public string SubmittedAt { get; set; } = "";
}

public class Stats
{
    public int TotalSubmissions { get; set; }
    public int TodaySubmissions { get; set; }
    public double AvgDuration { get; set; }
    public double AvgScore { get; set; }
    public List<ClassStat> ByClass { get; set; } = new List<ClassStat>();
}

public class ClassStat
{
    public string Osztaly { get; set; } = "";
    public int Count { get; set; }
    public double AvgScore { get; set; }
}

public record RegisterRequest(
    string Vezeteknev,
    string Keresztnev,
    string Email,
    string Jelszo,
    string JelszoMegerosites,
    string Szerep,          // "tanulo" vagy "oktato"
    string? OktatoiKod,
    string? Evfolyam,
    string? Osztaly,
    string? Csoport,
    string? CaptchaToken
);

public record UserLoginRequest(string Email, string Jelszo);

public record UserListItem(
    string Nev,
    string Email,
    string Szerep,
    string? Evfolyam,
    string? Osztaly,
    string? Csoport,
    string? CreatedAt
);

public record UserRecord(
    int Id,
    string Vezeteknev,
    string Keresztnev,
    string Email,
    string PasswordHash,
    string Szerep,
    string? Evfolyam,
    string? Osztaly,
    string? Csoport,
    bool MustChangePassword
);

public record ChangeOwnPasswordRequest(string Email, string OldPassword, string NewPassword);

// ── Task Sets ──────────────────────────────────────────────────────────────

// tipus: "gyakorlo" | "live" | "vizsga"
public record TaskSetRequest(string Nev, string? Tipus, string? PythonSzoveg, string? WebZipB64);

public class TaskSetItem
{
    public int Id { get; set; }
    public string Nev { get; set; } = "";
    public string Tipus { get; set; } = "vizsga";
    public bool Aktiv { get; set; }
    public bool HasPython { get; set; }
    public bool HasWeb { get; set; }
    public string? Letrehozva { get; set; }
}

public class TaskSetDetail
{
    public int Id { get; set; }
    public string Nev { get; set; } = "";
    public string Tipus { get; set; } = "vizsga";
    public bool Aktiv { get; set; }
    public string? PythonSzoveg { get; set; }
    public string? WebZipB64 { get; set; }
    public string? Letrehozva { get; set; }
}

// ── Progress / Gamification ────────────────────────────────────────────────

public record ProgressRequest(
    string Email,
    string? Nev,
    string? Osztaly,
    string Targy,      // "web" vagy "python"
    string Feladat,    // feladat azonosítója
    int Pont,
    int MaxPont,
    string? Mode
);

public record SubjectProgress(
    int Sessions,
    double AvgPercent,
    double BestPercent,
    string? LastSession
);

public record StudentProgress(
    SubjectProgress Web,
    SubjectProgress Python
);

public class ProgressSummaryItem
{
    public string Email { get; set; } = "";
    public string? Nev { get; set; }
    public string? Osztaly { get; set; }
    public SubjectProgress Web { get; set; } = new(0, 0, 0, null);
    public SubjectProgress Python { get; set; } = new(0, 0, 0, null);
}

public class LeaderboardItem
{
    public int Rank { get; set; }
    public string Email { get; set; } = "";
    public string? Nev { get; set; }
    public string? Osztaly { get; set; }
    public string? Csoport { get; set; }
    public SubjectProgress Web { get; set; } = new(0, 0, 0, null);
    public SubjectProgress Python { get; set; } = new(0, 0, 0, null);
    public double WebPont { get; set; }
    public double PythonPont { get; set; }
    public double OsszesPont { get; set; }
    public int Streak { get; set; }
}

public record RankInfo(
    int Rank,
    int GroupSize,
    string GroupLabel,
    double AvgPercent
);

public record StudentRankResult(
    RankInfo Web,
    RankInfo Python,
    int Streak
);

// ── Task Ratings / Feedback ────────────────────────────────────────────────

public record UpdateScoresRequest(string Scores, string MaxScores, int TotalScore, int MaxTotal);

public record FeedbackRequest(string Email, string FeladatNev, string Tipus, int Ertek);

public class TaskRatingStat {
    public string FeladatNev { get; set; } = "";
    public string Tipus { get; set; } = "";  // "vote" or "reaction"
    public int Ertek { get; set; }
    public int Db { get; set; }
}
