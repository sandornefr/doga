using Microsoft.Data.Sqlite;

namespace KandoTest;

// IKT Vezetett tanmenet: a tanuló alkalmanként jelzi, kész-e, vagy van, amit nem ért (+ rövid megjegyzés).
public record IktTeendo(string Email, string? Nev, string? Osztaly, string? Csoport, int Alkalom, string Allapot, string? Megjegyzes, string UpdatedAt);

public partial class Database
{
    public static readonly string[] IktTeendoAllapotok = { "kesz", "nemertem" };

    public void InitIktTeendo()
    {
        using var conn = Open();
        Exec(conn, @"
            CREATE TABLE IF NOT EXISTS ikt_teendo (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                email       TEXT NOT NULL,
                nev         TEXT,
                osztaly     TEXT,
                csoport     TEXT,
                alkalom     INTEGER NOT NULL,
                allapot     TEXT NOT NULL,
                megjegyzes  TEXT,
                updated_at  TEXT DEFAULT (datetime('now','localtime')),
                UNIQUE(email, alkalom)
            );
        ");
    }

    // allapot üres: a jelzés törlése (a tanuló visszavonta).
    public void SaveIktTeendo(string email, string? nev, string? osztaly, string? csoport, int alkalom, string allapot, string? megjegyzes)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        if (string.IsNullOrEmpty(allapot))
        {
            cmd.CommandText = "DELETE FROM ikt_teendo WHERE email = $e AND alkalom = $a";
        }
        else
        {
            cmd.CommandText = @"
                INSERT INTO ikt_teendo (email, nev, osztaly, csoport, alkalom, allapot, megjegyzes) VALUES ($e,$n,$o,$c,$a,$s,$m)
                ON CONFLICT(email, alkalom) DO UPDATE SET nev = $n, osztaly = $o, csoport = $c, allapot = $s, megjegyzes = $m,
                    updated_at = datetime('now','localtime')";
            cmd.Parameters.AddWithValue("$n", (object?)nev ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$o", (object?)osztaly ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$c", (object?)csoport ?? DBNull.Value);
            cmd.Parameters.AddWithValue("$s", allapot);
            cmd.Parameters.AddWithValue("$m", string.IsNullOrWhiteSpace(megjegyzes) ? DBNull.Value : megjegyzes);
        }
        cmd.Parameters.AddWithValue("$e", email);
        cmd.Parameters.AddWithValue("$a", alkalom);
        cmd.ExecuteNonQuery();
    }

    public List<IktTeendo> GetIktTeendok(string? email = null)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT email, nev, osztaly, csoport, alkalom, allapot, megjegyzes, updated_at FROM ikt_teendo"
            + (email != null ? " WHERE email = $e" : "") + " ORDER BY osztaly, csoport, nev, alkalom";
        if (email != null) cmd.Parameters.AddWithValue("$e", email);
        using var r = cmd.ExecuteReader();
        var lista = new List<IktTeendo>();
        while (r.Read())
            lista.Add(new IktTeendo(r.GetString(0), r.IsDBNull(1) ? null : r.GetString(1), r.IsDBNull(2) ? null : r.GetString(2),
                r.IsDBNull(3) ? null : r.GetString(3), r.GetInt32(4), r.GetString(5), r.IsDBNull(6) ? null : r.GetString(6),
                r.IsDBNull(7) ? "" : r.GetString(7)));
        return lista;
    }
}
