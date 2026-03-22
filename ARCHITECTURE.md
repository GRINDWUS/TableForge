# TableForge Architecture

## System Design
```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React Frontend (Vite)                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │  │
│  │  │   Grid   │ │ TableSel │ │ Forms    │  Components  │  │
│  │  └──────────┘ └──────────┘ └──────────┘              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │  │
│  │  │ Schema   │ │Relation  │ │ Filter   │  Advanced    │  │
│  │  └──────────┘ └──────────┘ └──────────┘              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↕ Axios (HTTP)
┌──────────────────────────────────────────────────────────────┐
│                  Express Backend (Node.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes                               │   │
│  │  ┌─────────┐ ┌────────┐ ┌──────┐ ┌──────┐           │   │
│  │  │ Tables  │ │ Rows   │ │Query │ │AI    │  Routes   │   │
│  │  └─────────┘ └────────┘ └──────┘ └──────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Database Layer                              │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │     SQLite (Dev) or PostgreSQL (Prod)      │    │   │
│  │  │  Tables: users, products, orders, etc.     │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components
```
App.jsx (Main)
├── Header
│   └── DarkModeToggle
├── TableSelector
├── Main Content
│   ├── RowForm
│   ├── SchemaEditor
│   ├── RelationshipVisualizer
│   ├── FilterSort
│   ├── AIQueryHelper
│   └── GridComponent
└── Footer
```

### Backend Routes
```
/api
├── /tables
│   ├── GET /tables
│   ├── GET /tables/:name/schema
│   └── GET /tables/:name/data
├── /tables/:name/rows
│   ├── POST (insert)
│   ├── PUT /:id (update)
│   └── DELETE /:id (delete)
├── /tables/:name/query
│   └── GET (with filter & sort)
└── /ai
    ├── POST /ai/suggest-query
    └── GET /ai/recommendations/:table
```

## Data Flow

### 1. Load Table Data
```
User clicks table → App fetches tables → Calls GET /api/tables
→ Sets tables state → TableSelector renders buttons
```

### 2. View Grid
```
User clicks table name → Calls GET /api/tables/:name/data
→ Calls GET /api/tables/:name/schema
→ Sets data & columns state → GridComponent renders
```

### 3. Add Row
```
User fills form → Calls POST /api/tables/:name/rows
→ Backend inserts → Calls GET to refresh → Grid updates
```

### 4. Edit Row
```
User edits cell → Calls PUT /api/tables/:name/rows/:id
→ Backend updates → Calls GET to refresh → Grid updates
```

### 5. Filter Data
```
User enters filter → Calls GET /api/tables/:name/query?filter=...
→ Backend searches → Returns matching rows → GridComponent updates
```

### 6. AI Query
```
User describes query → Calls POST /api/ai/suggest-query
→ Claude API suggests SQL → Returns suggestion → User sees code
```

## Database Schema

### Users Table (Example)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Auto-detected by TableForge

- Column names
- Data types (TEXT, INTEGER, REAL, BLOB)
- Constraints (PRIMARY KEY, NOT NULL)
- Timestamps

## Performance Optimizations

1. **Pagination**: Limit 50 rows per request
2. **Caching**: Grid data cached in state
3. **Debouncing**: Filter/sort debounced
4. **Lazy Loading**: Components load on demand
5. **Code Splitting**: Vite splits chunks automatically

## Security Considerations

1. **SQL Injection**: Use parameterized queries (?)
2. **CORS**: Backend has CORS enabled
3. **Validation**: Joi validates input
4. **Environment**: Secrets in .env (not in code)
5. **API Keys**: Claude key stored server-side only

---

See full code at: [GitHub](https://github.com/GRINDWUS/TableForge)
