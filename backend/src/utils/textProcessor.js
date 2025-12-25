// Text processing utilities

/**
 * Clean and normalize text
 */
export function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Remove excessive newlines
    .replace(/\t+/g, ' ')             // Replace tabs with spaces
    .replace(/\s+/g, ' ')             // Collapse multiple spaces
    .replace(/[^\S\n]+/g, ' ')        // Remove extra whitespace except newlines
    .trim();
}

/**
 * Remove special characters while keeping meaningful punctuation
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/[^\w\s.,!?;:()\-'"@#$%&*+=\/<>]/g, '')
    .trim();
}

/**
 * Extract email addresses from text
 */
export function extractEmails(text) {
  if (!text) return [];
  
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emails = text.match(emailRegex);
  
  return emails ? [...new Set(emails)] : [];
}

/**
 * Extract phone numbers from text
 */
export function extractPhones(text) {
  if (!text) return [];
  
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  
  return phones ? [...new Set(phones)] : [];
}

/**
 * Extract URLs from text
 */
export function extractUrls(text) {
  if (!text) return [];
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  
  return urls ? [...new Set(urls)] : [];
}

/**
 * Count words in text
 */
export function countWords(text) {
  if (!text) return 0;
  
  return text.trim().split(/\s+/).length;
}

/**
 * Count characters (excluding spaces)
 */
export function countCharacters(text, includeSpaces = false) {
  if (!text) return 0;
  
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Extract section from text by header
 */
export function extractSection(text, sectionName) {
  if (!text) return '';
  
  const regex = new RegExp(`${sectionName}[:\\s]*\\n([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i');
  const match = text.match(regex);
  
  return match ? match[1].trim() : '';
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text) {
  if (!text) return [];
  
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text) {
  if (!text) return [];
  
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Remove HTML tags from text
 */
export function stripHtml(text) {
  if (!text) return '';
  
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Convert text to lowercase and remove special chars for comparison
 */
export function normalizeForComparison(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract years from text (e.g., "2020-2023")
 */
export function extractYears(text) {
  if (!text) return [];
  
  const yearRegex = /\b(19|20)\d{2}\b/g;
  const years = text.match(yearRegex);
  
  return years ? [...new Set(years)].map(y => parseInt(y)) : [];
}

/**
 * Calculate reading time (average 200 words per minute)
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
  const wordCount = countWords(text);
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return {
    minutes,
    words: wordCount,
    text: `${minutes} min read`
  };
}

/**
 * Highlight keywords in text
 */
export function highlightKeywords(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return text;
  
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}

/**
 * Calculate text similarity (simple Jaccard similarity)
 */
export function calculateSimilarity(text1, text2) {
  const words1 = new Set(normalizeForComparison(text1).split(/\s+/));
  const words2 = new Set(normalizeForComparison(text2).split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Extract key phrases (simple n-gram extraction)
 */
export function extractKeyPhrases(text, n = 2, limit = 10) {
  if (!text) return [];
  
  const words = normalizeForComparison(text).split(/\s+/);
  const phrases = {};
  
  for (let i = 0; i <= words.length - n; i++) {
    const phrase = words.slice(i, i + n).join(' ');
    phrases[phrase] = (phrases[phrase] || 0) + 1;
  }
  
  return Object.entries(phrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phrase, count]) => ({ phrase, count }));
}