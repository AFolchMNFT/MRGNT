const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

const EXT_BY_MIMETYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = EXT_BY_MIMETYPE[file.mimetype] || '';
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  if (!EXT_BY_MIMETYPE[file.mimetype]) {
    return cb(new Error('Formato de archivo no soportado. Usa JPG, PNG, GIF, WEBP, MP4, WEBM o MOV.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

function mediaTypeFor(mimetype) {
  return mimetype.startsWith('video/') ? 'video' : 'image';
}

function deleteMediaFile(mediaPath) {
  if (!mediaPath) return;
  const filePath = path.join(uploadsDir, path.basename(mediaPath));
  fs.unlink(filePath, () => {});
}

module.exports = { upload, mediaTypeFor, deleteMediaFile };
