/**
 * Presentation Layer - Guest Routes
 */

import { Router } from 'express';
import multer from 'multer';
import { GuestController } from '../controllers/GuestController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { generalLimiter } from '../middlewares/rateLimitMiddleware';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (_, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

export function createGuestRoutes(controller: GuestController): Router {
  const router = Router();

  // Download Excel template (public route - no auth needed)
  router.get('/template/download', controller.downloadTemplate);

  // All other routes require authentication
  router.use(authMiddleware);

  // GET routes - no rate limiting (caching handles load)
  router.get('/event/:eventId', controller.getGuests);
  router.get('/:id', controller.getGuestById);

  // POST/PUT/PATCH/DELETE routes - with rate limiting
  router.post('/', generalLimiter, controller.createGuest);
  router.put('/:id', generalLimiter, controller.updateGuest);
  router.patch('/:id/confirm', generalLimiter, controller.confirmGuest);
  router.post('/event/:eventId/import', generalLimiter, upload.single('file'), controller.importFromExcel);
  router.delete('/:id', generalLimiter, controller.deleteGuest);
  router.post('/event/:eventId/clear-cache', controller.clearCache); // No rate limit for debug

  return router;
}

