import React, { useState } from 'react';
import axios from 'axios';

export function AIQueryHelper({ tableName, tableSchema }) {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

  const handleGetSuggestion = async () => {
    if (!query.trim()) {
      setError('Please enter a query description');
      return;
    }

    setError('');
    setSuggestion('');
    setLoading(true);

    try {
      const response = await API.post('/ai/suggest-query', {
        schema: tableSchema,
        userQuery: query
      });
      setSuggestion(response.data.suggestion);
    } catch (error) {
      console.error('Error getting suggestion:', error);
      setError(
        error.response?.data?.error || 
        'Error getting AI suggestion. Check that ANTHROPIC_API_KEY is set in .env'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGetSuggestion();
    }
  };

  return (
    <div className="p-4 bg-white rounded border shadow mb-4">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        🤖 AI Query Helper
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe what you want to query (in plain English):
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Example: 'Show me all users named John who have an email'"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows="3"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Press Ctrl+Enter to submit
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleGetSuggestion}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 font-medium transition"
        >
          {loading ? '⏳ Getting suggestion...' : '✨ Get AI Suggestion'}
        </button>

        {suggestion && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Suggested SQL Query:
            </label>
            <div className="relative bg-gray-100 p-3 rounded font-mono text-sm break-all border border-gray-300">
              {suggestion}
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              💡 Note: Verify this SQL before using it. You can paste it into your database client.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
