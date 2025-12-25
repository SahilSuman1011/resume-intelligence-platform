// Resume Model - Data structure for resumes

class Resume {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.filename = data.filename;
    this.originalName = data.originalName || data.filename;
    this.mimetype = data.mimetype;
    this.size = data.size;
    this.text = data.text;
    this.skills = data.skills || [];
    this.extractedData = data.extractedData || {};
    this.metadata = data.metadata || {};
    this.uploadedAt = data.uploadedAt || new Date().toISOString();
  }

  generateId() {
    return `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.filename) {
      errors.push('Filename is required');
    }

    if (!this.text || this.text.trim().length === 0) {
      errors.push('Resume text content is required');
    }

    if (this.text && this.text.length < 100) {
      errors.push('Resume content seems too short (minimum 100 characters)');
    }

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (this.mimetype && !allowedTypes.includes(this.mimetype)) {
      errors.push('Invalid file type. Only PDF and TXT are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (this.size && this.size > maxSize) {
      errors.push('File size exceeds maximum limit of 10MB');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Extract additional data
  extractMetadata() {
    this.extractedData = {
      name: this.extractName(),
      email: this.extractEmail(),
      phone: this.extractPhone(),
      wordCount: this.text.split(/\s+/).length,
      characterCount: this.text.length,
    };
  }

  extractName() {
    const lines = this.text.split('\n').filter(line => line.trim().length > 0);
    return lines[0]?.trim() || 'Unknown';
  }

  extractEmail() {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emails = this.text.match(emailRegex);
    return emails ? emails[0] : null;
  }

  extractPhone() {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = this.text.match(phoneRegex);
    return phones ? phones[0] : null;
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      filename: this.filename,
      originalName: this.originalName,
      mimetype: this.mimetype,
      size: this.size,
      skills: this.skills,
      skillCount: this.skills.length,
      extractedData: this.extractedData,
      metadata: this.metadata,
      uploadedAt: this.uploadedAt,
      textPreview: this.text ? this.text.substring(0, 200) + '...' : null
    };
  }

  // Get summary (without full text)
  getSummary() {
    return {
      id: this.id,
      filename: this.filename,
      skillCount: this.skills.length,
      wordCount: this.extractedData.wordCount,
      uploadedAt: this.uploadedAt
    };
  }

  // Update resume data
  update(data) {
    if (data.skills) this.skills = data.skills;
    if (data.extractedData) {
      this.extractedData = { ...this.extractedData, ...data.extractedData };
    }
    if (data.metadata) {
      this.metadata = { ...this.metadata, ...data.metadata };
    }
  }

  // Calculate match with job
  calculateMatch(jobSkills) {
    if (!jobSkills || jobSkills.length === 0) {
      return {
        matchPercentage: 0,
        matchedSkills: [],
        missingSkills: [],
        totalRequired: 0,
        totalMatched: 0
      };
    }

    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
    const normalizedResumeSkills = this.skills.map(s => s.toLowerCase().trim());

    const matchedSkills = [];
    const matchedIndices = new Set();

    normalizedJobSkills.forEach((jobSkill) => {
      const match = normalizedResumeSkills.find((resumeSkill, index) => {
        if (matchedIndices.has(index)) return false;
        
        // Exact match
        if (resumeSkill === jobSkill) return true;
        
        // Partial match
        if (resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)) {
          return true;
        }
        
        return false;
      });

      if (match) {
        matchedSkills.push(jobSkill);
        const index = normalizedResumeSkills.indexOf(match);
        matchedIndices.add(index);
      }
    });

    const missingSkills = normalizedJobSkills.filter(skill => 
      !matchedSkills.includes(skill)
    );

    const matchPercentage = Math.round(
      (matchedSkills.length / normalizedJobSkills.length) * 100
    );

    return {
      matchPercentage,
      matchedSkills: matchedSkills.map(s => 
        jobSkills.find(js => js.toLowerCase() === s) || s
      ),
      missingSkills: missingSkills.map(s => 
        jobSkills.find(js => js.toLowerCase() === s) || s
      ),
      totalRequired: jobSkills.length,
      totalMatched: matchedSkills.length
    };
  }
}

export default Resume;