// Validation utilities

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate file size
 */
export function isValidFileSize(size, maxSize = 10 * 1024 * 1024) {
  return size > 0 && size <= maxSize;
}

/**
 * Validate file type
 */
export function isValidFileType(mimetype, allowedTypes = ['application/pdf', 'text/plain']) {
  return allowedTypes.includes(mimetype);
}

/**
 * Validate string length
 */
export function isValidLength(str, min, max) {
  if (!str) return false;
  const length = str.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate required fields
 */
export function validateRequired(obj, requiredFields) {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      missing.push(field);
    }
  });
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Validate job data
 */
export function validateJobData(data) {
  const errors = [];
  
  if (!data.title || !isValidLength(data.title, 3, 200)) {
    errors.push('Title must be between 3 and 200 characters');
  }
  
  if (!data.description || !isValidLength(data.description, 50, 10000)) {
    errors.push('Description must be between 50 and 10,000 characters');
  }
  
  if (data.url && !isValidUrl(data.url)) {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate resume file
 */
export function validateResumeFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  if (!isValidFileType(file.mimetype)) {
    errors.push('Invalid file type. Only PDF and TXT files are allowed');
  }
  
  if (!isValidFileSize(file.size)) {
    errors.push('File size exceeds maximum limit of 10MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate chat message
 */
export function validateChatMessage(data) {
  const errors = [];
  
  if (!data.resumeId) {
    errors.push('Resume ID is required');
  }
  
  if (!data.message || !isValidLength(data.message, 1, 1000)) {
    errors.push('Message must be between 1 and 1,000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validate and sanitize object
 */
export function sanitizeObject(obj) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}