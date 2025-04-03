from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends, Header
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import time
import asyncio
import jwt
from typing import List, Optional
import io
from datetime import datetime, timedelta

from app.models.face_recognition import detect_faces, get_embedding, find_match
from app.database.db import (
    add_user, add_face_embedding, get_all_embeddings, 
    record_attendance, get_user_by_id, get_attendance_history, 
    check_user_exists_by_email, delete_user, get_all_users,
    get_user_embeddings, delete_embedding
)

router = APIRouter()

# Cache untuk menyimpan embedding sementara agar tidak perlu query database berulang kali
embedding_cache = {}
last_cache_update = 0
CACHE_TIMEOUT = 60  # seconds

# Admin auth settings
ADMIN_PASSWORD = "kelasking#1234"
JWT_SECRET = "supersecretkey123456789"  # Dalam produksi sebaiknya disimpan di environment variable
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 60  # dalam menit

# Fungsi untuk menciptakan token JWT
def create_jwt_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return encoded_jwt

# Fungsi untuk memverifikasi token JWT
def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("is_admin") is not True:
            return None
        return payload
    except jwt.PyJWTError:
        return None

# Dependency untuk autentikasi admin
async def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token autentikasi tidak valid"
        )
    
    token = authorization.replace("Bearer ", "")
    payload = verify_jwt_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token autentikasi tidak valid atau sudah kadaluarsa"
        )
    
    return payload

async def get_cached_embeddings():
    global embedding_cache, last_cache_update
    
    # Perbarui cache jika sudah kadaluarsa
    current_time = time.time()
    if not embedding_cache or (current_time - last_cache_update) > CACHE_TIMEOUT:
        embedding_cache = await get_all_embeddings()
        last_cache_update = current_time
    
    return embedding_cache

@router.post("/register")
async def register_user(
    name: str = Form(...),
    email: str = Form(...),
    photos: List[UploadFile] = File(...)
):
    # Cek apakah email sudah terdaftar
    user_exists = await check_user_exists_by_email(email)
    if user_exists:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Email sudah terdaftar"}
        )
    
    if len(photos) == 0:
        raise HTTPException(status_code=400, detail="Minimal satu foto wajah diperlukan")
    
    # Tambahkan user ke database
    user_id = await add_user(name, email)
    
    embeddings = []
    
    # Proses setiap foto
    for photo in photos:
        contents = await photo.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Deteksi wajah
        faces, _ = detect_faces(img)
        
        if not faces:
            continue
        
        # Ambil wajah pertama
        face_img = faces[0]
        
        # Ekstrak embedding
        embedding = get_embedding(face_img)
        
        if embedding is not None:
            # Simpan embedding ke database
            await add_face_embedding(user_id, embedding)
            embeddings.append(embedding)
    
    if not embeddings:
        raise HTTPException(status_code=400, detail="Tidak ada wajah terdeteksi di foto yang diunggah")
    
    # Reset cache karena database berubah
    global last_cache_update
    last_cache_update = 0
    
    return {"status": "success", "user_id": user_id, "message": f"User {name} berhasil terdaftar"}

@router.post("/recognize")
async def recognize_face(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    # Baca gambar dari request
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Deteksi wajah
    faces, face_locations = detect_faces(img)
    
    if not faces:
        raise HTTPException(status_code=400, detail="Tidak ada wajah terdeteksi")
    
    # Ambil wajah pertama
    face_img = faces[0]
    
    # Ekstrak embedding
    embedding = get_embedding(face_img)
    
    if embedding is None:
        raise HTTPException(status_code=400, detail="Gagal mengekstrak fitur wajah")
    
    # Dapatkan embedding dari cache/database
    stored_embeddings = await get_cached_embeddings()
    
    # Temukan kecocokan
    match_result = find_match(embedding, stored_embeddings)
    
    if match_result is None:
        return {"status": "failed", "message": "Wajah tidak dikenali"}
    
    user_id, confidence = match_result
    
    # Catat kehadiran di background untuk respons yang lebih cepat
    if background_tasks:
        background_tasks.add_task(record_attendance, user_id)
    
    # Dapatkan data user
    user = await get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail=f"User dengan ID {user_id} tidak ditemukan")
    
    return {
        "status": "success",
        "user_id": user_id,
        "name": user["name"],
        "confidence": 1.0 - confidence,  # Konversi jarak ke kepercayaan
        "message": f"Halo, {user['name']}! Kehadiran tercatat."
    }

@router.get("/attendance/history")
async def get_history():
    history = await get_attendance_history()
    return {"status": "success", "data": history}

@router.post("/register/upload")
async def register_user_upload(
    name: str = Form(...),
    email: str = Form(...),
    photos: List[UploadFile] = File(...)
):
    """
    Endpoint untuk mendaftarkan user dengan upload foto wajah secara manual (maks 5 foto)
    """
    # Batasi jumlah foto yang diunggah
    if len(photos) > 5:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Maksimal 5 foto yang diperbolehkan"}
        )
    
    # Cek apakah email sudah terdaftar
    user_exists = await check_user_exists_by_email(email)
    if user_exists:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Email sudah terdaftar"}
        )
    
    # Tambahkan user ke database
    user_id = await add_user(name, email)
    
    # Variabel untuk melacak foto yang berhasil diproses
    processed_photos = 0
    
    # Proses setiap foto yang diunggah
    for photo in photos:
        # Baca foto yang diupload
        contents = await photo.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Deteksi wajah
        faces, _ = detect_faces(img)
        
        if not faces:
            continue
        
        # Ambil wajah pertama dari foto
        face_img = faces[0]
        
        # Ekstrak embedding
        embedding = get_embedding(face_img)
        
        if embedding is None:
            continue
        
        # Simpan embedding ke database
        await add_face_embedding(user_id, embedding)
        processed_photos += 1
    
    # Jika tidak ada foto yang berhasil diproses, return error
    if processed_photos == 0:
        # Hapus user yang baru dibuat
        await delete_user(user_id)
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Tidak ada wajah terdeteksi di foto yang diunggah"}
        )
    
    # Reset cache karena database berubah
    global last_cache_update
    last_cache_update = 0
    
    return {
        "status": "success", 
        "user_id": user_id, 
        "processed_photos": processed_photos,
        "message": f"User {name} berhasil terdaftar dengan {processed_photos} foto wajah"
    }

# Admin endpoints
@router.post("/admin/login")
async def admin_login(data: dict):
    password = data.get("password")
    
    if not password or password != ADMIN_PASSWORD:
        return JSONResponse(
            status_code=401,
            content={"status": "error", "message": "Password salah"}
        )
    
    # Buat token admin
    access_token = create_jwt_token(
        data={"is_admin": True},
        expires_delta=timedelta(minutes=JWT_EXPIRATION)
    )
    
    return {
        "status": "success",
        "token": access_token,
        "expires_in": JWT_EXPIRATION * 60  # dalam detik
    }

@router.get("/admin/users")
async def get_users(admin=Depends(get_current_admin)):
    users = await get_all_users()
    return {"status": "success", "data": users}

@router.get("/admin/users/{user_id}/embeddings")
async def get_user_face_embeddings(user_id: int, admin=Depends(get_current_admin)):
    embeddings = await get_user_embeddings(user_id)
    return {"status": "success", "data": embeddings}

@router.delete("/admin/embeddings/{embedding_id}")
async def delete_face_embedding(embedding_id: int, admin=Depends(get_current_admin)):
    try:
        await delete_embedding(embedding_id)
        
        # Reset cache
        global last_cache_update
        last_cache_update = 0
        
        return {"status": "success", "message": "Foto berhasil dihapus"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghapus foto: {str(e)}"
        )

@router.delete("/admin/users/{user_id}")
async def delete_user_data(user_id: int, admin=Depends(get_current_admin)):
    try:
        await delete_user(user_id)
        
        # Reset cache
        global last_cache_update
        last_cache_update = 0
        
        return {"status": "success", "message": "Pengguna berhasil dihapus"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghapus pengguna: {str(e)}"
        )

@router.post("/admin/users/upload-photos")
async def upload_user_photos(
    user_id: int = Form(...),
    photos: List[UploadFile] = File(...),
    admin=Depends(get_current_admin)
):
    """
    Endpoint untuk mengunggah foto wajah untuk pengguna yang sudah terdaftar (khusus admin)
    """
    # Batasi jumlah foto yang diunggah
    if len(photos) > 5:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Maksimal 5 foto yang diperbolehkan"}
        )
    
    # Cek apakah user dengan ID tersebut ada
    user = await get_user_by_id(user_id)
    if not user:
        return JSONResponse(
            status_code=404,
            content={"status": "error", "message": f"User dengan ID {user_id} tidak ditemukan"}
        )
    
    # Variabel untuk melacak foto yang berhasil diproses
    processed_photos = 0
    
    # Proses setiap foto yang diunggah
    for photo in photos:
        # Baca foto yang diupload
        contents = await photo.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Deteksi wajah
        faces, _ = detect_faces(img)
        
        if not faces:
            continue
        
        # Ambil wajah pertama dari foto
        face_img = faces[0]
        
        # Ekstrak embedding
        embedding = get_embedding(face_img)
        
        if embedding is None:
            continue
        
        # Simpan embedding ke database
        await add_face_embedding(user_id, embedding)
        processed_photos += 1
    
    # Jika tidak ada foto yang berhasil diproses, return error
    if processed_photos == 0:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Tidak ada wajah terdeteksi di foto yang diunggah"}
        )
    
    # Reset cache karena database berubah
    global last_cache_update
    last_cache_update = 0
    
    return {
        "status": "success", 
        "processed_photos": processed_photos,
        "message": f"{processed_photos} foto berhasil ditambahkan untuk {user['name']}"
    } 