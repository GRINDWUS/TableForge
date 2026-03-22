const express = require('express');
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");

module.exports = (db) => {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  // Get AI suggestion for SQL query
  router.post('/ai/suggest-query', async (req, res) => {
    const { schema, userQuery } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'userQuery is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'ANTHROPIC_API_KEY not configured',
        hint: 'Please set ANTHROPIC_API_KEY in backend/.env'
      });
    }

    try {
      const schemaDescription = schema.map(col => 
        `${col.name} (${col.type}${col.notnull ? ', NOT NULL' : ''}${col.pk ? ', PRIMARY KEY' : ''})`
      ).join('\n');

      const message = await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Database schema:
${schemaDescription}

User request: "${userQuery}"

Generate ONLY the SQL SELECT query, nothing else. No explanation, just the SQL code.`
          }
        ]
      });

      const suggestion = message.content[0].type === 'text' 
        ? message.content[0].text.trim() 
        : '';

      res.json({ suggestion });
    } catch (error) {
      console.error('AI Error:', error.message);
      res.status(500).json({ 
        error: 'AI service error',
        details: error.message 
      });
    }
  });

  // Get recommendations for table optimization
  router.get('/ai/recommendations/:table', async (req, res) => {
    const tableName = req.params.table;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    try {
      const message = await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `For a database table named "${tableName}", provide 3 brief recommendations for optimization and best practices.`
          }
        ]
      });

      const recommendations = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      res.json({ recommendations });
    } catch (error) {
      console.error('AI Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
