import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileStore } from '../stores/fileStore';

const router = Router();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800')
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|gif|pdf|glb|gltf|obj|fbx|stl/i;
    const extname = allowedExts.test(path.extname(file.originalname));
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Недопустимый тип файла.'));
  }
});

// @route   POST /api/files/upload
// @desc    Upload file
// @access  Private/Admin
router.post('/upload', [authenticate, authorize('admin')], upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'Файл не выбран.' }
      });
    }

    const record = fileStore.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_type: path.extname(req.file.originalname).slice(1).toLowerCase(),
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      storage_path: req.file.path,
      uploaded_by: req.user?.userId || null
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Файл загружен.',
        file: {
          id: record.id,
          filename: record.filename,
          originalName: record.original_name,
          size: record.file_size,
          url: `/api/files/${record.filename}`
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при загрузке файла.' }
    });
  }
});

// @route   GET /api/files
// @desc    List all files
// @access  Private/Admin
router.get('/', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const files = fileStore.getAll();
    res.status(200).json({
      success: true,
      data: { files }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при получении списка файлов.' }
    });
  }
});

// @route   GET /api/files/:filename
// @desc    Download file
// @access  Public
router.get('/:filename', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: { message: 'Файл не найден.' }
      });
    }

    res.sendFile(filePath, { root: '.' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при скачивании файла.' }
    });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private/Admin
router.delete('/:id', [authenticate, authorize('admin')], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const record = fileStore.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { message: 'Файл не найден.' }
      });
    }

    // Delete physical file
    if (fs.existsSync(record.storage_path)) {
      fs.unlinkSync(record.storage_path);
    }

    fileStore.delete(id);

    res.status(200).json({
      success: true,
      data: { message: 'Файл удалён.' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Ошибка при удалении файла.' }
    });
  }
});

export default router;
