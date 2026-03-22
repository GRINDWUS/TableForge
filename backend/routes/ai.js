const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = (db) => {
  // AI Clients initialization
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  router.post('/ai/suggest-query', async (req, res) => {
    const { schema, userQuery, tableName } = req.body;
    const q = userQuery.toLowerCase();
    const table = tableName || 'your_table';

    if (!userQuery) return res.status(400).json({ error: 'userQuery is required' });

    const schemaDescription = schema.map(col => 
      `${col.name || col.Field || col.column_name} (${col.type || col.Type || col.data_type})`
    ).join('\n');

    const prompt = `Database Table: "${table}"\nSchema:\n${schemaDescription}\n\nUser Request: "${userQuery}"\n\nTask: Generate ONLY the SQL SELECT query. No explanations, no markdown, just raw SQL code.`;

    // 1. Try GEMINI (Best Free Option)
    const geminiKey = process.env.GEMINI_API_KEY || '';
    if (geminiKey && !geminiKey.startsWith('PASTE')) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const suggestion = result.response.text().replace(/```sql|```/g, "").trim();
        if (suggestion) return res.json({ suggestion });
      } catch (err) {
        console.warn('Gemini API Failed:', err.message);
      }
    }

    
    // 2. PERMANENT FALLBACK ENGINE (Zero-Cost Safety Net)
    let sql = `SELECT * FROM ${table}`;
    let where = [];
    const cols = schema.map(c => (c.name || c.Field || c.column_name).toLowerCase());

    // 3a. Priority 1: Handle Specific Boolean Keywords (Before generic loop)
    if (q.includes('high') && (cols.includes('priority') || cols.includes('level'))) {
      const pCol = cols.find(c => c.includes('priority') || c.includes('level'));
      where.push(`${pCol} >= 4`);
    } else if (q.includes('low') && (cols.includes('priority') || cols.includes('level'))) {
      const pCol = cols.find(c => c.includes('priority') || c.includes('level'));
      where.push(`${pCol} <= 2`);
    }

    if (q.includes('urgent') && cols.includes('is_urgent')) {
      where.push(`is_urgent = 1`);
    }

    // 2b. Priority 2: Generic Filtering Loop
    cols.forEach(col => {
      // Don't re-process columns already handled by specific logic above
      if (q.includes(col) && !where.some(w => w.toLowerCase().includes(col))) {
        // Regex to find "col [operator] [value]" or "col [value]"
        const valRegex = new RegExp(`${col}[ ]?(>|<|=)?[ ]?['"]?(\\w+)['"]?`);
        const match = q.match(valRegex);
        
        if (match) {
          const operator = match[1] || '=';
          const value = match[2];
          
          // Skip if the "value" is actually another keyword like "urgent" or "high"
          if (['urgent', 'high', 'low', 'completed', 'done', 'is'].includes(value)) return;

          if (isNaN(value)) where.push(`${col} LIKE '%${value}%'`);
          else where.push(`${col} ${operator} ${value}`);
        }
      }
    });

    if (q.includes('count')) sql = `SELECT COUNT(*) FROM ${table}`;
    if (where.length > 0) sql += ` WHERE ` + [...new Set(where)].join(' AND ');

    res.json({ 
      suggestion: sql + `; \n-- Note: Generated using TableForge Permanent Offline Engine\n-- (Connect Gemini/Claude in .env for better results)`
    });
  });

  return router;
};
