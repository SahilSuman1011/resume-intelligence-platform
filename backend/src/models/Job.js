// Job Model - Data structure for job postings

class Job {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title;
    this.description = data.description;
    this.url = data.url || null;
    this.skills = data.skills || [];
    this.requiredExperience = data.requiredExperience || null;
    this.education = data.education || null;
    this.location = data.location || null;
    this.salary = data.salary || null;
    this.type = data.type || 'full-time'; // full-time, part-time, contract
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (this.description && this.description.length < 50) {
      errors.push('Description must be at least 50 characters');
    }

    if (this.url && !this.isValidUrl(this.url)) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      url: this.url,
      skills: this.skills,
      requiredExperience: this.requiredExperience,
      education: this.education,
      location: this.location,
      salary: this.salary,
      type: this.type,
      skillCount: this.skills.length,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Update job data
  update(data) {
    if (data.title) this.title = data.title;
    if (data.description) this.description = data.description;
    if (data.url !== undefined) this.url = data.url;
    if (data.skills) this.skills = data.skills;
    if (data.requiredExperience !== undefined) this.requiredExperience = data.requiredExperience;
    if (data.education !== undefined) this.education = data.education;
    if (data.location !== undefined) this.location = data.location;
    if (data.salary !== undefined) this.salary = data.salary;
    if (data.type) this.type = data.type;
    
    this.updatedAt = new Date().toISOString();
  }

  // Get summary
  getSummary() {
    return {
      id: this.id,
      title: this.title,
      skillCount: this.skills.length,
      type: this.type,
      createdAt: this.createdAt
    };
  }
}

export default Job;