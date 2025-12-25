import express from 'express';
import { uploadSingle } from '../middleware/upload.js';
import { 
  uploadResume, 
  getResume, 
  getAllResumes,
  compareResumeWithJob,
  getTopResumesForJob,
  deleteResume 
} from '../controllers/resumeController.js';

const router = express.Router();

// Upload resume (with file upload middleware)
router.post('/upload', uploadSingle('resume'), uploadResume);

// Get all resumes
router.get('/', getAllResumes);

// Get specific resume
router.get('/:resumeId', getResume);

// Compare resume with job
router.get('/:resumeId/compare/:jobId', compareResumeWithJob);

// Get top 10 resumes for a job (RANKING ENDPOINT)
router.get('/ranking/job/:jobId', getTopResumesForJob);

// Delete resume
router.delete('/:resumeId', deleteResume);

export default router;