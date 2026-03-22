import React, { useState } from 'react';
import axios from 'axios';

const COMMON_TEMPLATES = [
  { label: '--- 🎨 Quick Templates ---', sql: '' },
  { label: 'List all records', sql: (table) => `SELECT * FROM ${table} LIMIT 100;` },
  { label: 'Find by custom ID', sql: (table) => `SELECT * FROM ${table} WHERE id = 1;` },
  { label: 'Sort by Latest (Newest first)', sql: (table) => `SELECT * FROM ${table} ORDER BY id DESC;` },
  { label: 'Count total records', sql: (table) => `SELECT COUNT(*) FROM ${table};` },
  { label: 'Search for text', sql: (table) => `SELECT * FROM ${table} WHERE name LIKE '%text%';` },
  { label: 'High Priority (Demo Table)', sql: (table) => `SELECT * FROM ${table} WHERE priority >= 4;` },
  { label: 'Show Urgent Tasks', sql: (table) => `SELECT * FROM ${table} WHERE is_urgent = 1;` },
];

export function AIQueryHelper({ tableName, tableSchema }) {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
  });

  const handleApplyTemplate = (e) => {
    const template = COMMON_TEMPLATES.find(t => t.label === e.target.value);
    if (template && template.sql) {
      const sql = typeof template.sql === 'function' ? template.sql(tableName) : template.sql;
      setSuggestion(sql);
      setError('');
    }
  };

  const handleGetSuggestion = async () => {
    if (!query.trim()) {
      setError('Please describe your query first');
      return;
    }

    setError('');
    setSuggestion('');
    setLoading(true);

    try {
      const response = await API.post('/ai/suggest-query', {
        tableName: tableName,
        schema: tableSchema,
        userQuery: query
      });
      setSuggestion(response.data.suggestion);
    } catch (err) {
      console.error('Error getting suggestion:', err);
      setError(
        err.response?.data?.error || 
        'Error connecting to AI service. Falling back to local engine failed.'
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
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-2xl mb-6 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">AI Query Architect</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black">Natural Language to SQL</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
            Describe what you want to query:
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Example: 'Find all urgent tasks with priority 5'"
            className="w-full p-4 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white shadow-inner resize-none h-24 transition-all"
          />
          <p className="text-[10px] text-gray-400 mt-2 italic">
            💡 Tip: Press Ctrl+Enter to architect the query
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleGetSuggestion}
            disabled={loading || !query.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : '✨ Generate Blueprint'}
          </button>

          <div className="relative">
            <select 
              onChange={handleApplyTemplate}
              className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 font-bold rounded-xl text-gray-700 dark:text-gray-200 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-md"
            >
              {COMMON_TEMPLATES.map(t => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {suggestion && (
          <div className="animate-slideUp pt-4 border-t dark:border-gray-700">
            <label className="text-[10px] font-black text-emerald-600 mb-2 block uppercase tracking-tighter">🚀 Recommended Blueprint (SQL):</label>
            <div className="relative group">
              <pre className="p-4 bg-gray-900 border border-gray-700 text-emerald-400 font-mono text-sm rounded-xl overflow-x-auto shadow-2xl min-h-[80px] break-all whitespace-pre-wrap leading-relaxed">
                {suggestion}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-bold rounded-lg backdrop-blur-md transition border border-white/20"
              >
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <span className="text-amber-500 text-xs">⚠️</span>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                Verify this SQL before executing. Paste it into your database client to apply.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
