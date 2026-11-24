using Microsoft.Data.Sqlite;

namespace KandoTest;

// IKT Témaoldal: a tanár végleges pontozása (a gépi előellenőrzés csak tájékoztató).
// A pontok szempontonként, a Témaoldal pontozójának sorrendjében, JSON-szövegként tárolva.
public record IktErtekeles(string Pontok, int Osszes, int? Jegy, string? Oktato, string UpdatedAt);

public partial class Database
{
    // A Témaoldal pontozója (sorrend és max pont) – a frontend ikt-ellenor.js ellenoriz() sorrendje szerint, összesen 20.
    public static readonly int[] IktPontozoMax = { 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 1, 1, 3, 1 };

    // Ponthatárok (20 pont): 18–20 jeles, 15–17 jó, 12–14 közepes, 10–11 elégséges, 0–9 elégtelen.
    public static int IktJegy(int osszes) => osszes >= 18 ? 5 : osszes >= 15 ? 4 : osszes >= 12 ? 3 : osszes >= 10 ? 2 : 1;

    public void InitIktErtekeles()
    {
        using var conn = Open();
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS ikt_ertekeles (
                beadas_id   INTEGER PRIMARY KEY,
                pontok      TEXT NOT NULL,
                osszes      INTEGER NOT NULL,
                jegy        INTEGER,
                oktato      TEXT,
                updated_at  TEXT DEFAULT (datetime('now','localtime'))
            );
        ");
    }

    public void SaveIktErtekeles(int beadasId, string pontok, int osszes, int? jegy, string? oktato)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO ikt_ertekeles (beadas_id, pontok, osszes, jegy, oktato) VALUES ($b,$p,$o,$j,$k)
            ON CONFLICT(beadas_id) DO UPDATE SET pontok = $p, osszes = $o, jegy = $j, oktato = $k,
                updated_at = datetime('now','localtime')";
        cmd.Parameters.AddWithValue("$b", beadasId);
        cmd.Parameters.AddWithValue("$p", pontok);
        cmd.Parameters.AddWithValue("$o", osszes);
        cmd.Parameters.AddWithValue("$j", (object?)jegy ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$k", (object?)oktato ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    public IktErtekeles? GetIktErtekeles(int beadasId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT pontok, osszes, jegy, oktato, updated_at FROM ikt_ertekeles WHERE beadas_id = $b";
        cmd.Parameters.AddWithValue("$b", beadasId);
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;
        return new IktErtekeles(r.GetString(0), r.GetInt32(1), r.IsDBNull(2) ? null : r.GetInt32(2),
            r.IsDBNull(3) ? null : r.GetString(3), r.IsDBNull(4) ? "" : r.GetString(4));
    }
}
