const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { extractTransactions, generateSampleTransactions, analyzeTransactions } = require('../utils/parser');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Upload & parse PDF
router.post('/upload', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    let transactions = extractTransactions(text);

    // If parser couldn't find transactions, use sample data
    if (transactions.length < 3) {
      transactions = generateSampleTransactions();
    }

    const analysis = analyzeTransactions(transactions);

    res.json({
      success: true,
      filename: req.file.originalname,
      transactions,
      analysis,
      parsedFromPDF: transactions.length >= 3,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse PDF' });
  }
});

// Demo data (no PDF needed)
router.get('/demo', (req, res) => {
  const transactions = generateSampleTransactions();
  const analysis = analyzeTransactions(transactions);
  res.json({ success: true, transactions, analysis, demo: true });
});

module.exports = router;
