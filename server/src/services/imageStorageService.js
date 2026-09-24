import mongoose from 'mongoose';

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error('Image storage is not available');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'productImages'
  });
}

export function storeImage(file) {
  return new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { uploadedAt: new Date() }
    });
    stream.on('error', reject);
    stream.on('finish', () => resolve({ id: stream.id.toString(), filename: stream.filename }));
    stream.end(file.buffer);
  });
}

export async function openImageDownload(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const bucket = getBucket();
  const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).limit(1).toArray();
  if (!files[0]) return null;
  return { file: files[0], stream: bucket.openDownloadStream(files[0]._id) };
}
