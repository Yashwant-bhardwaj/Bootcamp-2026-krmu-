const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/', protect, upload.single('file'), uploadFile);
router.delete('/:publicId', protect, deleteFile);

module.exports = router;
