import { extractJobSkills } from '../services/skillExtractor.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// In-memory job storage
const jobs = new Map();

/**
 * Scrape job description from URL (basic implementation)
 */
async function scrapeJobDescription(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Try common selectors for job descriptions
    const selectors = [
      '.job-description',
      '#job-description',
      '[class*="description"]',
      'article',
      'main'
    ];

    let description = '';
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > description.length) {
        description = text;
      }
    }

    return description || $('body').text().trim();
  } catch (error) {
    console.error('Error scraping job:', error);
    throw new Error('Failed to scrape job description');
  }
}

/**
 * Create a new job posting
 */
export async function createJob(req, res) {
  try {
    const { title, description, url } = req.body;

    if (!title || (!description && !url)) {
      return res.status(400).json({ 
        error: 'Job title and either description or URL required' 
      });
    }

    let jobDescription = description;

    // Scrape if URL provided
    if (url && !description) {
      jobDescription = await scrapeJobDescription(url);
    }

    // Extract skills
    const skills = await extractJobSkills(jobDescription);

    const jobId = `job-${Date.now()}`;
    const job = {
      id: jobId,
      title,
      description: jobDescription,
      url: url || null,
      skills,
      createdAt: new Date().toISOString()
    };

    jobs.set(jobId, job);

    res.status(201).json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        skills: job.skills,
        skillCount: job.skills.length,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get job by ID
 */
export async function getJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all jobs
 */
export async function getAllJobs(req, res) {
  try {
    const allJobs = Array.from(jobs.values()).map(job => ({
      id: job.id,
      title: job.title,
      skillCount: job.skills.length,
      createdAt: job.createdAt
    }));

    res.json({ 
      success: true, 
      jobs: allJobs,
      total: allJobs.length 
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete job
 */
export async function deleteJob(req, res) {
  try {
    const { jobId } = req.params;
    
    if (!jobs.has(jobId)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    jobs.delete(jobId);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
}

export { jobs };