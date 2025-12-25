// Job scraping service for extracting job descriptions from URLs

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape job description from URL
 */
export async function scrapeJobFromUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);
    
    // Try multiple common selectors for job descriptions
    const selectors = [
      '.job-description',
      '#job-description',
      '[class*="job-description"]',
      '[class*="description"]',
      '[id*="description"]',
      'article',
      'main',
      '.content',
      '#content'
    ];

    let description = '';
    let title = '';

    // Extract title
    title = $('title').text().trim() || 
            $('h1').first().text().trim() ||
            $('.job-title').first().text().trim() ||
            '';

    // Try each selector
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > description.length) {
        description = text;
      }
    }

    // If still no description, get body text
    if (description.length < 200) {
      description = $('body').text().trim();
    }

    // Clean up the text
    description = cleanScrapedText(description);

    return {
      title,
      description,
      url,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error scraping job URL:', error);
    throw new Error(`Failed to scrape job from URL: ${error.message}`);
  }
}

/**
 * Clean scraped text
 */
function cleanScrapedText(text) {
  return text
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')     // Remove excessive newlines
    .replace(/[\r\t]/g, '')         // Remove carriage returns and tabs
    .trim();
}

/**
 * Extract metadata from job URL (detect platform)
 */
export function detectJobPlatform(url) {
  const platforms = {
    linkedin: /linkedin\.com/i,
    indeed: /indeed\.com/i,
    glassdoor: /glassdoor\.com/i,
    monster: /monster\.com/i,
    ziprecruiter: /ziprecruiter\.com/i,
    careerbuilder: /careerbuilder\.com/i,
    dice: /dice\.com/i,
    simplyhired: /simplyhired\.com/i
  };

  for (const [platform, regex] of Object.entries(platforms)) {
    if (regex.test(url)) {
      return platform;
    }
  }

  return 'unknown';
}

/**
 * Validate if URL is a job posting
 */
export function isJobUrl(url) {
  const jobKeywords = [
    'job', 'jobs', 'career', 'careers', 'position',
    'opening', 'vacancy', 'hiring', 'employment'
  ];

  const urlLower = url.toLowerCase();
  return jobKeywords.some(keyword => urlLower.includes(keyword));
}

/**
 * Extract structured data from job posting (JSON-LD)
 */
export async function extractStructuredData(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Look for JSON-LD structured data
    const scripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < scripts.length; i++) {
      try {
        const data = JSON.parse($(scripts[i]).html());
        
        if (data['@type'] === 'JobPosting') {
          return {
            title: data.title,
            description: data.description,
            company: data.hiringOrganization?.name,
            location: data.jobLocation?.address?.addressLocality,
            salary: data.baseSalary,
            employmentType: data.employmentType,
            datePosted: data.datePosted,
            validThrough: data.validThrough
          };
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting structured data:', error);
    return null;
  }
}