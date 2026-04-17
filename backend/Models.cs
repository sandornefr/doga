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
    string? CreatedAt,
    string? Vezeteknev = null,
    string? Keresztnev = null
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

public record ThreeScopeRanks(
    RankInfo? Csoport,
    RankInfo? Osztaly,
    RankInfo? Evfolyam,
    RankInfo? Kando
);

public record StudentRankResult(
    ThreeScopeRanks Web,
    ThreeScopeRanks Python,
    int Streak
);

// ── Completion Stats ───────────────────────────────────────────────────────

public class CompletionStatItem {
    public string Email              { get; set; } = "";
    public string? Nev               { get; set; }
    public string? Evfolyam          { get; set; }
    public string? Osztaly           { get; set; }
    public string? Csoport           { get; set; }
    public string? TananyagHtml      { get; set; }
    public string? TananyagCss       { get; set; }
    public string? TananyagBootstrap { get; set; }
    public string? TananyagEmmet     { get; set; }
    public string? PythonKezdo       { get; set; }
    public string? PythonHalado      { get; set; }
    public string? PythonProAlgoritmus { get; set; }
}

// ── Task Ratings / Feedback ────────────────────────────────────────────────

public record UpdateScoresRequest(string Scores, string MaxScores, int TotalScore, int MaxTotal);

public record FeedbackRequest(string Email, string FeladatNev, string Tipus, int Ertek);

public class TaskRatingStat {
    public string FeladatNev { get; set; } = "";
    public string Tipus { get; set; } = "";  // "vote" or "reaction"
    public int Ertek { get; set; }
    public int Db { get; set; }
}

// ── Ötlet Láda ────────────────────────────────────────────────────────────

public record IdeaRequest(string Email, string Nev, string? Osztaly, string Szoveg, string? KepBase64, string? Tipus);

public record IdeaUpdateRequest(string Statusz, string? AdminValasz, string? MegvalositvaSzoveg);

public class IdeaItem {
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string Nev { get; set; } = "";
    public string? Osztaly { get; set; }
    public string Szoveg { get; set; } = "";
    public string Tipus { get; set; } = "otlet"; // otlet / hiba
    public bool HasKep { get; set; }
    public string? KepBase64 { get; set; }   // csak explicit kérésnél töltjük
    public string Statusz { get; set; } = "uj"; // uj / olvasott / megvalasult
    public string? AdminValasz { get; set; }
    public string? MegvalositvaSzoveg { get; set; }
    public string CreatedAt { get; set; } = "";
}

// ── Sessions ──────────────────────────────────────────────────────────────

public record SessionStartRequest(string Email, string Page);
public record HeartbeatRequest(int SessionId);
public record SessionEndRequest(int SessionId);

public class SessionPageStat
{
    public string Page         { get; set; } = "";
    public int    TotalSec     { get; set; }
    public int    SessionCount { get; set; }
}

public class UserSessionStat
{
    public string  Email    { get; set; } = "";
    public string? Nev      { get; set; }
    public string? Osztaly  { get; set; }
    public int     TotalSec { get; set; }
    public List<SessionPageStat> Pages { get; set; } = new();
}

public class TeszteloiUzenetItem {
    public int Id { get; set; }
    public string Szoveg { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public bool Olvasott { get; set; }
}

public class AdminUzenetItem {
    public int Id { get; set; }
    public string Szoveg { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public int OsszTesztelő { get; set; }
    public List<string> Olvastak { get; set; } = new List<string>();
    public List<string> NemOlvastak { get; set; } = new List<string>();
}

// ── Feladatkészítők ────────────────────────────────────────────────────────

public record FeladatJavaslatRequest(
    string Email, string Nev, string? Osztaly,
    string Cim, int Pont, string Tipus,
    string Szoveg, string? Megoldas
);

public record FeladatJavaslatUpdateRequest(string Statusz, string? Visszajelzes, string? MegvalositvaSzoveg);

public class FeladatJavaslatItem {
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string Nev { get; set; } = "";
    public string? Osztaly { get; set; }
    public string Cim { get; set; } = "";
    public int Pont { get; set; }
    public string Tipus { get; set; } = "";
    public string Szoveg { get; set; } = "";
    public string? Megoldas { get; set; }
    public string Statusz { get; set; } = "uj";
    public string? Visszajelzes { get; set; }
    public string? MegvalositvaSzoveg { get; set; }
    public string CreatedAt { get; set; } = "";
}

public class FeladatKeszitőStat {
    public string Email { get; set; } = "";
    public string? Nev { get; set; }
    public string? Osztaly { get; set; }
    public int Osszes { get; set; }
    public int Elfogadva { get; set; }
    public int Megvalositva { get; set; }
    public Dictionary<string, int> TypusDb { get; set; } = new();
}

public record TeszteloiKervenyek(string Email, string Nev, string? Osztaly, string CreatedAt);

public record TeszteloJelentkezesRequest(string Email, string? Nev, string? Osztaly);

// ── Quiz eredmények ────────────────────────────────────────────────────────

public record QuizResultRequest(
    string Nev,
    string? Email,
    string? Osztaly,
    string? Csoport,
    string Tipus,
    int Pont,
    int MaxPont,
    int Szazalek,
    int? Jegy,
    int? IdoMp
);

public class QuizResultItem
{
    public int     Id          { get; set; }
    public string  Nev         { get; set; } = "";
    public string  Email       { get; set; } = "";
    public string  Osztaly     { get; set; } = "";
    public string  Csoport     { get; set; } = "";
    public string  Tipus       { get; set; } = "";
    public int     Pont        { get; set; }
    public int     MaxPont     { get; set; }
    public int     Szazalek    { get; set; }
    public int?    Jegy        { get; set; }
    public int?    IdoMp       { get; set; }
    public string  SubmittedAt { get; set; } = "";
}

public class ProgressDetailItem
{
    public string Targy   { get; set; } = "";
    public string Feladat { get; set; } = "";
    public int    Pont    { get; set; }
    public int    MaxPont { get; set; }
    public string Datum   { get; set; } = "";
}

// ── Számonkérés ───────────────────────────────────────────────────────────────

public record SzamonkeresCreateRequest(
    string Cim,
    string Csoportok,   // JSON: ["13C/1","13B"]
    string Feladatok,   // JSON array of task objects
    string Ponthatarak  // JSON: {"ket":40,"harom":55,"negy":70,"ot":85}
);

public class SzamonkeresItem
{
    public int    Id           { get; set; }
    public string Cim          { get; set; } = "";
    public string OktatoEmail  { get; set; } = "";
    public string Csoportok    { get; set; } = "[]";
    public string Feladatok    { get; set; } = "[]";
    public string Ponthatarak  { get; set; } = "{}";
    public string Statusz      { get; set; } = "aktiv"; // aktiv / lezart / kiadva
    public string CreatedAt    { get; set; } = "";
    public int    BeadasokSzama { get; set; }
}

public record BeadasCreateRequest(
    string  TanuloEmail,
    string  TanuloNev,
    string? Osztaly,
    string? Csoport,
    string  FeladatId,
    string? Kod,
    int     AutoPont,
    int     MaxPont
);

public class BeadasItem
{
    public int     Id             { get; set; }
    public int     SzamonkeresId  { get; set; }
    public string  TanuloEmail    { get; set; } = "";
    public string  TanuloNev      { get; set; } = "";
    public string? Osztaly        { get; set; }
    public string? Csoport        { get; set; }
    public string  FeladatId      { get; set; } = "";
    public string? Kod            { get; set; }
    public int     AutoPont       { get; set; }
    public int?    ManualisPont   { get; set; }
    public int     MaxPont        { get; set; }
    public string? Megjegyzes     { get; set; }
    public string  SubmittedAt    { get; set; } = "";
}

public record SetBeadasPontRequest(int Pont, string? Megjegyzes);

// ── Oktatói haladás dashboard ─────────────────────────────────────────────────

public class HaladasItem
{
    public string  Email              { get; set; } = "";
    public string? Nev                { get; set; }
    public string? Evfolyam           { get; set; }
    public string? Osztaly            { get; set; }
    public string? Csoport            { get; set; }
    // WEB tananyag szintek (null = nem teljesítette)
    public string? TananyagHtml       { get; set; }
    public string? TananyagCss        { get; set; }
    public string? TananyagBootstrap  { get; set; }
    public string? TananyagEmmet      { get; set; }
    public string? TananyagJavascript { get; set; }
    public string? TananyagDevtools   { get; set; }
    // Python szintek (null = nem teljesítette)
    public string? PythonKezdo         { get; set; }
    public string? PythonHalado        { get; set; }
    public string? PythonProAlgoritmus { get; set; }
    // Python Ágazati practice
    public int     PythonSessions     { get; set; }
    public double  PythonAvgPct       { get; set; }
    public double  PythonBestPct      { get; set; }
    public string? PythonLastDate     { get; set; }
    // WEB practice
    public int     WebSessions        { get; set; }
    public double  WebAvgPct          { get; set; }
    public double  WebBestPct         { get; set; }
    public string? WebLastDate        { get; set; }
    // WEB Ágazati alapvizsga feladatok (9 forrásfeladat)
    public int     WebAgazatiSessions { get; set; }
    // Interaktív teszt
    public int     InteraktivDb       { get; set; }
    public double  InteraktivBestPct  { get; set; }
    // Tudáspróba (HTML+CSS+Bootstrap quiz)
    public double  TudasproBestPct    { get; set; }
    // Utolsó aktivitás
    public string? LastActive         { get; set; }
}

public class HaladasTanuloDetail : HaladasItem
{
    public List<SzamonkeresEredmenyItem> Szamonkeres { get; set; } = new();
}

public class SzamonkeresEredmenyItem
{
    public int    SzamonkeresId { get; set; }
    public string Cim           { get; set; } = "";
    public string OktatoEmail   { get; set; } = "";
    public int    OsszPont      { get; set; }
    public int    MaxPont       { get; set; }
    public int    Szazalek      { get; set; }
    public string SubmittedAt   { get; set; } = "";
}

public class HaladasOsztalyStat
{
    public string Osztaly         { get; set; } = "";
    public int    TanuloCount     { get; set; }
    public int    AktivCount      { get; set; }  // aktív az elmúlt 14 napban
    public double TananyagAtlag   { get; set; }  // átlag teljesített szintek száma (0–5)
    public double PythonFeladAtlag { get; set; } // átlag Python practice feladatok száma
    public double WebFeladAtlag   { get; set; }  // átlag WEB practice feladatok száma
}
