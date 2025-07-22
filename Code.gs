// Config
const GEMINI_API_KEY = '<APIKEY-GEMINI>';
const GEMINI_MODEL = 'gemini-2.0-flash';
const SPREADSHEET_ID = '<SPREADSHEET-ID>';
const LOG_SHEET_NAME = 'log';
const METADATA_SHEET_NAME = 'metadata';
const TRANSACTIONS_SHEET_NAME = 'data_ijazah';
const FOLDER_ID = '<FOLDER-ID>';

// Prompt template untuk parsing Ijazah berbagai jenjang pendidikan
const PROMPT_TEMPLATE = `<beli prompt di https://lynk.id/classyid>`;

/**
 * Handle GET requests - Return API status
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API Ekstraksi Data Ijazah sedang berjalan. Gunakan metode POST untuk menganalisis Ijazah.',
    documentation: 'Kirim parameter "action=docs" untuk mendapatkan dokumentasi'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput('');
}

/**
 * Handle POST requests - Process image and return JSON response
 */
function doPost(e) {
  try {
    // Get parameters from form data or JSON
    let data;
    
    if (e.postData && e.postData.contents) {
      try {
        // Try parsing as JSON first
        data = JSON.parse(e.postData.contents);
      } catch (error) {
        // If not JSON, fall back to form parameters
        data = e.parameter;
      }
    } else {
      // Use form parameters directly
      data = e.parameter;
    }
    
    // Check if action is provided
    if (!data.action) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Parameter wajib tidak ada: action',
        code: 400
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle different API actions
    let result;
    
    switch(data.action) {
      case 'process-ijazah':
        result = processIjazahAPI(data);
        break;
      case 'docs':
        result = getApiDocumentation();
        break;
      default:
        result = {
          status: 'error',
          message: `Action tidak dikenal: ${data.action}`,
          code: 400
        };
    }
    
    // Return result
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logAction('API Error', `Error di endpoint API: ${error.toString()}`, 'ERROR');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString(),
      code: 500
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * API endpoint to process Ijazah
 */
function processIjazahAPI(data) {
  try {
    // Validate required parameters
    if (!data.fileData || !data.fileName || !data.mimeType) {
      return {
        status: 'error',
        message: 'Parameter wajib tidak ada: fileData, fileName, dan mimeType harus disediakan',
        code: 400
      };
    }
    
    // Log the request 
    logAction('Request', 'Permintaan pemrosesan Ijazah diterima', 'INFO');
    
    // Process the Ijazah image
    const result = processImage(data.fileData, data.fileName, data.mimeType);
    
    // If successful, structure the response
    if (result.success) {
      // Check if the image was not an Ijazah
      if (result.description === "Dokumen ini bukan ijazah pendidikan resmi") {
        return {
          status: 'success',
          code: 200,
          data: {
            original: {
              fileUrl: result.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType
            },
            analysis: {
              raw: result.description,
              parsed: {
                status: 'not_ijazah',
                message: 'Dokumen yang diberikan bukan merupakan Ijazah pendidikan'
              }
            }
          }
        };
      } else {
        // Parse Ijazah data into structured format
        const ijazahData = parseIjazahData(result.description);
        
        return {
          status: 'success',
          code: 200,
          data: {
            original: {
              fileUrl: result.fileUrl,
              fileName: data.fileName,
              mimeType: data.mimeType
            },
            analysis: {
              raw: result.description,
              parsed: {
                status: 'success',
                jenis_ijazah: ijazahData.jenis_ijazah,
                kementerian_penerbit: ijazahData.kementerian_penerbit,
                nama_institusi: ijazahData.nama_institusi,
                nama_peserta_didik: ijazahData.nama_peserta_didik,
                tempat_tanggal_lahir: ijazahData.tempat_tanggal_lahir,
                nama_orang_tua: ijazahData.nama_orang_tua,
                nomor_induk: ijazahData.nomor_induk,
                institusi_asal: ijazahData.institusi_asal,
                program_studi_jurusan: ijazahData.program_studi_jurusan,
                akreditasi: ijazahData.akreditasi,
                tanggal_penerbitan: ijazahData.tanggal_penerbitan,
                pejabat_pengesah: ijazahData.pejabat_pengesah,
                nomor_identitas_pejabat: ijazahData.nomor_identitas_pejabat,
                nomor_seri: ijazahData.nomor_seri
              }
            }
          }
        };
      }
    } else {
      return {
        status: 'error',
        message: result.error,
        code: 500
      };
    }
  } catch (error) {
    logAction('API Error', `Error in processIjazahAPI: ${error.toString()}`, 'ERROR');
    return {
      status: 'error',
      message: error.toString(),
      code: 500
    };
  }
}

/**
 * Return API documentation in JSON format
 */
function getApiDocumentation() {
  const docs = {
    api_name: "API Ekstraksi Data Ijazah",
    version: "1.0.0",
    description: "API untuk menganalisis dan mengekstrak data dari Ijazah pendidikan Indonesia menggunakan Gemini AI",
    base_url: ScriptApp.getService().getUrl(),
    endpoints: [
      {
        path: "/",
        method: "GET",
        description: "Pemeriksaan status API",
        parameters: {}
      },
      {
        path: "/",
        method: "POST",
        description: "Proses gambar Ijazah dan ekstrak datanya",
        parameters: {
          action: {
            type: "string",
            required: true,
            description: "Aksi API yang akan dilakukan",
            value: "process-ijazah"
          }
        },
        body: {
          type: "application/x-www-form-urlencoded atau application/json",
          required: true,
          schema: {
            fileData: {
              type: "string (base64)",
              required: true,
              description: "Data gambar Ijazah yang di-encode dalam format base64"
            },
            fileName: {
              type: "string",
              required: true,
              description: "Nama file"
            },
            mimeType: {
              type: "string",
              required: true,
              description: "MIME type dari gambar (e.g., image/jpeg, image/png)"
            }
          }
        },
        responses: {
          "200": {
            description: "Operasi berhasil",
            schema: {
              status: "success",
              code: 200,
              data: {
                original: {
                  fileUrl: "URL ke file yang disimpan di Google Drive",
                  fileName: "Nama file yang diunggah",
                  mimeType: "MIME type dari file"
                },
                analysis: {
                  raw: "Deskripsi mentah dari Gemini AI",
                  parsed: {
                    status: "success atau not_ijazah",
                    jenis_ijazah: "Jenis ijazah (SD/MI, SMP/MTs, dst)",
                    kementerian_penerbit: "Nama kementerian penerbit",
                    nama_institusi: "Nama lengkap institusi pendidikan",
                    nama_peserta_didik: "Nama lengkap peserta didik",
                    tempat_tanggal_lahir: "Tempat dan tanggal lahir",
                    nama_orang_tua: "Nama orang tua",
                    nomor_induk: "Nomor induk siswa/mahasiswa",
                    institusi_asal: "Nama institusi pendidikan asal",
                    program_studi_jurusan: "Nama program studi/jurusan",
                    akreditasi: "Akreditasi program studi",
                    tanggal_penerbitan: "Tanggal dan tempat penerbitan",
                    pejabat_pengesah: "Nama pejabat pengesah",
                    nomor_identitas_pejabat: "Nomor identitas pejabat",
                    nomor_seri: "Nomor seri/registrasi ijazah"
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request",
            schema: {
              status: "error",
              message: "Detail error",
              code: 400
            }
          },
          "500": {
            description: "Server error",
            schema: {
              status: "error",
              message: "Detail error",
              code: 500
            }
          }
        }
      },
      {
        path: "/",
        method: "POST",
        description: "Dapatkan dokumentasi API",
        parameters: {
          action: {
            type: "string",
            required: true,
            description: "Aksi API yang akan dilakukan",
            value: "docs"
          }
        },
        responses: {
          "200": {
            description: "Dokumentasi API",
            schema: "Objek dokumentasi ini"
          }
        }
      }
    ],
    examples: {
      "process-ijazah": {
        request: {
          method: "POST",
          url: ScriptApp.getService().getUrl(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "action=process-ijazah&fileData=base64_encoded_ijazah_image&fileName=ijazah.jpg&mimeType=image/jpeg"
        },
        response: {
          status: "success",
          code: 200,
          data: {
            original: {
              fileUrl: "https://drive.google.com/file/d/xxx/view",
              fileName: "ijazah.jpg",
              mimeType: "image/jpeg"
            },
            analysis: {
              raw: "JENIS IJAZAH: SMA\nKEMENTERIAN PENERBIT: KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN\nNAMA INSTITUSI: SMA NEGERI 1 JAKARTA\nNAMA PESERTA DIDIK: BUDI SANTOSO\nTEMPAT, TANGGAL LAHIR: JAKARTA, 15 JANUARI 2000\nNAMA ORANG TUA: AGUS SANTOSO\nNOMOR INDUK: 12345678\nINSTITUSI ASAL: Tidak tersedia\nPROGRAM STUDI/JURUSAN: IPA\nAKREDITASI: A\nTANGGAL PENERBITAN: JAKARTA, 5 MEI 2018\nPEJABAT PENGESAH: Drs. AHMAD WIJAYA, M.Pd.\nNOMOR IDENTITAS PEJABAT: 196505151990031001\nNOMOR SERI/REGISTRASI IJAZAH: DN-06 0123456",
              parsed: {
                status: "success",
                jenis_ijazah: "SMA",
                kementerian_penerbit: "KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN",
                nama_institusi: "SMA NEGERI 1 JAKARTA",
                nama_peserta_didik: "BUDI SANTOSO",
                tempat_tanggal_lahir: "JAKARTA, 15 JANUARI 2000",
                nama_orang_tua: "AGUS SANTOSO",
                nomor_induk: "12345678",
                institusi_asal: "Tidak tersedia",
                program_studi_jurusan: "IPA",
                akreditasi: "A",
                tanggal_penerbitan: "JAKARTA, 5 MEI 2018",
                pejabat_pengesah: "Drs. AHMAD WIJAYA, M.Pd.",
                nomor_identitas_pejabat: "196505151990031001",
                nomor_seri: "DN-06 0123456"
              }
            }
          }
        }
      }
    }
  };

  return docs;
}

/**
 * Clean up the API response
 */
function cleanupResponse(response) {
  // Minimal cleanup to ensure response is nicely formatted
  return response.trim();
}

/**
 * Parse Ijazah data from the Gemini API response
 */
function parseIjazahData(description) {
  // Initialize object to store parsed data
  const ijazahData = {
    jenis_ijazah: '',
    kementerian_penerbit: '',
    nama_institusi: '',
    nama_peserta_didik: '',
    tempat_tanggal_lahir: '',
    nama_orang_tua: '',
    nomor_induk: '',
    institusi_asal: '',
    program_studi_jurusan: '',
    akreditasi: '',
    tanggal_penerbitan: '',
    pejabat_pengesah: '',
    nomor_identitas_pejabat: '',
    nomor_seri: ''
  };

  // Extract Jenis Ijazah
  const jenisIjazahMatch = description.match(/JENIS IJAZAH: (.+?)$/m);
  if (jenisIjazahMatch) {
    ijazahData.jenis_ijazah = jenisIjazahMatch[1].trim();
  }

  // Extract Kementerian Penerbit
  const kementerianMatch = description.match(/KEMENTERIAN PENERBIT: (.+?)$/m);
  if (kementerianMatch) {
    ijazahData.kementerian_penerbit = kementerianMatch[1].trim();
  }

  // Extract Nama Institusi
  const namaInstitusiMatch = description.match(/NAMA INSTITUSI: (.+?)$/m);
  if (namaInstitusiMatch) {
    ijazahData.nama_institusi = namaInstitusiMatch[1].trim();
  }

  // Extract Nama Peserta Didik
  const namaPesertaDidikMatch = description.match(/NAMA PESERTA DIDIK: (.+?)$/m);
  if (namaPesertaDidikMatch) {
    ijazahData.nama_peserta_didik = namaPesertaDidikMatch[1].trim();
  }

  // Extract Tempat, Tanggal Lahir
  const ttlMatch = description.match(/TEMPAT, TANGGAL LAHIR: (.+?)$/m);
  if (ttlMatch) {
    ijazahData.tempat_tanggal_lahir = ttlMatch[1].trim();
  }

  // Extract Nama Orang Tua
  const orangTuaMatch = description.match(/NAMA ORANG TUA: (.+?)$/m);
  if (orangTuaMatch) {
    ijazahData.nama_orang_tua = orangTuaMatch[1].trim();
  }

  // Extract Nomor Induk
  const nomorIndukMatch = description.match(/NOMOR INDUK: (.+?)$/m);
  if (nomorIndukMatch) {
    ijazahData.nomor_induk = nomorIndukMatch[1].trim();
  }

  // Extract Institusi Asal
  const institusiAsalMatch = description.match(/INSTITUSI ASAL: (.+?)$/m);
  if (institusiAsalMatch) {
    ijazahData.institusi_asal = institusiAsalMatch[1].trim();
  }

  // Extract Program Studi/Jurusan
  const programStudiMatch = description.match(/PROGRAM STUDI\/JURUSAN: (.+?)$/m);
  if (programStudiMatch) {
    ijazahData.program_studi_jurusan = programStudiMatch[1].trim();
  }

  // Extract Akreditasi
  const akreditasiMatch = description.match(/AKREDITASI: (.+?)$/m);
  if (akreditasiMatch) {
    ijazahData.akreditasi = akreditasiMatch[1].trim();
  }

  // Extract Tanggal Penerbitan
  const tanggalPenerbitanMatch = description.match(/TANGGAL PENERBITAN: (.+?)$/m);
  if (tanggalPenerbitanMatch) {
    ijazahData.tanggal_penerbitan = tanggalPenerbitanMatch[1].trim();
  }

  // Extract Pejabat Pengesah
  const pejabatPengesahMatch = description.match(/PEJABAT PENGESAH: (.+?)$/m);
  if (pejabatPengesahMatch) {
    ijazahData.pejabat_pengesah = pejabatPengesahMatch[1].trim();
  }

  // Extract Nomor Identitas Pejabat
  const nomorIdentitasPejabatMatch = description.match(/NOMOR IDENTITAS PEJABAT: (.+?)$/m);
  if (nomorIdentitasPejabatMatch) {
    ijazahData.nomor_identitas_pejabat = nomorIdentitasPejabatMatch[1].trim();
  }

  // Extract Nomor Seri/Registrasi Ijazah
  const nomorSeriMatch = description.match(/NOMOR SERI\/REGISTRASI IJAZAH: (.+?)$/m);
  if (nomorSeriMatch) {
    ijazahData.nomor_seri = nomorSeriMatch[1].trim();
  }

  return ijazahData;
}

/**
 * Save Ijazah data to sheet
 */
function saveIjazahDataToSheet(ijazahData, fileName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dataSheet = spreadsheet.getSheetByName(TRANSACTIONS_SHEET_NAME) || spreadsheet.insertSheet(TRANSACTIONS_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (dataSheet.getLastRow() === 0) {
      dataSheet.appendRow([
        'Timestamp', 
        'File Name',
        'Jenis Ijazah',
        'Kementerian Penerbit',
        'Nama Institusi',
        'Nama Peserta Didik',
        'Tempat, Tanggal Lahir',
        'Nama Orang Tua',
        'Nomor Induk',
        'Institusi Asal',
        'Program Studi/Jurusan',
        'Akreditasi',
        'Tanggal Penerbitan',
        'Pejabat Pengesah',
        'Nomor Identitas Pejabat',
        'Nomor Seri/Registrasi Ijazah'
      ]);
    }
    
    // Append Ijazah data
    dataSheet.appendRow([
      new Date().toISOString(),
      fileName,
      ijazahData.jenis_ijazah,
      ijazahData.kementerian_penerbit,
      ijazahData.nama_institusi,
      ijazahData.nama_peserta_didik,
      ijazahData.tempat_tanggal_lahir,
      ijazahData.nama_orang_tua,
      ijazahData.nomor_induk,
      ijazahData.institusi_asal,
      ijazahData.program_studi_jurusan,
      ijazahData.akreditasi,
      ijazahData.tanggal_penerbitan,
      ijazahData.pejabat_pengesah,
      ijazahData.nomor_identitas_pejabat,
      ijazahData.nomor_seri
    ]);
    
    return true;
  } catch (error) {
    logAction('Data Error', `Error saving Ijazah data: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Process the uploaded image and get description from Gemini AI
 */
function processImage(fileData, fileName, mimeType) {
  try {
    // Log the request
    logAction('Request', 'Image processing request received', 'INFO');
    
    // Save image to Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType, fileName);
    const file = folder.createFile(blob);
    const fileId = file.getId();
    const fileUrl = file.getUrl();
    
    logAction('File Upload', `File saved to Drive: ${fileName}, ID: ${fileId}`, 'INFO');
    
    // Create request to Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: PROMPT_TEMPLATE },
            { 
              inline_data: { 
                mime_type: mimeType, 
                data: fileData
              } 
            }
          ]
        }
      ]
    };
    
    // Call Gemini API
    const rawResponse = callGeminiAPI(requestBody);
    
    // Clean up the response
    const cleanedResponse = cleanupResponse(rawResponse);
    
    // Check if the document is not an Ijazah
    if (cleanedResponse === "Dokumen ini bukan ijazah pendidikan resmi") {
      logAction('Info', 'Document is not an ijazah pendidikan resmi', 'INFO');
      
      // Save metadata to spreadsheet
      const metadata = {
        timestamp: new Date().toISOString(),
        fileName: fileName,
        fileId: fileId,
        fileUrl: fileUrl,
        description: cleanedResponse,
        isIjazah: false
      };
      
      saveMetadata(metadata);
      
      return {
        success: true,
        description: cleanedResponse,
        fileUrl: fileUrl,
        dataSaved: false
      };
    }
    
    // Parse Ijazah data
    const ijazahData = parseIjazahData(cleanedResponse);
    
    // Save Ijazah data to sheet
    const dataSaved = saveIjazahDataToSheet(ijazahData, fileName);
    
    // Save metadata to spreadsheet
    const metadata = {
      timestamp: new Date().toISOString(),
      fileName: fileName,
      fileId: fileId,
      fileUrl: fileUrl,
      description: rawResponse,
      isIjazah: true
    };
    
    saveMetadata(metadata);
    
    logAction('Success', 'Image processed successfully', 'SUCCESS');
    
    return {
      success: true,
      description: cleanedResponse,
      fileUrl: fileUrl,
      dataSaved: dataSaved
    };
  } catch (error) {
    logAction('Error', `Error processing image: ${error.toString()}`, 'ERROR');
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Call Gemini API
 */
function callGeminiAPI(requestBody) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  logAction('API Call', 'Calling Gemini API', 'INFO');
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      const errorText = response.getContentText();
      logAction('API Error', `Error from Gemini API: ${errorText}`, 'ERROR');
      throw new Error(`API error: ${responseCode} - ${errorText}`);
    }
    
    const responseJson = JSON.parse(response.getContentText());
    
    if (!responseJson.candidates || responseJson.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }
    
    // Extract text from response
    const text = responseJson.candidates[0].content.parts[0].text;
    return text;
  } catch (error) {
    logAction('API Error', `Error calling Gemini API: ${error.toString()}`, 'ERROR');
    throw error;
  }
}


function logAction(action, message, level) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = spreadsheet.getSheetByName(LOG_SHEET_NAME) || spreadsheet.insertSheet(LOG_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (logSheet.getLastRow() === 0) {
      logSheet.appendRow(['Timestamp', 'Action', 'Message', 'Level']);
    }
    
    logSheet.appendRow([new Date().toISOString(), action, message, level]);
  } catch (error) {
    console.error(`Error logging to spreadsheet: ${error.toString()}`);
  }
}

function saveMetadata(metadata) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metadataSheet = spreadsheet.getSheetByName(METADATA_SHEET_NAME) || spreadsheet.insertSheet(METADATA_SHEET_NAME);
    
    // Create headers if the sheet is empty
    if (metadataSheet.getLastRow() === 0) {
      metadataSheet.appendRow(['Timestamp', 'FileName', 'FileID', 'FileURL', 'Description', 'IsIjazah']);
    }
    
    metadataSheet.appendRow([
      metadata.timestamp,
      metadata.fileName,
      metadata.fileId,
      metadata.fileUrl,
      metadata.description,
      metadata.isIjazah ? 'Yes' : 'No'
    ]);
  } catch (error) {
    logAction('Metadata Error', `Error saving metadata: ${error.toString()}`, 'ERROR');
    throw error;
  }
}
