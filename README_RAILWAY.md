# Tactiball Railway package with DeepSeek integration

## What I included
- frontend/ -> your uploaded `index.html` (UI) + `js/upload.js` to call /api/upload
- backend/ -> Node/Express server that accepts large uploads (multer) and proxies to DeepSeek if DEEPSEEK_API_KEY is set
- Dockerfile -> build image for Railway or Docker deploy
- .env.example -> environment variables (DEEPSEEK_API_KEY, DEEPSEEK_URL, optional S3 config)

## How to use
1. Copy `.env.example` to `.env` and set `DEEPSEEK_API_KEY` to your real key and correct `DEEPSEEK_URL`.
2. On Railway: create a new project and push this repo. Railway will run `node backend/index.js`.
3. For large file handling in production: configure a file store (S3) and adapt backend to stream files to S3 instead of disk.
4. The upload endpoint `/api/upload` accepts a `file` field (multipart/form-data). Default max file size is 1GB (can be changed via MAX_FILE_SIZE env).

## Security notes
- Do NOT commit `.env` with keys.
- Use HTTPS and set CORS origins in production.
- Use signed uploads to S3 for large files to avoid server disk usage.

## Files used from you
- `frontend/index.html` copied from the index.html you uploaded for Tactiball. See file citation in the chat.
