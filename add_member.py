import sqlite3

DB_PATH = 'projects.db'

def add_member():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if WR-042 already exists
    c.execute("SELECT * FROM members WHERE id = ?", ("WR-042",))
    existing = c.fetchone()
    
    member_data = (
        "WR-042",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        "RTR. NITIN GUPTA",
        "",
        "",
        "Director",
        "PROFESSIONAL DEVELOPMENT DIRECTOR",
        "Active",
        "Not paid",
        0,
        "",
        ""
    )
    
    if existing:
        print("WR-042 already exists, updating...")
        c.execute("""
            UPDATE members 
            SET photo=?, name=?, email=?, phone=?, role=?, position=?, status=?, payment=?, isSecretaryAdmin=?, ri_id=?, birthday=?
            WHERE id=?
        """, (
            member_data[1], member_data[2], member_data[3], member_data[4],
            member_data[5], member_data[6], member_data[7], member_data[8],
            member_data[9], member_data[10], member_data[11], member_data[0]
        ))
    else:
        print("Inserting WR-042 into members table...")
        c.execute("""
            INSERT INTO members (id, photo, name, email, phone, role, position, status, payment, isSecretaryAdmin, ri_id, birthday)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, member_data)
        
    conn.commit()
    
    # Print the inserted/updated row
    c.execute("SELECT * FROM members WHERE id = ?", ("WR-042",))
    row = c.fetchone()
    print("WR-042 record:", row)
    
    # Print count of members
    c.execute("SELECT COUNT(*) FROM members")
    count = c.fetchone()[0]
    print("Total members in database:", count)
    
    conn.close()

if __name__ == '__main__':
    add_member()
    try:
        from server import sync_members_to_google_sheet
        print("Triggering Google Sheet sync...")
        result = sync_members_to_google_sheet()
        print("Sync result:", result)
    except Exception as e:
        print("Google Sheet sync notice:", e)
