import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 3000;

// Middleware
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Data Storage (Simple JSON files)
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const LHP_FILE = path.join(DATA_DIR, 'lhp_data.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const readData = (file: string) => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const writeData = (file: string, data: any) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Google Drive Setup
let drive: any = null;
let sheets: any = null;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_NAME = 'LHP_Data';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  drive = google.drive({ version: 'v3', auth: oauth2Client });
  sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  console.log('Google API initialized');
} else {
  console.log('Google API credentials missing, using local storage only');
}

// Helper to ensure Sheet exists and has headers
const initSheet = async () => {
  if (!SPREADSHEET_ID || !sheets) return;
  try {
    const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetExists = response.data.sheets?.some(s => s.properties?.title === SHEET_NAME);
    
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: { properties: { title: SHEET_NAME } }
          }]
        }
      });
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'No LHP', 'Tanggal', 'Judul Laporan', 'OPD', 'Kategori', 'File Link', 'Timestamp']]
        }
      });
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
  }
};

initSheet();

// API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'irban1' && password === 'sultra 2026') {
    // In a real app, use JWT. For this demo, simple success.
    res.json({ success: true, user: { username: 'irban1', name: 'Admin SI SULTRA' } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/lhp', async (req, res) => {
  if (SPREADSHEET_ID && sheets) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:H`,
      });
      const rows = response.data.values || [];
      const data = rows.map(row => ({
        id: row[0],
        noLhp: row[1],
        tanggal: row[2],
        objek: row[3],
        opd: row[4],
        kategori: row[5],
        fileLink: row[6],
        timestamp: row[7],
      }));
      return res.json(data);
    } catch (error) {
      console.error('Error reading from sheets:', error);
      // Fallback to local
    }
  }
  res.json(readData(LHP_FILE));
});

app.post('/api/lhp', upload.single('file'), async (req: any, res: any) => {
  try {
    const { noLhp, tanggal, objek, opd, kategori } = req.body;
    const file = req.file;

    let fileLink = '';
    if (file && drive) {
      // Upload to Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: file.originalname,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || '1G0lRgDGTK0a8eHjqqvMWSR7FpNfp0-z-'],
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path),
        },
      });

      // Make file viewable by anyone with the link
      try {
        await drive.permissions.create({
          fileId: response.data.id!,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permError) {
        console.error('Error setting permissions:', permError);
      }

      fileLink = `https://drive.google.com/file/d/${response.data.id}/preview`;
      
      // Make file public or accessible via link (optional, depends on Drive settings)
      // For this demo, we assume the folder is shared or the link is enough.
      
      fs.unlinkSync(file.path); // Delete local temp file
    } else if (file) {
      // Fallback: local link if Drive not configured
      fileLink = `/uploads/${file.filename}`;
    }

    const newItem = {
      id: Date.now().toString(),
      noLhp,
      tanggal,
      objek,
      opd,
      kategori,
      fileLink,
      timestamp: new Date().toISOString(),
    };

    if (SPREADSHEET_ID && sheets) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A2:H2`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              newItem.id,
              newItem.noLhp,
              newItem.tanggal,
              newItem.objek,
              newItem.opd,
              newItem.kategori,
              newItem.fileLink,
              newItem.timestamp
            ]]
          }
        });
      } catch (error) {
        console.error('Error writing to sheets:', error);
      }
    }

    // Always keep local as backup/fallback
    const lhpData = readData(LHP_FILE);
    lhpData.push(newItem);
    writeData(LHP_FILE, lhpData);

    // Notify all clients about the change
    io.emit('lhp:changed');

    res.json({ success: true, data: newItem });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to save Laporan' });
  }
});

app.put('/api/lhp/:id', upload.single('file'), async (req: any, res: any) => {
  const { id } = req.params;
  const { noLhp, tanggal, objek, opd, kategori } = req.body;
  const file = req.file;

  let fileLink = '';
  if (file && drive) {
    // Upload new file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || '1G0lRgDGTK0a8eHjqqvMWSR7FpNfp0-z-'],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },
    });

    // Make file viewable
    try {
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permError) {
      console.error('Error setting permissions:', permError);
    }

    fileLink = `https://drive.google.com/file/d/${response.data.id}/preview`;
    fs.unlinkSync(file.path);
  } else if (file) {
    fileLink = `/uploads/${file.filename}`;
  }

  if (SPREADSHEET_ID && sheets) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`,
      });
      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id);

      if (rowIndex !== -1) {
        const updateValues = [noLhp, tanggal, objek, opd, kategori];
        let updateRange = `${SHEET_NAME}!B${rowIndex + 1}:F${rowIndex + 1}`;
        
        if (fileLink) {
          updateValues.push(fileLink);
          updateRange = `${SHEET_NAME}!B${rowIndex + 1}:G${rowIndex + 1}`;
        }

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: updateRange,
          valueInputOption: 'RAW',
          requestBody: {
            values: [updateValues]
          }
        });
      }
    } catch (error) {
      console.error('Error updating sheets:', error);
    }
  }

  const lhpData = readData(LHP_FILE);
  const index = lhpData.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    const updatedItem = { ...lhpData[index], noLhp, tanggal, objek, opd, kategori };
    if (fileLink) updatedItem.fileLink = fileLink;
    
    lhpData[index] = updatedItem;
    writeData(LHP_FILE, lhpData);
    io.emit('lhp:changed');
    res.json({ success: true, data: lhpData[index] });
  } else {
    res.status(404).json({ success: false, message: 'LHP not found' });
  }
});

app.delete('/api/lhp/:id', async (req, res) => {
  const { id } = req.params;
  
  if (SPREADSHEET_ID && sheets) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`,
      });
      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id);
      
      if (rowIndex !== -1) {
        // Delete row in sheets (requires batchUpdate)
        // Note: rowIndex is 0-based, but we need to find the sheet ID first
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId;
        
        if (sheetId !== undefined) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1
                  }
                }
              }]
            }
          });
        }
      }
    } catch (error) {
      console.error('Error deleting from sheets:', error);
    }
  }

  let lhpData = readData(LHP_FILE);
  lhpData = lhpData.filter((item: any) => item.id !== id);
  writeData(LHP_FILE, lhpData);
  
  // Notify all clients about the change
  io.emit('lhp:changed');

  res.json({ success: true });
});

// Serve static uploads if Drive is not used
app.use('/uploads', express.static('uploads'));

// Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
