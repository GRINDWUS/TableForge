# TableForge ⚡

**Spreadsheet Interface for Real Databases** - Built in 16 hours for Watch The Code 2026

## 🎯 What is TableForge?

TableForge brings the simplicity of spreadsheets to the power of real databases. No SQL required. Your data, your servers.

### The Problem
- Airtable is easy but your data is locked in
- DBeaver is powerful but requires SQL expertise
- There's a gap: **no tool offers BOTH ease AND ownership**

### The Solution
TableForge gives you:
- **Spreadsheet UI** (looks/feels like Airtable)
- **Real Databases** (SQLite, PostgreSQL, MySQL)
- **Zero SQL** (all point-and-click)
- **Data Ownership** (stays on your servers)

## ✨ Features

- 🎨 **Spreadsheet Interface** - Familiar grid UI for database management
- 🔄 **Full CRUD** - Create, Read, Update, Delete data easily
- 🔗 **Visualize Relationships** - See table connections with ReactFlow
- 🔍 **Filter & Sort** - Advanced querying without SQL
- 🤖 **AI Query Helper** - Claude API for intelligent suggestions
- 📋 **Schema Editor** - View and understand your database
- 📥 **Export CSV** - Download data with one click
- 🌙 **Dark Mode** - Eye-friendly interface
- ⌨️ **Keyboard Shortcuts** - Ctrl+E (Export), Ctrl+A (Add), Ctrl+F (Filter), Ctrl+R (Refresh)
- 📱 **Responsive** - Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite (10x faster build)
- TailwindCSS 3 (styling)
- ReactFlow 11 (relationship visualization)
- Axios (HTTP client)

### Backend
- Node.js 16+ (runtime)
- Express 4.x (API framework)
- SQLite 3 (MVP database)
- Claude API (AI features)

### Why This Stack?
✓ **Fast** - Vite builds in milliseconds
✓ **Standard** - Industry-proven technologies
✓ **Same Language** - JavaScript everywhere
✓ **Scalable** - Easy SQLite→PostgreSQL migration
✓ **Realistic** - Built for hackathons

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([download](https://nodejs.org/))
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/GRINDWUS/TableForge.git
cd TableForge

# Setup Frontend
cd frontend
npm install
npm run dev
# → Opens http://localhost:5173

# Setup Backend (in new terminal)
cd backend
npm install
npm run dev
# → Server on http://localhost:5000
```

### Environment Setup

Create `backend/.env`:
```
PORT=5000
DATABASE=./data.db
NODE_ENV=development

## 📖 Usage

1. **Open** http://localhost:5173
2. **Select** a table from the sidebar
3. **View** all data in the grid
4. **Add** rows with the + button (or Ctrl+A)
5. **Edit** by clicking in cells or using Edit button
6. **Delete** rows easily
7. **Filter** using natural language with Filter button
8. **Sort** by any column
9. **Export** to CSV (or Ctrl+E)
10. **Toggle** dark mode with moon icon

## 🔌 API Endpoints

### Tables
```
GET  /api/tables              → List all tables
GET  /api/tables/:name/schema → Get column info
GET  /api/tables/:name/data   → Get table data
```

### CRUD Operations
```
POST   /api/tables/:name/rows         → Insert row
PUT    /api/tables/:name/rows/:id     → Update row
DELETE /api/tables/:name/rows/:id     → Delete row
```

### Advanced
```
GET  /api/tables/:name/query        → Query with filter & sort
POST /api/ai/suggest-query          → Get AI SQL suggestion
GET  /api/ai/recommendations/:table → Get optimization tips
```

## 🎓 16-Hour Build Timeline

### Day 1: MVP (8 Hours)
- Hour 1: Express + SQLite setup
- Hour 2: GET tables, schema, data APIs
- Hour 3: React grid component
- Hour 4: INSERT, UPDATE, DELETE APIs
- Hour 5: Edit/delete UI
- Hour 6: Schema viewer
- Hour 7: Navigation & polish
- Hour 8: Testing & seeding

### Day 2: Complete Product (8 Hours)
- Hour 9: Relationship visualizer
- Hour 10: Filter & sort
- Hour 11: AI query suggestions
- Hour 12: Dark mode
- Hour 13: CSV export & shortcuts
- Hour 14: Responsive design
- Hour 15: Testing & polish
- Hour 16: Documentation & ready for deployment

## 📊 Project Stats

- **16 commits** (1 per hour)
- **1000+ lines** of well-organized code
- **5 components** on frontend
- **5 API routes** on backend
- **5 advanced features** (AI, filters, export, relationships, dark mode)
- **Built in 16 hours** ⚡

 
## 🗺️ Future Roadmap

### Month 1-2: Scale
- [ ] PostgreSQL support
- [ ] Multi-user teams
- [ ] Real-time collaboration

### Month 3-4: Enterprise
- [ ] Advanced permissions
- [ ] Audit logging
- [ ] Data validation

### Month 5-6: Market
- [ ] White-label option
- [ ] Custom integrations
- [ ] Enterprise support

## 🎯 Competitive Advantages

| Feature | Airtable | DBeaver | TableForge |
|---------|----------|---------|-----------|
| Easy UI | ✅ | ❌ | ✅ |
| Real Database | ❌ | ✅ | ✅ |
| Data Ownership | ❌ | ✅ | ✅ |
| No SQL Required | ✅ | ❌ | ✅ |
| Open Source Ready | ❌ | ✅ | ✅ |
| Custom Deployment | ❌ | ✅ | ✅ |

**TableForge = Airtable's ease + DBeaver's power + Your data control** 🚀

## 🤝 Contributing

### Setup Dev Environment
```bash
git clone https://github.com/GRINDWUS/TableForge.git
cd TableForge
# Follow Quick Start above
```

### Commit Convention
```
feat:  Add new feature
fix:   Fix bug
docs:  Update documentation
style: Format code
refactor: Restructure code
test:  Add tests
```

## 📝 License

MIT - Open source and free to use

## 👥 Team

Built by the GRINDWUS TEAM **Watch The Code 2026** 🏆

## 🤖 AI Features

TableForge uses **GEMINI 2.0** from GOOGLE for:
- SQL query suggestions from plain English
- Database optimization recommendations
- Smart query building

## 💡 Tips

- **Keyboard shortcuts save time**: Ctrl+E (export), Ctrl+A (add row), Ctrl+F (filter), Ctrl+R (refresh)
- **Dark mode uses system preference** - toggle anytime
- **CSV exports include all data** - great for backups
- **Relationships visualize** your schema - understand your data better
- **Filter uses fuzzy search** - find what you need fast

## 🆘 Troubleshooting

### Backend won't start
```
Error: Port 5000 already in use
Solution: Kill process or change PORT in .env
```

### CORS errors
```
Error: Access-Control-Allow-Origin
Solution: Check backend has cors() middleware
```

  
 
## 📞 Support

- 📖 Check the README
- 🐛 Open an [issue](https://github.com/GRINDWUS/TableForge/issues)
- 💬 Start a [discussion](https://github.com/GRINDWUS/TableForge/discussions)

---

**Made with ❤️ for Watch The Code 2026**

TableForge: *Make database management as easy as Excel* ⚡
