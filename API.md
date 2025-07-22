# 📡 API Documentation - Ijazah Extractor

## Base URL
```
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

## Authentication
Tidak memerlukan authentication khusus. API menggunakan sistem deployment Google Apps Script.

## Endpoints

### 1. Health Check
Memeriksa status API.

**Endpoint:** `GET /`

**Response:**
```json
{
  "status": "success",
  "message": "API Ekstraksi Data Ijazah sedang berjalan. Gunakan metode POST untuk menganalisis Ijazah.",
  "documentation": "Kirim parameter \"action=docs\" untuk mendapatkan dokumentasi"
}
```

### 2. Process Ijazah
Memproses gambar ijazah dan mengekstrak data.

**Endpoint:** `POST /`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```
atau
```
Content-Type: application/json
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Harus berisi `"process-ijazah"` |
| `fileData` | string | Yes | Data gambar dalam format base64 |
| `fileName` | string | Yes | Nama file (e.g., "ijazah.jpg") |
| `mimeType` | string | Yes | MIME type (e.g., "image/jpeg") |

**Request Example (Form Data):**
```bash
curl -X POST \
  'https://script.google.com/macros/s/AKfyc.../exec' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'action=process-ijazah' \
  -d 'fileData=iVBORw0KGgoAAAANSUhEUgAA...' \
  -d 'fileName=ijazah.jpg' \
  -d 'mimeType=image/jpeg'
```

**Request Example (JSON):**
```bash
curl -X POST \
  'https://script.google.com/macros/s/AKfyc.../exec' \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "process-ijazah",
    "fileData": "iVBORw0KGgoAAAANSUhEUgAA...",
    "fileName": "ijazah.jpg",
    "mimeType": "image/jpeg"
  }'
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/1abc123.../view",
      "fileName": "ijazah.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "JENIS IJAZAH: SMA\nKEMENTERIAN PENERBIT: KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN\n...",
      "parsed": {
        "status": "success",
        "jenis_ijazah": "SMA",
        "kementerian_penerbit": "KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN",
        "nama_institusi": "SMA NEGERI 1 JAKARTA",
        "nama_peserta_didik": "BUDI SANTOSO",
        "tempat_tanggal_lahir": "JAKARTA, 15 JANUARI 2000",
        "nama_orang_tua": "AGUS SANTOSO",
        "nomor_induk": "12345678",
        "institusi_asal": "Tidak tersedia",
        "program_studi_jurusan": "IPA",
        "akreditasi": "A",
        "tanggal_penerbitan": "JAKARTA, 5 MEI 2018",
        "pejabat_pengesah": "Drs. AHMAD WIJAYA, M.Pd.",
        "nomor_identitas_pejabat": "196505151990031001",
        "nomor_seri": "DN-06 0123456"
      }
    }
  }
}
```

**Not Ijazah Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/1abc123.../view",
      "fileName": "document.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "Dokumen ini bukan ijazah pendidikan resmi",
      "parsed": {
        "status": "not_ijazah",
        "message": "Dokumen yang diberikan bukan merupakan Ijazah pendidikan"
      }
    }
  }
}
```

### 3. Get Documentation
Mendapatkan dokumentasi API dalam format JSON.

**Endpoint:** `POST /`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Harus berisi `"docs"` |

**Request Example:**
```bash
curl -X POST \
  'https://script.google.com/macros/s/AKfyc.../exec' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'action=docs'
```

**Response:**
```json
{
  "api_name": "API Ekstraksi Data Ijazah",
  "version": "1.0.0",
  "description": "API untuk menganalisis dan mengekstrak data dari Ijazah pendidikan Indonesia menggunakan Gemini AI",
  "base_url": "https://script.google.com/macros/s/.../exec",
  "endpoints": [...],
  "examples": {...}
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan",
  "code": 400
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "API error: 429 - Quota exceeded",
  "code": 500
}
```

## Data Fields Description

| Field | Description | Example |
|-------|-------------|---------|
| `jenis_ijazah` | Jenjang pendidikan | "SMA", "S1", "D3" |
| `kementerian_penerbit` | Kementerian yang menerbitkan | "KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN" |
| `nama_institusi` | Nama lengkap sekolah/universitas | "SMA NEGERI 1 JAKARTA" |
| `nama_peserta_didik` | Nama lengkap lulusan | "BUDI SANTOSO" |
| `tempat_tanggal_lahir` | Tempat dan tanggal lahir | "JAKARTA, 15 JANUARI 2000" |
| `nama_orang_tua` | Nama orang tua/wali | "AGUS SANTOSO" |
| `nomor_induk` | NIS/NIM/NISN | "12345678" |
| `institusi_asal` | Sekolah asal (jika ada) | "SMP NEGERI 5 JAKARTA" |
| `program_studi_jurusan` | Bidang studi | "TEKNIK INFORMATIKA", "IPA" |
| `akreditasi` | Status akreditasi | "A", "B", "Baik Sekali" |
| `tanggal_penerbitan` | Waktu dan tempat penerbitan | "JAKARTA, 5 MEI 2018" |
| `pejabat_pengesah` | Nama kepala sekolah/rektor | "Drs. AHMAD WIJAYA, M.Pd." |
| `nomor_identitas_pejabat` | NIP/NIY/NIDN | "196505151990031001" |
| `nomor_seri` | Nomor seri/registrasi ijazah | "DN-06 0123456" |

## Rate Limiting

API mengikuti rate limiting dari:
- **Google Apps Script**: 6 menit runtime maksimal per eksekusi
- **Gemini API**: Sesuai quota yang ditetapkan Google AI
- **Google Drive**: Quota upload harian

## Supported File Formats

- **JPEG/JPG**: Recommended
- **PNG**: Supported
- **WebP**: Supported
- **Maximum file size**: 20MB
- **Encoding**: Base64

## Best Practices

1. **Image Quality**: Gunakan gambar dengan resolusi minimal 1200x800px
2. **File Size**: Kompres gambar untuk mengurangi waktu upload
3. **Error Handling**: Selalu handle response error dengan proper retry mechanism
4. **Base64 Encoding**: Pastikan encoding base64 dilakukan dengan benar

## Code Examples

### JavaScript/Node.js
```javascript
const fs = require('fs');
const axios = require('axios');

async function processIjazah(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  const response = await axios.post('https://script.google.com/.../exec', {
    action: 'process-ijazah',
    fileData: base64Image,
    fileName: 'ijazah.jpg',
    mimeType: 'image/jpeg'
  });
  
  return response.data;
}
```

### Python
```python
import base64
import requests

def process_ijazah(image_path):
    with open(image_path, 'rb') as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    data = {
        'action': 'process-ijazah',
        'fileData': base64_image,
        'fileName': 'ijazah.jpg',
        'mimeType': 'image/jpeg'
    }
    
    response = requests.post('https://script.google.com/.../exec', data=data)
    return response.json()
```

### PHP
```php
<?php
function processIjazah($imagePath) {
    $imageData = base64_encode(file_get_contents($imagePath));
    
    $data = [
        'action' => 'process-ijazah',
        'fileData' => $imageData,
        'fileName' => 'ijazah.jpg',
        'mimeType' => 'image/jpeg'
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents('https://script.google.com/.../exec', false, $context);
    
    return json_decode($result, true);
}
?>
```
