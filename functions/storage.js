const admin = require('firebase-admin');

async function deleteMediaFile(mediaPath) {
  if (!mediaPath) return;
  try {
    await admin.storage().bucket().file(mediaPath).delete();
  } catch {
    // ignore not-found and other delete errors
  }
}

module.exports = { deleteMediaFile };
