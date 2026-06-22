# Codebase Explainer Backend API

This is the backend API foundation for the Codebase Explainer project. It provides a clean structure for future AI explanation integration while offering a rule-based engine for now.

## Installation

```bash
cd backend
npm install
```

## Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### 1. Health Check
\`GET /api/health\`
Returns the health status of the API.

### 2. Explain Code
\`POST /api/explain\`

**Request Body Example:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "JavaScript"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "mode": "javascript",
  "explanation": "This JavaScript code executes simple functional logic.",
  "patterns": ["Functions"]
}
```
