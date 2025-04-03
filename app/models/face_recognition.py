import cv2
import numpy as np
import os
import time
from pathlib import Path

# Memastikan kita menggunakan CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Path untuk model Haar Cascade
CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

# Fungsi untuk mendeteksi wajah dengan Haar Cascade (cepat pada CPU)
def detect_faces(img):
    # Konversi ke grayscale untuk deteksi wajah yang lebih cepat
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Deteksi wajah
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    face_images = []
    face_locations = []
    
    for (x, y, w, h) in faces:
        # Ekstrak wajah
        face_img = img[y:y+h, x:x+w]
        # Resize ke ukuran 160x160 untuk mengurangi komputasi
        face_img = cv2.resize(face_img, (160, 160))
        face_images.append(face_img)
        face_locations.append((x, y, x+w, y+h))
    
    return face_images, face_locations

# Fungsi alternatif untuk get_embedding tanpa DeepFace
def get_embedding(face_img):
    # Pastikan gambar berformat yang benar
    if face_img.dtype != np.uint8:
        face_img = np.uint8(face_img)
    
    # Pastikan gambar grayscale atau RGB (1 atau 3 channel)
    if len(face_img.shape) > 2 and face_img.shape[2] > 3:
        face_img = cv2.cvtColor(face_img, cv2.COLOR_BGRA2BGR)
    
    # Resize menjadi ukuran standar
    face_img = cv2.resize(face_img, (128, 128))
    
    # Aplikasikan HOG
    hog = cv2.HOGDescriptor()
    h = hog.compute(face_img)
    return h.flatten()

# Fungsi untuk mencari kecocokan wajah dari database embedding
def find_match(embedding, stored_embeddings, threshold=0.6):
    if embedding is None or len(stored_embeddings) == 0:
        return None
    
    best_match = None
    min_distance = float('inf')
    
    for item in stored_embeddings:
        stored_embedding = item['embedding']
        # Hitung jarak kosinus (lebih kecil = lebih mirip)
        distance = cosine_distance(embedding, stored_embedding)
        
        if distance < min_distance:
            min_distance = distance
            best_match = item['user_id']
    
    # Kembalikan None jika jarak di atas threshold
    if min_distance > threshold:
        return None
        
    return best_match, min_distance

# Fungsi untuk menghitung jarak kosinus
def cosine_distance(embedding1, embedding2):
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)
    
    # Normalisasi vektor
    embedding1 = embedding1 / np.linalg.norm(embedding1)
    embedding2 = embedding2 / np.linalg.norm(embedding2)
    
    # Hitung jarak kosinus
    similarity = np.dot(embedding1, embedding2)
    distance = 1.0 - similarity
    
    return distance

# Deteksi gerakan kepala sederhana (untuk liveness detection)
def detect_head_movement(landmarks_sequence, min_movement=5):
    if len(landmarks_sequence) < 3:
        return False
    
    # Ambil titik hidung dari setiap frame
    nose_points = [landmarks[30] for landmarks in landmarks_sequence]
    
    # Hitung pergerakan
    movements = []
    for i in range(1, len(nose_points)):
        dx = nose_points[i][0] - nose_points[i-1][0]
        dy = nose_points[i][1] - nose_points[i-1][1]
        movement = np.sqrt(dx*dx + dy*dy)
        movements.append(movement)
    
    # Periksa apakah ada gerakan yang cukup
    return any(m > min_movement for m in movements) 