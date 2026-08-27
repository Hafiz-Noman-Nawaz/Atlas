import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { uploadFileBuffer } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = express.Router();

// Configure multer memory storage (stores file in memory buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
});

/**
 * Extracts plain text content from documents (PDF, DOCX, CSV, TXT, MD, JSON).
 */
async function extractDocumentText(buffer, filename, mimetype) {
  const ext = filename.split('.').pop().toLowerCase();
  try {
    if (ext === 'pdf' || mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text ? data.text.slice(0, 15000) : '';
    } else if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ? result.value.slice(0, 15000) : '';
    } else if (['txt', 'csv', 'md', 'json', 'js', 'py', 'ts', 'tsx', 'html', 'css', 'sql'].includes(ext) || mimetype.startsWith('text/')) {
      return buffer.toString('utf-8').slice(0, 15000);
    }
  } catch (err) {
    console.warn(`[Document Parser] Could not extract text from ${filename}:`, err.message);
  }
  return '';
}

/**
 * @route   POST /api/upload
 * @desc    Upload single or multiple files (images, documents, code files, screenshots)
 * @access  Private
 */
router.post('/', protect, upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ detail: 'No files provided for upload.' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const uploaded = await uploadFileBuffer(file.buffer, file.originalname, file.mimetype);
      const extractedText = await extractDocumentText(file.buffer, file.originalname, file.mimetype);
      return {
        ...uploaded,
        extractedText: extractedText || undefined,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(201).json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('[Upload Error]', error);
    next(error);
  }
});

export default router;
