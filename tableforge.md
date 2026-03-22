# TableForge

> A spreadsheet-like interface for managing real databases SQLite, MySQL, and PostgreSQL with support for custom types, default value functions, and visual relationship mapping.

---

<details>

<summary>

## Table of Contents

</summary>

- [TableForge](#tableforge)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Getting Started](#getting-started)
    - [What makes this different from a SQL client?](#what-makes-this-different-from-a-sql-client)
    - [The three database targets](#the-three-database-targets)
    - [A note on PostgreSQL custom types](#a-note-on-postgresql-custom-types)
  - [Specification](#specification)
  - [Core Modules](#core-modules)
    - [1. Connection Manager](#1-connection-manager)
    - [2. Table Grid View](#2-table-grid-view)
    - [3. Schema Editor](#3-schema-editor)
    - [4. Data Type Support](#4-data-type-support)
    - [5. Default Value Functions](#5-default-value-functions)
    - [6. Relationship Visualizer](#6-relationship-visualizer)

</details>

---

## Background

Tools like Airtable and Zoho Tables popularized something important: the idea that a spreadsheet grid is often the most natural way to read and edit structured data. Rows feel like records. Columns feel like fields. Sorting, filtering, and inline editing are intuitive to almost anyone.

The problem? These tools lock your data inside their own proprietary storage. The moment you need a real database one that other applications, backend services, or data pipelines can also connect to you're out of luck. You export a CSV and lose all your schema, constraints, and relationships.

Your task is to build **TableForge** a spreadsheet-like database management interface that connects directly to **SQLite**, **MySQL**, and **PostgreSQL**. It should feel as approachable as Airtable, but work on real, open databases that the user already owns. No data gets locked in. No proprietary formats. Just a better way to look at and edit tables you already have.

> **Already comfortable with SQL dialects, database drivers, and entity-relationship diagrams?** Jump straight to the [Specification](#specification). Otherwise, read on the concepts below will save you hours of confusion later.

---

## Getting Started

<details>

<summary>

### What makes this different from a SQL client?

</summary>

Tools like DBeaver, TablePlus, and pgAdmin are built for developers who are comfortable writing SQL. TableForge is not a SQL client. It is a *data interface* users should be able to browse, filter, add rows, edit cells, and manage schema without typing a single SQL statement. SQL happens under the hood; the user sees a grid.

</details>

<details>

<summary>

### The three database targets

</summary>

```
SQLite     → local file-based database (.db, .sqlite)
MySQL      → network-connected relational database (v8+)
PostgreSQL → network-connected relational database (v14+), richest type system
```

Each has its own driver, its own connection string format, and its own dialect quirks. Your application must handle all three.

</details>

<details>

<summary>

### A note on PostgreSQL custom types

</summary>

PostgreSQL supports data types that do not exist in SQLite or MySQL:

| Type       | Example                                     |
| ---------- | ------------------------------------------- |
| `uuid`     | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`      |
| `jsonb`    | `{"role": "admin", "active": true}`         |
| `array`    | `'{1,2,3}'::int[]`                          |
| `enum`     | `CREATE TYPE mood AS ENUM ('happy', 'sad')` |
| `inet`     | `192.168.1.1`                               |
| `tsvector` | full-text search vector                     |
| `range`    | `[2023-01-01, 2024-01-01)`                  |

Your interface must render these types correctly in the grid not as raw strings and must not corrupt them on write.

</details>

---

## Specification


| Area              | Requirement                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Connections       | Connect to SQLite (file path), MySQL, and PostgreSQL (host/port/credentials).            |
| Grid View         | Display any table as an editable spreadsheet grid with sorting and filtering.            |
| Inline Editing    | Edit cell values inline; commit on blur or `Enter`, cancel on `Escape`.                  |
| Schema Editor     | Add, rename, and delete columns; change data types via a UI panel.                       |
| Data Types        | Render and edit standard SQL types correctly (text, int, bool, date, etc.).              |

---

## Core Modules

</details>

<details>

<summary>

### 1. Connection Manager

</summary>

On launch, the user sees a connection screen. They must be able to:

- [ ] Select a database engine: `SQLite`, `MySQL`, or `PostgreSQL`.
- [ ] For **SQLite**: provide a file path or upload a `.db` / `.sqlite` file.
- [ ] For **MySQL / PostgreSQL**: enter host, port, database name, username, and password.
- [ ] Test the connection before saving it.
- [ ] Save named connections for quick re-access within the same session.
- [ ] See a sidebar listing all tables in the connected database, grouped by schema (for PostgreSQL).

Connection credentials must **never** be logged, stored in plaintext on disk, or exposed in client-side state beyond what is necessary for the active session.

</details>

<details>

<summary>

### 2. Table Grid View

</summary>

The grid is the heart of TableForge. It must behave like a spreadsheet:

- [ ] Each row is a database record. Each column is a field.
- [ ] Column headers show the column name, data type badge, and constraint icons:
  - `PK`- primary key
  - `FK`- foreign key (with tooltip showing the referenced table and column)
  - `U`- unique constraint
  - `NN`- not null
- [ ] Clicking a cell enters edit mode with an appropriate input widget for the type (see [§ Data Type Support](#4-data-type-support)).
- [ ] Rows can be sorted by any column (ascending / descending) without reloading the page.
- [ ] Rows can be filtered by one or more column conditions (e.g., `status = 'active'`, `created_at > '2024-01-01'`).
- [ ] Pagination controls at the bottom: configurable page size (25 / 50 / 100 / 250).
- [ ] Unsaved changes in a row are highlighted until committed or cancelled.

</details>

<details>

<summary>

### 3. Schema Editor

</summary>

Users must be able to modify the schema of any table through a UI panel no SQL required:

- [ ] **Add column** - specify name, type, nullable, default value, and constraints.
- [ ] **Rename column** - renames the column without data loss.
- [ ] **Change type** - warns the user of potential data loss before executing a `CAST`.
- [ ] **Delete column** - requires confirmation; blocked if referenced by a foreign key.
- [ ] **Add/remove constraints** - toggle NOT NULL, UNIQUE on existing columns.
- [ ] Schema changes are previewed as SQL DDL before execution:

```sql
-- Preview of changes
ALTER TABLE users
  ADD COLUMN last_login TIMESTAMPTZ DEFAULT NOW(),
  ALTER COLUMN email SET NOT NULL;
```

</details>

<details>

<summary>

### 4. Data Type Support

</summary>

The grid must render and edit each type with an appropriate widget:

| Type Family | Types                                                  | Input Widget                       |
| ----------- | ------------------------------------------------------ | ---------------------------------- |
| Text        | `TEXT`, `VARCHAR`, `CHAR`                              | Text input                         |
| Integer     | `INT`, `BIGINT`, `SMALLINT`                            | Number input (integer step)        |
| Decimal     | `FLOAT`, `DOUBLE`, `NUMERIC`, `DECIMAL`                | Number input (decimal step)        |
| Boolean     | `BOOLEAN`, `TINYINT(1)`                                | Toggle / checkbox                  |
| Date & Time | `DATE`, `TIME`, `DATETIME`, `TIMESTAMP`, `TIMESTAMPTZ` | Date/time picker                   |
| Binary      | `BLOB`, `BYTEA`                                        | Size label + download link         |
| JSON        | `JSON`, `JSONB` *(PG only)*                            | Collapsible JSON tree + raw editor |
| UUID        | `UUID` *(PG only)*                                     | Text input with format validation  |
| Array       | `INT[]`, `TEXT[]`, etc. *(PG only)*                    | Tag/chip editor                    |
| Enum        | Custom `ENUM` type *(PG only)*                         | Dropdown of allowed values         |
| Network     | `INET`, `CIDR`, `MACADDR` *(PG only)*                  | Text input with format validation  |
| Full-text   | `TSVECTOR` *(PG only)*                                 | Read-only display (computed field) |
| Range       | `INT4RANGE`, `TSRANGE`, etc. *(PG only)*               | Two-input range widget             |
| NULL        | Any nullable column                                    | Explicit `NULL` pill; clearable    |

> [!IMPORTANT]
> A `JSONB` or `ARRAY` column must never be saved back to the database as a plain string. Your application is responsible for serializing the widget's output into the correct wire format for the driver.

</details>

<details>

<summary>

### 5. Default Value Functions

</summary>

When adding or editing a column's default value, users must be able to:

- [ ] Choose from a **preset function menu** appropriate to the column's type:

  | Preset                  | Expression                    | Available For                      |
  | ----------------------- | ----------------------------- | ---------------------------------- |
  | Current timestamp       | `NOW()` / `CURRENT_TIMESTAMP` | `TIMESTAMP`, `TIMESTAMPTZ`, `DATE` |
  | Random UUID             | `gen_random_uuid()`           | `UUID` *(PG only)*                 |
  | Current user            | `CURRENT_USER`                | `TEXT`, `VARCHAR`                  |
  | Auto-increment sequence | `nextval('seq')`              | `INT`, `BIGINT`                    |
  | Empty array             | `'{}'`                        | Array types                        |
  | Empty JSON object       | `'{}'::jsonb`                 | `JSONB`                            |

- [ ] Enter a **custom SQL expression** directly, with syntax highlighting.
- [ ] See a **live preview** of what the expression evaluates to at the time of editing (by executing `SELECT <expr>` against the live connection).
- [ ] Default expressions are stored as `DEFAULT <expr>` in the column definition not hardcoded literal values.

</details>

<details>

<summary>

### 6. Relationship Visualizer

</summary>

Accessible from a **"Relations"** tab or panel, this view renders all tables in the current database as an entity-relationship diagram:

- [ ] Each table is a node showing its name and column list.
- [ ] Each foreign key is a directed edge from the child column to the parent column, labelled with the constraint name.
- [ ] Nodes are draggable so users can arrange the layout.
- [ ] Clicking a table node highlights all its relationships and dims the rest.
- [ ] Clicking a relationship edge opens a tooltip showing:
  - Child table and column
  - Parent (referenced) table and column
  - `ON DELETE` and `ON UPDATE` actions
- [ ] Primary key columns are marked with 🔑. Columns with UNIQUE constraints are marked with `◈`.
- [ ] The diagram can be exported as a PNG or SVG.

</details>

---

<sub>Watch The Code 2026</sub>
