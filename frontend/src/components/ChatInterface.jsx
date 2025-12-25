import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader, Trash2, User, Bot, Sparkles } from 'lucide-react';
import { chatAPI } from '../services/api';

function ChatInterface({ currentResume }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current && currentResume) {
      inputRef.current.focus();
    }
  }, [currentResume]);

  const handleSend = async () => {
    if (!input.trim() || !currentResume || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Sending chat message:', input);
      
      const data = await chatAPI.sendMessage({
        resumeId: currentResume.id,
        message: input.trim(),
        sessionId,
      });

      console.log('Received response:', data);

      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        confidence: data.confidence,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSessionId(null);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What are the candidate's key technical skills?",
    "How many years of experience does the candidate have?",
    "What programming languages does the candidate know?",
    "Tell me about the candidate's education background",
    "What projects has the candidate worked on?"
  ];

  if (!currentResume) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Chat with Resume</h2>
        </div>
        <div className="text-center py-16">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Resume Selected
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Upload a resume first to start asking questions about the candidate
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chat with Resume</h2>
            <p className="text-sm text-gray-600">
              Analyzing: <span className="font-medium">{currentResume.filename}</span>
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="btn btn-secondary text-sm flex items-center space-x-2"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ask me anything about this resume!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                I can answer questions about skills, experience, education, and more.
              </p>
              
              {/* Suggested Questions */}
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Try asking:
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="w-full text-left px-3 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 inline mr-2 text-blue-500" />
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : message.error
                        ? 'bg-red-500 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1">
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : message.error
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      
                      {/* Confidence Score for AI responses */}
                      {message.confidence !== undefined && !message.error && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Confidence: {(message.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-gray-600">Analyzing resume...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about this resume..."
              rows={1}
              className="textarea resize-none"
              disabled={loading}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Send message"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to send, 
            <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs ml-1">Shift+Enter</kbd> for new line
          </p>
          <p className="text-xs text-gray-500">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;