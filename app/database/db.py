import aiosqlite
import json
import os
import numpy as np
from pathlib import Path

# Pastikan direktori database ada
DATABASE_DIR = Path(__file__).parent
DATABASE_PATH = DATABASE_DIR / "face_attendance.db"

# Inisialisasi database
async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        await db.execute('''
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            embedding BLOB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        await db.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        await db.commit()

# Fungsi untuk menambahkan user baru
async def add_user(name, email):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (name, email)
        )
        await db.commit()
        return cursor.lastrowid

# Fungsi untuk menambahkan embedding wajah
async def add_face_embedding(user_id, embedding):
    # Konversi embedding numpy ke bytes untuk storage
    embedding_bytes = np.array(embedding).tobytes()
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT INTO face_embeddings (user_id, embedding) VALUES (?, ?)",
            (user_id, embedding_bytes)
        )
        await db.commit()

# Fungsi untuk mendapatkan semua embedding untuk perbandingan
async def get_all_embeddings():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        rows = await db.execute(
            "SELECT user_id, embedding FROM face_embeddings"
        )
        results = await rows.fetchall()
        
        embeddings = []
        for row in results:
            # Konversi bytes kembali ke array numpy
            embedding = np.frombuffer(row['embedding'], dtype=np.float32)
            embeddings.append({
                'user_id': row['user_id'],
                'embedding': embedding
            })
        
        return embeddings

# Fungsi untuk mencatat kehadiran
async def record_attendance(user_id):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT INTO attendance (user_id) VALUES (?)",
            (user_id,)
        )
        await db.commit()

# Fungsi untuk mendapatkan data user berdasarkan id
async def get_user_by_id(user_id):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM users WHERE id = ?", 
            (user_id,)
        )
        return await cursor.fetchone()

# Fungsi untuk mendapatkan riwayat kehadiran
async def get_attendance_history(limit=50):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT a.id, a.timestamp, u.name, u.email, u.id as user_id
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.timestamp DESC
            LIMIT ?
            """,
            (limit,)
        )
        return await cursor.fetchall()

async def check_user_exists_by_email(email):
    """Memeriksa apakah email sudah terdaftar dalam database"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        )
        user = await cursor.fetchone()
    return user is not None 