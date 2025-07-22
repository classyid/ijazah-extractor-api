# 🚀 Panduan Deployment - Ijazah Extractor API

## Prasyarat

Sebelum memulai deployment, pastikan Anda memiliki:

- ✅ Akun Google dengan akses Google Apps Script
- ✅ API Key Gemini AI dari Google AI Studio
- ✅ Google Drive dengan folder khusus
- ✅ Google Sheets untuk logging
- ✅ Koneksi internet yang stabil

## Langkah 1: Persiapan API Key Gemini

### 1.1 Mendapatkan API Key
1. Buka [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik **"Create API Key"**
4. Pilih project atau buat project baru
5. Copy API Key yang dihasilkan
6. **PENTING**: Simpan API Key dengan aman, jangan bagikan ke publik

### 1.2 Mengaktifkan Generative AI API
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project yang sama dengan API Key
3. Navigasi ke **APIs & Services > Library**
4. Cari "Generative Language API"
5. Klik **Enable**

## Langkah 2: Setup Google Drive

### 2.1 Membuat Folder Penyimpanan
1. Buka [Google Drive](https://drive.google.com)
2. Buat folder baru dengan nama "Ijazah Storage" atau sesuai keinginan
3. Klik kanan folder → **"Share"**
4. Set permission ke **"Anyone with the link can view"** (opsional)
5. Copy Folder ID dari URL:
   ```
   https://drive.google.com/drive/folders/1xddEnuY2XQBYttRP8Z1lQLZDK9GzCWlH
                                          ↑
                                    Folder ID
   ```

## Langkah 3: Setup Google Sheets

### 3.1 Membuat Spreadsheet
1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "Ijazah Extractor Logs"
3. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/1LTLNWa2YGVz9zUFdcWkkjpCvdd6n0GDn__GCuBctHH8/edit
                                           ↑
                                   Spreadsheet ID
   ```

### 3.2 Membuat Sheets yang Diperlukan
Script akan otomatis membuat sheets berikut jika belum ada:
- **`log`**: Menyimpan log aktivitas API
- **`metadata`**: Menyimpan metadata file dan response AI
- **`data_ijazah`**: Menyimpan data terstruktur hasil ekstraksi

## Langkah 4: Deploy Google Apps Script

### 4.1 Membuat Project Apps Script
1. Buka [Google Apps Script](https://script.google.com)
2. Klik **"New Project"**
3. Ganti nama project menjadi "Ijazah Extractor API"
4. Hapus kode default di `Code.gs`

### 4.2 Menambahkan Kode
1. Copy seluruh kode dari file `Code.gs` yang disediakan
2. Paste ke editor Apps Script
3. **Update konfigurasi** di bagian atas file:

```javascript
// Config - UPDATE NILAI-NILAI INI
const GEMINI_API_KEY = 'dddf7JpCW5bjhD24bi7t7yN25o'; // Ganti dengan API Key Anda
const GEMINI_MODEL = 'gemini-2.0-flash';
const SPREADSHEET_ID = '1LTLNWa2ddddkkjpCvXg6n0GDn__GCuBctHH8'; // Ganti dengan ID Sheets Anda
const LOG_SHEET_NAME = 'log';
const METADATA_SHEET_NAME = 'metadata';
const TRANSACTIONS_SHEET_NAME = 'data_ijazah';
const FOLDER_ID = '1xJddddYttRP8Z1lQLZDK9GzCWlH'; // Ganti dengan ID Folder Drive Anda
```

### 4.3 Menyimpan Project
1. Tekan `Ctrl+S` atau klik ikon **Save**
2. Pastikan tidak ada error syntax

## Langkah 5: Testing Script

### 5.1 Test Function
1. Pilih function `doGet` dari dropdown
2. Klik **Run** (▶️)
3. Authorize permissions yang diminta:
   - Google Drive access
   - Google Sheets access
   - External API calls
4. Periksa log untuk memastikan tidak ada error

### 5.2 Test API Key
Jalankan test sederhana:
```javascript
function testGeminiAPI() {
  const testPrompt = "Hello, respond with 'API is working'";
  try {
    const response = callGeminiAPI({
      contents: [{ parts: [{ text: testPrompt }] }]
    });
    console.log('API Response:', response);
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

## Langkah 6: Deployment

### 6.1 Deploy sebagai Web App
1. Klik **Deploy** → **New deployment**
2. Klik ⚙️ (gear icon) dan pilih **"Web app"**
3. Isi konfigurasi:
   - **Description**: "Ijazah Extractor API v1.0"
   - **Execute as**: "Me (your-email@gmail.com)"
   - **Who has access**: "Anyone"
4. Klik **Deploy**

### 6.2 Authorize Permissions
1. Klik **Authorize access**
2. Pilih akun Google Anda
3. Klik **Advanced** jika muncul warning
4. Klik **Go to Ijazah Extractor API (unsafe)**
5. Klik **Allow** untuk semua permissions:
   - See, edit, create, and delete your Google Drive files
   - See, edit, create, and delete your spreadsheets in Google Drive
   - Connect to external services

### 6.3 Mendapatkan Web App URL
1. Copy **Web app URL** yang diberikan:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
2. **SIMPAN URL ini** - ini adalah endpoint API Anda

## Langkah 7: Testing Deployment

### 7.1 Test Health Check
```bash
curl https://script.google.com/macros/s/AKfycbx.../exec
```

Expected response:
```json
{
  "status": "success",
  "message": "API Ekstraksi Data Ijazah sedang berjalan. Gunakan metode POST untuk menganalisis Ijazah.",
  "documentation": "Kirim parameter \"action=docs\" untuk mendapatkan dokumentasi"
}
```

### 7.2 Test Documentation Endpoint
```bash
curl -X POST https://script.google.com/macros/s/AKfycbx.../exec \
  -d "action=docs"
```

### 7.3 Test dengan Gambar Sample
```bash
# Encode gambar ke base64
base64 sample_ijazah.jpg > ijazah_base64.txt

# Test API
curl -X POST https://script.google.com/macros/s/AKfycbx.../exec \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=process-ijazah" \
  -d "fileName=sample_ijazah.jpg" \
  -d "mimeType=image/jpeg" \
  -d "fileData=$(cat ijazah_base64.txt)"
```

## Langkah 8: Monitoring & Maintenance

### 8.1 Monitoring Logs
- Periksa Google Sheets "log" sheet untuk aktivitas API
- Monitor Google Apps Script execution transcript
- Periksa quota usage di Google Cloud Console

### 8.2 Update API
Untuk update kode:
1. Edit kode di Apps Script editor
2. Save perubahan
3. Deploy → **New deployment** dengan deskripsi versi baru
4. Atau **Manage deployments** → Edit deployment existing

### 8.3 Backup & Security
- Backup spreadsheet data secara berkala
- Rotate API Key Gemini secara berkala
- Monitor usage untuk mencegah abuse
- Set up alerts untuk error rates

## Troubleshooting

### Common Issues & Solutions

**1. "Authorization required" error**
- Solution: Re-authorize dengan klik Deploy → New deployment

**2. "Exceeded maximum execution time"**
- Solution: Gambar terlalu besar, kompres sebelum upload

**3. "API quota exceeded"**
- Solution: Periksa quota Gemini API di Google Cloud Console

**4. "Drive/Sheets access denied"**
- Solution: Periksa sharing permissions folder/spreadsheet

**5. "Invalid base64 data"**
- Solution: Pastikan encoding base64 benar dan tidak ada newline

### Debugging Tips
1. Gunakan `console.log()` untuk debugging
2. Periksa Apps Script execution transcript
3. Test dengan gambar kecil terlebih dahulu
4. Validasi konfigurasi ID yang benar

## Security Best Practices

### 🔒 Keamanan API Key
- Jangan commit API key ke public repository
- Gunakan environment variables jika memungkinkan
- Rotate API key secara berkala
- Monitor usage untuk mendeteksi penyalahgunaan

### 🔒 Keamanan Data
- Set proper permissions untuk Drive folder
- Backup data secara berkala
- Implement rate limiting jika perlu
- Log semua aktivitas untuk audit trail

### 🔒 Access Control
- Review periodically siapa yang memiliki akses
- Gunakan corporate Google account untuk production
- Implement proper error handling untuk tidak expose sensitive info
- Monitor logs untuk aktivitas suspicious

## Performance Optimization

### ⚡ Tips Optimasi
1. **Kompres gambar** sebelum upload (optimal: 1-2MB)
2. **Batch processing** untuk multiple files
3. **Cache response** untuk gambar yang sama
4. **Implement retry logic** dengan exponential backoff
5. **Monitor quota usage** dan implement alerting

Selamat! API Ijazah Extractor Anda sekarang sudah live dan siap digunakan. 🎉
