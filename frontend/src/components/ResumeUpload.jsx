import { useState, useRef } from 'react';
import { Upload, FileText, Loader, CheckCircle, X, AlertCircle } from 'lucide-react';
import { resumeAPI } from '../services/api';
import { formatFileSize } from '../utils/helpers';

function ResumeUpload({ currentJob, onResumeUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('text')) {
      setError('Please select a PDF or text file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile) {
      // Create a synthetic event for handleFileSelect
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      if (currentJob) {
        formData.append('jobId', currentJob.id);
      }

      console.log('Uploading resume...');
      const data = await resumeAPI.upload(formData);
      console.log('Upload response:', data);
      console.log('Match data received:', data.match);

      setSuccess(true);
      
      // Pass resume and match data to parent
      if (onResumeUploaded) {
        console.log('Calling onResumeUploaded with match:', data.match);
        onResumeUploaded(
          data.resume,
          data.match || null
        );
      }

      // Clear form after 2 seconds
      setTimeout(() => {
        handleRemoveFile();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Upload className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Upload Resume</h2>
          <p className="text-sm text-gray-600">
            {currentJob 
              ? `Analyzing for: ${currentJob.title}`
              : 'Upload a resume to get started'}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!file ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <FileText className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Drop your resume here or click to browse
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF and TXT files (Max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="btn btn-primary cursor-pointer inline-block">
              Select File
            </label>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center mx-auto space-x-1"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
              <span>Remove File</span>
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>Resume uploaded and processed successfully!</span>
        </div>
      )}

      {/* Upload Button */}
      {file && !success && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing Resume...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload & Analyze</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Info */}
      {!currentJob && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="text-sm">
            💡 <strong>Tip:</strong> Create a job description first for skill matching and ranking
          </p>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
