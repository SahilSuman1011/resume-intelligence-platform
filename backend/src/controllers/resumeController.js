import { extractTextFromPDF } from '../utils/pdfParser.js';
import { extractResumeSkills, calculateSkillMatch } from '../services/skillExtractor.js';
import { indexResumeForRAG } from '../services/ragService.js';
import Resume from '../models/Resume.js';
import db from '../config/db.js';
import fs from 'fs';

// Import jobs from jobController
import { jobs } from './jobController.js';

/**
 * Upload and process resume
 */
export async function uploadResume(req, res) {
  try {
    const { jobId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', file.originalname);

    // Extract text from file
    let resumeText;
    if (file.mimetype === 'application/pdf') {
      resumeText = await extractTextFromPDF(file.path);
    } else {
      resumeText = fs.readFileSync(file.path, 'utf-8');
    }

    if (!resumeText || resumeText.trim().length < 100) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        error: 'Resume content too short or could not be extracted' 
      });
    }

    console.log('Text extracted, length:', resumeText.length);

    // Extract skills using AI
    const skills = await extractResumeSkills(resumeText);
    console.log('Skills extracted:', skills.length);

    // Create resume object
    const resume = new Resume({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      text: resumeText,
      skills: skills
    });

    // Extract metadata
    resume.extractMetadata();

    // Validate resume
    const validation = resume.validate();
    if (!validation.isValid) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        error: 'Resume validation failed', 
        details: validation.errors 
      });
    }

    // Save to database
    db.saveResume(resume.id, resume);

    // Index for RAG
    console.log('Indexing resume for RAG...');
    await indexResumeForRAG(resume.id, resumeText, {
      filename: file.originalname
    });
    console.log('Resume indexed successfully');

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    let matchResult = null;

    // If jobId provided, calculate match
    if (jobId) {
      const job = jobs.get(jobId);
      if (job) {
        matchResult = resume.calculateMatch(job.skills);
        console.log('Match calculated:', matchResult.matchPercentage + '%');
      }
    }

    res.status(201).json({
      success: true,
      resume: resume.toJSON(),
      match: matchResult
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to process resume' 
    });
  }
}

/**
 * Get resume by ID
 */
export async function getResume(req, res) {
  try {
    const { resumeId } = req.params;
    const resume = db.getResume(resumeId);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ 
      success: true, 
      resume: resume.toJSON() 
    });
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all resumes
 */
export async function getAllResumes(req, res) {
  try {
    const allResumes = db.getAllResumes().map(resume => resume.getSummary());

    res.json({ 
      success: true, 
      resumes: allResumes,
      total: allResumes.length 
    });
  } catch (error) {
    console.error('Error getting resumes:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Compare resume with job
 */
export async function compareResumeWithJob(req, res) {
  try {
    const { resumeId, jobId } = req.params;

    const resume = db.getResume(resumeId);
    const job = jobs.get(jobId);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const matchResult = resume.calculateMatch(job.skills);

    res.json({
      success: true,
      match: {
        resumeId,
        jobId,
        jobTitle: job.title,
        resumeFilename: resume.filename,
        ...matchResult
      }
    });
  } catch (error) {
    console.error('Error comparing resume with job:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get top 10 resumes for a job (RANKING ENGINE)
 */
export async function getTopResumesForJob(req, res) {
  try {
    const { jobId } = req.params;

    const job = jobs.get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('Ranking resumes for job:', job.title);

    // Get all resumes and calculate matches
    const allResumes = db.getAllResumes();
    const allMatches = [];
    
    for (const resume of allResumes) {
      const matchResult = resume.calculateMatch(job.skills);
      
      allMatches.push({
        resumeId: resume.id,
        filename: resume.filename,
        uploadedAt: resume.uploadedAt,
        ...matchResult
      });
    }

    console.log('Total resumes evaluated:', allMatches.length);

    // Sort by match percentage (descending) - THIS IS THE RANKING!
    const topResumes = allMatches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10); // Top 10 only

    console.log('Top resume score:', topResumes[0]?.matchPercentage || 0);

    res.json({
      success: true,
      jobId,
      jobTitle: job.title,
      topResumes,
      totalResumes: allResumes.length,
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting top resumes:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete resume
 */
export async function deleteResume(req, res) {
  try {
    const { resumeId } = req.params;
    
    const resume = db.getResume(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    db.deleteResume(resumeId);
    
    res.json({ 
      success: true, 
      message: 'Resume deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: error.message });
  }
}