const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeData } = require('../controllers/aiController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

router.post('/analyze', upload.single('file'), analyzeData);

module.exports = router;
