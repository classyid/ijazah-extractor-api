# 🎓 Ijazah Extractor API

API untuk mengekstrak data dari ijazah pendidikan Indonesia menggunakan Google Apps Script dan Gemini AI.

## ✨ Fitur

- 📄 Ekstraksi data dari ijazah semua jenjang (SD/MI hingga S3)
- 🤖 Powered by Gemini 2.0 Flash AI
- 📊 Penyimpanan otomatis ke Google Sheets
- 💾 Backup file ke Google Drive
- 🔍 Validasi format ijazah otomatis
- 📝 Logging lengkap setiap transaksi
- 🌐 RESTful API dengan response JSON

## 🎯 Data yang Diekstrak

- Jenis ijazah (SD/MI, SMP/MTs, SMA/MA/SMK, D1-S3)
- Kementerian penerbit
- Nama institusi pendidikan lengkap
- Data peserta didik (nama, TTL, orang tua)
- Nomor induk dan nomor seri ijazah
- Program studi/jurusan
- Data pengesahan (kepala sekolah/rektor)
- Akreditasi (jika tersedia)

## 🚀 Quick Start

### Prasyarat
- Akun Google dengan akses Google Apps Script
- API Key Gemini AI dari Google AI Studio
- Google Drive folder untuk penyimpanan
- Google Sheets untuk logging

### Konfigurasi
1. Buat project baru di Google Apps Script
2. Copy-paste kode dari `Code.gs`
3. Update konfigurasi di bagian atas file:

```javascript
const GEMINI_API_KEY = 'your-gemini-api-key';
const SPREADSHEET_ID = 'your-google-sheets-id';
const FOLDER_ID = 'your-google-drive-folder-id';
```

### Deploy
1. Klik **Deploy** > **New deployment**
2. Pilih type **Web app**
3. Set execute as **Me**
4. Set access to **Anyone**
5. Deploy dan copy URL

## 📡 API Usage

### Endpoint
```
POST https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

### Request
```bash
curl -X POST \
  'https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'action=process-ijazah&fileData=base64_encoded_image&fileName=ijazah.jpg&mimeType=image/jpeg'
```

### Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "original": {
      "fileUrl": "https://drive.google.com/file/d/xxx/view",
      "fileName": "ijazah.jpg",
      "mimeType": "image/jpeg"
    },
    "analysis": {
      "raw": "JENIS IJAZAH: SMA\nKEMENTERIAN PENERBIT: ...",
      "parsed": {
        "status": "success",
        "jenis_ijazah": "SMA",
        "kementerian_penerbit": "KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN",
        "nama_peserta_didik": "BUDI SANTOSO",
        "tempat_tanggal_lahir": "JAKARTA, 15 JANUARI 2000",
        // ... data lainnya
      }
    }
  }
}
```

## 🛠️ Development

### Project Structure
```
ijazah-extractor-api/
├── Code.gs              # Main script file
├── README.md           # Documentation
├── DEPLOYMENT.md      # Deployment guide
├── API.md         # API Documentation

```

### Testing
Gunakan endpoint `action=docs` untuk mendapatkan dokumentasi lengkap:
```bash
curl -X POST 'https://script.google.com/.../exec' -d 'action=docs'
```

## 📋 Supported Formats

### Jenjang Pendidikan
- SD/MI (Sekolah Dasar/Madrasah Ibtidaiyah)
- SMP/MTs (Sekolah Menengah Pertama/Madrasah Tsanawiyah)
- SMA/MA/SMK (Sekolah Menengah Atas/Madrasah Aliyah/Sekolah Menengah Kejuruan)
- D1, D2, D3 (Diploma 1-3)
- D4/S1 (Diploma 4/Sarjana)
- S2 (Magister)
- S3 (Doktor)

### Format File
- JPEG/JPG
- PNG
- WebP
- Base64 encoded images

## ⚠️ Limitations

- Maksimal ukuran file: 20MB
- Rate limit: Sesuai quota Gemini API
- Hanya ijazah resmi Indonesia
- Kualitas gambar mempengaruhi akurasi

## 🤝 Contributing

1. Fork repository ini
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- 📧 Email: kontak@classy.id

## 🙏 Acknowledgments

- Google Gemini AI
- Google Apps Script Platform
- Indonesian Ministry of Education
```
