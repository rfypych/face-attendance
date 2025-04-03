from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import time
import asyncio
import uvicorn
import os

from app.api.routes import router as api_router
from app.database.db import init_db

# Inisialisasi aplikasi FastAPI
app = FastAPI(
    title="Face Attendance System",
    description="Sistem absensi wajah yang dioptimalkan untuk CPU",
    version="1.0.0",
)

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development, ganti dengan domain spesifik untuk production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware untuk mengukur waktu eksekusi
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Register router API
app.include_router(api_router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Selamat datang di Face Attendance System API"}

# Handler untuk startup
@app.on_event("startup")
async def startup_event():
    # Inisialisasi database
    await init_db()
    print("Database initialized")

# Jalankan aplikasi jika dijalankan langsung
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    
    # Konfigurasi workers untuk multi-threading
    workers = min(os.cpu_count() or 1, 4)  # Maksimal 4 workers
    
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=port,
        workers=workers,  # Menggunakan multi-threading
        reload=True
    ) 