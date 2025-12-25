import express from 'express';
import { 
  createJob, 
  getJob, 
  getAllJobs, 
  deleteJob 
} from '../controllers/jobController.js';

const router = express.Router();

// Create new job
router.post('/', createJob);

// Get all jobs
router.get('/', getAllJobs);

// Get specific job
router.get('/:jobId', getJob);

// Delete job
router.delete('/:jobId', deleteJob);

export default router;