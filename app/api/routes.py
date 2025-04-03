from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import time
import asyncio
from typing import List, Optional
import io

from app.models.face_recognition import detect_faces, get_embedding, find_match
from app.database.db import (
    add_user, add_face_embedding, get_all_embeddings, 
    record_attendance, get_user_by_id, get_attendance_history, check_user_exists_by_email
)

router = APIRouter()

# Cache untuk menyimpan embedding sementara agar tidak perlu query database berulang kali
embedding_cache = {}
last_cache_update = 0
CACHE_TIMEOUT = 60  # seconds

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
    photo: UploadFile = File(...)
):
    """
    Endpoint untuk mendaftarkan user dengan upload foto wajah secara manual
    """
    # Cek apakah email sudah terdaftar
    user_exists = await check_user_exists_by_email(email)
    if user_exists:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Email sudah terdaftar"}
        )
    
    # Baca foto yang diupload
    contents = await photo.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Deteksi wajah
    faces, _ = detect_faces(img)
    
    if not faces:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Tidak ada wajah terdeteksi di foto yang diunggah"}
        )
    
    # Ambil wajah pertama
    face_img = faces[0]
    
    # Ekstrak embedding
    embedding = get_embedding(face_img)
    
    if embedding is None:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Gagal mengekstrak fitur wajah"}
        )
    
    # Tambahkan user ke database
    user_id = await add_user(name, email)
    
    # Simpan embedding ke database
    await add_face_embedding(user_id, embedding)
    
    # Reset cache karena database berubah
    global last_cache_update
    last_cache_update = 0
    
    return {"status": "success", "user_id": user_id, "message": f"User {name} berhasil terdaftar menggunakan foto upload"} 