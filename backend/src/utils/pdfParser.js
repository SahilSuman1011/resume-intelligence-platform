import fs from 'fs';

// Dynamic import to avoid pdf-parse initialization issues
let pdfParse;

/**
 * Extract text content from a PDF file
 */
export async function extractTextFromPDF(filePath) {
  try {
    // Lazy load pdf-parse only when needed
    if (!pdfParse) {
      const module = await import('pdf-parse/lib/pdf-parse.js');
      pdfParse = module.default;
    }
    
    console.log('Extracting text from PDF:', filePath);
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    console.log('PDF parsed successfully');
    console.log('Pages:', pdfData.numpages);
    console.log('Text length:', pdfData.text.length);
    
    return cleanPDFText(pdfData.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

/**
 * Extract structured information from PDF
 */
export async function parsePDFWithMetadata(filePath) {
  try {
    // Lazy load pdf-parse only when needed
    if (!pdfParse) {
      const module = await import('pdf-parse/lib/pdf-parse.js');
      pdfParse = module.default;
    }
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    return {
      text: cleanPDFText(pdfData.text),
      pages: pdfData.numpages,
      info: pdfData.info,
      metadata: pdfData.metadata,
      version: pdfData.version
    };
  } catch (error) {
    console.error('Error parsing PDF with metadata:', error);
    throw new Error('Failed to parse PDF');
  }
}

/**
 * Clean and normalize extracted text
 */
export function cleanPDFText(text) {
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
 * Extract email addresses from PDF text
 */
export function extractEmails(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emails = text.match(emailRegex);
  return emails ? [...new Set(emails)] : [];
}

/**
 * Extract phone numbers from PDF text
 */
export function extractPhones(text) {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  return phones ? [...new Set(phones)] : [];
}