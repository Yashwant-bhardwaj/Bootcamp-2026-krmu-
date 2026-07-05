const { cloudinary } = require('../config/cloudinary');

// POST /api/upload
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
  res.json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
    message: 'File uploaded successfully',
  });
};

// DELETE /api/upload/:publicId
exports.deleteFile = async (req, res) => {
  const { publicId } = req.params;
  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: 'File deleted' });
};
