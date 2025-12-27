import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' 
});

/**
 * Extract skills from job description using AI
 */
export async function extractJobSkills(jobDescription) {
  try {
    console.log('Extracting job skills...');
    
    // Validate input
    if (!jobDescription || jobDescription.trim().length < 20) {
      console.warn('Job description too short, using keyword fallback');
      return extractSkillsKeywordBased(jobDescription || '');
    }
    
    const startTime = Date.now();
    
    // More directive prompt that doesn't allow conversational responses
    const prompt = `Task: Extract technical skills from job description below.
Output format: comma-separated list only.

Job Description:
${jobDescription.substring(0, 2000)}

Extracted Skills (comma-separated):`;

    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 150,
        num_ctx: 1024,
        repeat_penalty: 1.1,
        stop: ['\n\nExplanation:', '\n\nNote:', '\n\nRequired:', '\n\nQualifications:', '\n\nResponsibilities:']
      }
    });

    console.log('Raw AI response:', response.response);
    console.log('Response length:', response.response.length);

    // Check if AI gave a conversational/unhelpful response
    const responseText = response.response.toLowerCase();
    if (responseText.includes('i don\'t see') || 
        responseText.includes('can you provide') || 
        responseText.includes('please provide') ||
        responseText.includes('i\'m happy to help')) {
      console.warn('AI gave conversational response, using keyword fallback');
      return extractSkillsKeywordBased(jobDescription);
    }

    const skills = response.response
      .split(/[,\n;]/)
      .map(skill => skill.trim())
      .map(skill => skill.replace(/^[-*•]\s*/, ''))  // Remove bullets
      .map(skill => skill.replace(/^\d+\.\s*/, ''))  // Remove numbers
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter(skill => !skill.toLowerCase().includes('skill'))
      .filter(skill => !skill.toLowerCase().startsWith('and '))
      .filter(skill => !skill.toLowerCase().startsWith('or '));

    const uniqueSkills = [...new Set(skills)];
    const duration = Date.now() - startTime;
    console.log(`✓ Extracted ${uniqueSkills.length} skills in ${duration}ms`);
    
    // If AI extraction failed, use keyword fallback
    if (uniqueSkills.length === 0) {
      console.warn('AI extracted 0 skills, using keyword fallback');
      return extractSkillsKeywordBased(jobDescription);
    }
    
    return uniqueSkills.slice(0, 30);  // Limit to top 30
  } catch (error) {
    console.error('Error extracting job skills:', error);
    return extractSkillsKeywordBased(jobDescription);
  }
}

/**
 * Extract skills from resume using AI
 */
export async function extractResumeSkills(resumeText) {
  try {
    console.log('Extracting resume skills...');
    
    // Validate input
    if (!resumeText || resumeText.trim().length < 50) {
      console.warn('Resume text too short, using keyword fallback');
      return extractSkillsKeywordBased(resumeText || '');
    }
    
    const startTime = Date.now();
    
    // More directive prompt
    const prompt = `Task: Extract technical skills from resume below.
Output format: comma-separated list only.

Resume:
${resumeText.substring(0, 2000)}

Extracted Skills (comma-separated):`;

    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 150,
        num_ctx: 1024,
        repeat_penalty: 1.1,
        stop: ['\n\nExperience:', '\n\nEducation:', '\n\nNote:', '\n\nProjects:', '\n\nCertifications:']
      }
    });

    console.log('Raw AI response:', response.response);
    console.log('Response length:', response.response.length);

    // Check if AI gave a conversational/unhelpful response
    const responseText = response.response.toLowerCase();
    if (responseText.includes('i don\'t see') || 
        responseText.includes('can you provide') || 
        responseText.includes('please provide') ||
        responseText.includes('i\'m happy to help')) {
      console.warn('AI gave conversational response, using keyword fallback');
      return extractSkillsKeywordBased(resumeText);
    }

    const skills = response.response
      .split(/[,\n;]/)
      .map(skill => skill.trim())
      .map(skill => skill.replace(/^[-*•]\s*/, ''))  // Remove bullets
      .map(skill => skill.replace(/^\d+\.\s*/, ''))  // Remove numbers
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter(skill => !skill.toLowerCase().includes('skill'))
      .filter(skill => !skill.toLowerCase().startsWith('and '))
      .filter(skill => !skill.toLowerCase().startsWith('or '));

    const uniqueSkills = [...new Set(skills)];
    const duration = Date.now() - startTime;
    console.log(`✓ Extracted ${uniqueSkills.length} skills in ${duration}ms`);
    
    // If AI extraction failed, use keyword fallback
    if (uniqueSkills.length === 0) {
      console.warn('AI extracted 0 skills, using keyword fallback');
      return extractSkillsKeywordBased(resumeText);
    }
    
    return uniqueSkills.slice(0, 30);  // Limit to top 30
  } catch (error) {
    console.error('Error extracting resume skills:', error);
    return extractSkillsKeywordBased(resumeText);
  }
}

/**
 * Fallback keyword-based skill extraction
 */
function extractSkillsKeywordBased(text) {
  console.log('Using fallback keyword extraction');
  
  const commonSkills = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
    'TypeScript', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB',
    
    // Frontend
    'React', 'Angular', 'Vue', 'HTML', 'CSS', 'jQuery', 'Bootstrap',
    'Tailwind CSS', 'Next.js', 'Nuxt.js', 'Redux', 'Webpack', 'Vite',
    
    // Backend
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel',
    'Ruby on Rails', 'ASP.NET', 'FastAPI', 'NestJS',
    
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB',
    'SQLite', 'Oracle', 'SQL Server', 'MariaDB', 'Elasticsearch', 'Neo4j',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CircleCI',
    'GitHub Actions', 'Terraform', 'Ansible', 'CI/CD',
    
    // Tools
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence',
    'Postman', 'VS Code', 'IntelliJ', 'npm', 'yarn',
    
    // AI/ML
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
    'Scikit-learn', 'NLP', 'Computer Vision', 'LangChain', 'OpenAI',
    
    // Soft Skills
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
    'Agile', 'Scrum', 'Project Management', 'Analytical Thinking',
    'Critical Thinking', 'Time Management'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = commonSkills.filter(skill => 
    lowerText.includes(skill.toLowerCase())
  );
  
  console.log('Found skills (keyword):', foundSkills.length);
  return foundSkills;
}

/**
 * Calculate skill match between job and resume
 */
export function calculateSkillMatch(jobSkills, resumeSkills) {
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
  const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase().trim());

  // Find matched skills (fuzzy matching)
  const matchedSkills = [];
  const matchedIndices = new Set();

  normalizedJobSkills.forEach((jobSkill) => {
    const match = normalizedResumeSkills.find((resumeSkill, index) => {
      if (matchedIndices.has(index)) return false;
      
      // Exact match
      if (resumeSkill === jobSkill) return true;
      
      // Partial match (contains)
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

  // Find missing skills
  const missingSkills = normalizedJobSkills.filter(skill => 
    !matchedSkills.includes(skill)
  );

  const matchPercentage = normalizedJobSkills.length > 0
    ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100)
    : 0;

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