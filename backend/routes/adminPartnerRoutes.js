import express from 'express';
import {
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/partnerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').get(getAllPartners).post(createPartner);
router.route('/:id').put(updatePartner).delete(deletePartner);

export default router;