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
        
        # Konversi hasil menjadi list
        results = []
        for row in await cursor.fetchall():
            data = dict(row)
            # Ganti nama kolom dari email menjadi class
            data['class'] = data['email']
            del data['email']
            results.append(data)
        
        return results

async def check_user_exists_by_email(email):
    """Memeriksa apakah email sudah terdaftar dalam database"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        )
        user = await cursor.fetchone()
    return user is not None 

async def delete_user(user_id):
    """Menghapus user dari database berdasarkan ID"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Hapus embedding terkait terlebih dahulu (foreign key constraint)
        await db.execute(
            "DELETE FROM face_embeddings WHERE user_id = ?",
            (user_id,)
        )
        
        # Hapus data kehadiran (foreign key constraint)
        await db.execute(
            "DELETE FROM attendance WHERE user_id = ?",
            (user_id,)
        )
        
        # Hapus user
        await db.execute(
            "DELETE FROM users WHERE id = ?",
            (user_id,)
        )
        
        await db.commit()

# Fungsi admin
async def get_all_users():
    """Mengambil semua data user untuk admin"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT u.id, u.name, u.email, u.created_at, 
                   COUNT(fe.id) as face_count
            FROM users u
            LEFT JOIN face_embeddings fe ON u.id = fe.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            """,
        )
        
        # Konversi ke list of dicts
        users = []
        for row in await cursor.fetchall():
            user_dict = dict(row)
            # Ganti nama kolom dari email menjadi class
            user_dict['class'] = user_dict['email']
            del user_dict['email']
            
            # Dapatkan embeddings untuk user ini
            embeddings_cursor = await db.execute(
                """
                SELECT id, created_at 
                FROM face_embeddings
                WHERE user_id = ?
                ORDER BY created_at DESC
                """,
                (user_dict['id'],)
            )
            
            # Tambahkan embeddings ke user dict
            embeddings = []
            for emb_row in await embeddings_cursor.fetchall():
                embeddings.append(dict(emb_row))
            
            user_dict['embeddings'] = embeddings
            users.append(user_dict)
        
        return users

async def get_user_embeddings(user_id):
    """Mengambil semua embedding dari user tertentu"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT id, user_id, created_at 
            FROM face_embeddings
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user_id,)
        )
        
        # Konversi ke list of dicts
        embeddings = []
        for row in await cursor.fetchall():
            embedding_dict = dict(row)
            embeddings.append(embedding_dict)
        
        return embeddings

async def delete_embedding(embedding_id):
    """Menghapus embedding tertentu dari database"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "DELETE FROM face_embeddings WHERE id = ?",
            (embedding_id,)
        )
        await db.commit() 