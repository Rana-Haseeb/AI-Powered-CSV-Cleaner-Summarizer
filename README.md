# AI Data Dashboard — CSV Analyzer

A full-stack web application that lets you upload a CSV dataset and receive an instant, AI-generated markdown analysis powered by **Google Gemini**. Results are persisted to **MongoDB Atlas** and displayed in a clean, modern React dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Features](#features)
- [How It Works](#how-it-works)

---

## Overview

Upload any `.csv` file through the drag-and-drop interface. The backend reads the file, constructs a prompt, and sends the raw data to the **Gemini Flash** model. Gemini returns a detailed markdown report covering key trends, anomalies, and strategic recommendations. The report is saved to MongoDB and rendered beautifully in the browser — including formatted tables and bold text.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB Atlas + Mongoose** | Cloud database & ODM |
| **Multer** | CSV file upload handling |
| **Axios** | HTTP client for Gemini API calls |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request support |
| **Nodemon** | Dev server auto-restart |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + Vite** | UI framework & dev toolchain |
| **Tailwind CSS v3** | Utility-first styling |
| **react-dropzone** | Drag-and-drop file input |
| **react-markdown + remark-gfm** | Render Gemini's markdown response with tables |
| **lucide-react** | Icon library |
| **Axios** | API requests to the backend |
| **@tailwindcss/typography** | Beautiful `prose` styling for markdown output |

### AI
| Service | Model |
|---|---|
| **Google Gemini API** | `gemini-flash-latest` |

---

## Project Structure

```
CSV file cleaner/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection
│   ├── controllers/
│   │   └── aiController.js       # Upload handler, Gemini call, DB save
│   ├── models/
│   │   └── Report.js             # Mongoose schema for saved reports
│   ├── routes/
│   │   └── aiRoutes.js           # POST /api/analyze with Multer middleware
│   ├── uploads/                  # Temporary file storage (auto-cleaned)
│   ├── .env                      # Environment variables (not committed)
│   ├── server.js                 # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main dashboard UI (all components)
│   │   ├── main.jsx              # React root mount
│   │   └── index.css             # Tailwind directives
│   ├── tailwind.config.js        # Tailwind + typography plugin config
│   ├── postcss.config.js         # PostCSS config
│   ├── vite.config.js            # Vite config (dev port: 3000)
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- A **MongoDB Atlas** account with a cluster
- A **Google Gemini API key** from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create and populate your .env file (see Environment Variables below)

# 4. Start the development server
npm run dev
```

The backend will start on **http://localhost:5000**.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will start on **http://localhost:3000**.

---

## Environment Variables

Create a `.env` file inside the `backend/` directory with the following keys:

```env
PORT=5000
MONGO_URI="your_mongodb_atlas_connection_string"
GEMINI_API_KEY="your_gemini_api_key"
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: `5000`) |
| `MONGO_URI` | Full MongoDB Atlas connection string including DB name |
| `GEMINI_API_KEY` | API key from Google AI Studio |

> ⚠️ **Never commit `.env` to version control.** Add `backend/.env` to your `.gitignore`.

---

## API Reference

### `POST /api/analyze`

Accepts a CSV file upload, sends it to Gemini for analysis, saves the result to MongoDB, and returns the full report.

**Request**

- Content-Type: `multipart/form-data`
- Field name: `file` (`.csv` file)

**Success Response — `200 OK`**

```json
{
  "success": true,
  "report": {
    "_id": "...",
    "filename": "sales_data.csv",
    "rawData": "Date,Product,Price,Quantity\n...",
    "aiSummary": "## Executive Summary\n...",
    "createdAt": "2026-05-29T16:41:23.122Z",
    "__v": 0
  }
}
```

**Error Responses**

| Status | Cause |
|---|---|
| `400` | No file attached to the request |
| `500` | Gemini API failure or database error |

---

## Features

- **Drag & Drop Upload** — Drop any `.csv` file directly onto the upload zone, or click to browse. Displays filename and file size on selection.
- **AI-Powered Analysis** — The raw CSV is passed to Gemini with a structured prompt requesting a markdown breakdown of trends, anomalies, and insights.
- **Persistent Reports** — Every analysis is saved to MongoDB Atlas with filename, raw data, AI summary, and timestamp.
- **Markdown Rendering** — Gemini's response renders fully: headings, **bold text**, bullet lists, and data tables all display correctly via `react-markdown` + `remark-gfm`.
- **Loading State** — An animated spinner with "Analyzing dataset with Gemini…" message displays while the request is in flight.
- **Error Handling** — Network and API errors surface inline without crashing the UI.
- **Reset Flow** — An "Analyze a new file" button clears state and returns to the upload screen.
- **Responsive Design** — Works cleanly on mobile, tablet, and desktop screens.

---

## How It Works

```
User drops CSV
      │
      ▼
React (App.jsx)
  └─ axios POST /api/analyze  (multipart/form-data)
            │
            ▼
      Express Server
        └─ Multer saves file to uploads/
            │
            ▼
      aiController.js
        ├─ fs.readFileSync → rawData string
        ├─ Build Gemini prompt
        ├─ axios POST → Gemini Flash API
        ├─ Extract aiSummary from response
        ├─ Report.create() → MongoDB Atlas
        └─ fs.unlinkSync → temp file deleted
            │
            ▼
      { success: true, report: { ... } }
            │
            ▼
React renders report.aiSummary
  └─ <ReactMarkdown> with remark-gfm
     → Tables, headings, bold text all formatted
```
