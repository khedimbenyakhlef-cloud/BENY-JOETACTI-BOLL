// Backend Node server with DeepSeek proxy endpoint and large upload handling
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve frontend static
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Multer storage - store to disk (uploads/)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null, unique + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 1073741824) // default 1GB
  }
});

// Basic health
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Upload endpoint: accepts large file, saves to disk, then proxys to DeepSeek
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'no file' });

    // If DEEPSEEK integration is configured, forward file
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      // keep file locally and respond with path (developer can process later)
      return res.json({ ok: true, message: 'File received (no DEEPSEEK key configured)', filename: req.file.filename, path: req.file.path });
    }

    // Example: send file to DeepSeek (replace URL with actual DeepSeek endpoint)
    const deepseekUrl = process.env.DEEPSEEK_URL || 'https://api.deepseek.example/v1/analyze';
    const form = new (require('form-data'))();
    form.append('file', fs.createReadStream(req.file.path));
    const headers = form.getHeaders();
    headers['Authorization'] = `Bearer ${deepseekKey}`;

    const resp = await axios.post(deepseekUrl, form, { headers, maxContentLength: Infinity, maxBodyLength: Infinity });
    // remove local file after successful send (optional)
    try { fs.unlinkSync(req.file.path); } catch(e){}

    return res.json({ ok: true, deepseek: resp.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Simple status route
app.get('/api/status', (req, res) => res.json({ ok: true, env: !!process.env.DEEPSEEK_API_KEY }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Tactiball backend (DeepSeek) listening on ${port}`));
