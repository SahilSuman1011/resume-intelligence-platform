import { useState } from 'react';
import { Briefcase, FileText, Link as LinkIcon, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { jobAPI } from '../services/api';

function JobInput({ onJobCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'url'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }

    if (inputMode === 'manual' && !description.trim()) {
      setError('Job description is required');
      return;
    }

    if (inputMode === 'url' && !url.trim()) {
      setError('Job URL is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        title: title.trim(),
      };

      if (inputMode === 'manual') {
        payload.description = description.trim();
      } else {
        payload.url = url.trim();
      }

      console.log('Creating job:', payload);
      const data = await jobAPI.create(payload);
      console.log('Job created:', data);

      setSuccess(true);
      
      if (onJobCreated) {
        onJobCreated(data.job);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setUrl('');
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setError('');
    setSuccess(false);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Briefcase className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Job Description</h2>
          <p className="text-sm text-gray-600">
            Enter job details or scrape from URL
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setInputMode('manual')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            inputMode === 'manual'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Manual Input</span>
          </div>
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            inputMode === 'url'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <LinkIcon className="w-4 h-4" />
            <span>From URL</span>
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className="input"
            disabled={loading}
          />
        </div>

        {/* Manual Input Mode */}
        {inputMode === 'manual' && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the full job description including responsibilities, requirements, and qualifications..."
              rows={12}
              className="input resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include skills, experience requirements, and qualifications for better matching
            </p>
          </div>
        )}

        {/* URL Input Mode */}
        {inputMode === 'url' && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Job Posting URL *
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/jobs/12345"
              className="input"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Our AI will scrape and extract the job description from the URL
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Job created successfully! Skills extracted and ready for matching.</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5" />
                <span>Create Job & Extract Skills</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        <p className="text-sm font-semibold mb-1">🤖 AI-Powered Skill Extraction</p>
        <p className="text-xs">
          Our AI will automatically extract required skills, technologies, and qualifications from the job description
        </p>
      </div>
    </div>
  );
}

export default JobInput;
