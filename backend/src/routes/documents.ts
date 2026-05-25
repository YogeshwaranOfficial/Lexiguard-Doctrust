import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import { uploadToBlob } from '../utils/azureBlob';
import { analyzeDocument } from '../services/documentAnalyzer';
import { logger } from '../utils/logger';

const router = Router();

// Multer config — memory storage for Azure upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and text documents are allowed'));
    }
  },
});

// POST /api/documents/upload
router.post('/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { originalname, buffer, mimetype } = req.file;
    logger.info(`Upload request: ${originalname} (${buffer.length} bytes)`);

    // Upload to Azure Blob
    const blobUrl = await uploadToBlob(originalname, buffer, mimetype);

    // Save metadata to DB with Pending status
    const document = await prisma.document.create({
      data: {
        file_name: originalname,
        blob_url: blobUrl,
        status: 'Pending',
      },
    });

    logger.info(`Document saved: ${document.id}`);

    // Trigger async analysis (simulates Azure Function trigger)
    processDocumentAsync(document.id, originalname, buffer).catch((err) =>
      logger.error(`Async analysis failed for ${document.id}:`, err)
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        file_name: document.file_name,
        status: document.status,
        created_at: document.created_at,
      },
    });
  } catch (error) {
    logger.error('Upload error:', error);
    if (error instanceof multer.MulterError) {
      res.status(400).json({ error: `Upload error: ${error.message}` });
      return;
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Async document processing (mirrors Azure Function logic)
async function processDocumentAsync(
  documentId: string,
  fileName: string,
  fileBuffer: Buffer
): Promise<void> {
  try {
    // Update to Processing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'Processing' },
    });

    logger.info(`Processing document: ${documentId}`);

    // Run analysis
    const analysis = await analyzeDocument(fileName, fileBuffer);

    // Update to Completed with results
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'Completed',
        risk_level: analysis.risk_level,
        extracted_json: analysis as unknown as Record<string, unknown>,
      },
    });

    logger.info(`Document analysis complete: ${documentId} → ${analysis.risk_level}`);
  } catch (error) {
    logger.error(`Document processing failed: ${documentId}`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'Failed' },
    }).catch(() => {});
  }
}

// GET /api/documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, risk_level, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (risk_level) where.risk_level = risk_level;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          file_name: true,
          blob_url: true,
          status: true,
          risk_level: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    res.json({
      documents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /api/documents/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json(document);
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    logger.info(`Document deleted: ${req.params.id}`);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// GET /api/documents/stats/overview
router.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const [total, byStatus, byRisk] = await Promise.all([
      prisma.document.count(),
      prisma.document.groupBy({ by: ['status'], _count: true }),
      prisma.document.groupBy({ by: ['risk_level'], _count: true, where: { status: 'Completed' } }),
    ]);

    res.json({ total, byStatus, byRisk });
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
