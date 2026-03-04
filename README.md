## Features Implemented

### User Authentication & Access Control
- Secure user signup and login system
- Password hashing using `bcryptjs`
- JWT-based authentication for protected routes
- Session-based access to user-specific data

---

### Persistent Data Storage
- PostgreSQL database (Supabase)
- UUID-based primary keys
- Structured storage for:
  - Users
  - Uploaded questionnaires
  - Reference documents
  - Generated answers
  - Citations
  - Confidence scores
- Persistent versioned answer storage

---

### Questionnaire Upload & Parsing
- Upload support for structured questionnaire documents
- Automatic parsing of uploaded documents into individual questions
- Maintains original order and structure
- Stores parsed questions in database for processing and regeneration

---

### Reference Document Management
- Upload and store multiple reference documents
- Supports:
  - PDF (`pdf-parse`)
  - DOCX (`mammoth`)
  - TXT files
- Extracts and indexes text for AI retrieval
- Acts as the “source of truth” for answer generation

---

### AI-Powered Answer Generation (RAG Workflow)
- Retrieval-Augmented Generation pipeline
- Retrieves relevant content from uploaded reference documents
- Generates grounded answers using:
  - OpenAI (GPT family)
  - Google Gemini
- If no supporting evidence is found:
  - Returns: **“Not found in references.”**
- Ensures every answer is tied to reference material

---

### Citations & Grounded Outputs
- Each generated answer includes at least one citation
- Citations reference the specific source document
- Optional evidence snippets displayed for transparency
- Prevents unsupported or hallucinated responses

---

### Confidence Scoring
- Each answer includes a confidence score
- Confidence derived from:
  - Retrieval quality
  - Citation strength
  - Context match relevance
- Helps users evaluate answer reliability

---

### Structured Export System
- Generates downloadable output document
- Preserves:
  - Original questionnaire structure
  - Question order
  - Formatting hierarchy
- Inserts:
  - Generated answers
  - Citations
  - Confidence scores
- Supports document export (PDF / DOCX)

---

### Dashboard & Analytics
- User dashboard showing:
  - Total questionnaires
  - Questions answered
  - Citation coverage
  - Confidence distribution
- Coverage summary:
  - Total questions
  - Questions with citations
  - Questions marked “Not found in references”

---

###  Chat Interface
- AI-powered chat interface
- Allows contextual Q&A against stored reference documents
- Enables ad-hoc validation beyond structured questionnaire mode

---

## 🔐 End-to-End Workflow

1. User signs up / logs in  
2. Uploads questionnaire  
3. Uploads reference documents  
4. AI retrieves relevant context  
5. Answers generated with citations  
6. User reviews & edits  
7. Structured document exported  
8. Data stored persistently  

Fully functional, end-to-end, grounded AI workflow.

<img width="673" height="638" alt="_- visual selection (11)" src="https://github.com/user-attachments/assets/a8e83d72-69f4-4c88-9f28-91efa89f365b" />

## 🛠 Tech Stack

### Frontend
- React 18  
- Next.js 14 (App Router, Pages Router, Global CSS)

### Backend
- Next.js API Routes (Node.js runtime)

### Database
- Supabase (PostgreSQL)  
- UUID primary keys  
- JSONB fields

### Authentication
- JWT (`jsonwebtoken`) for token-based authentication  
- `bcryptjs` for password hashing

### LLM / AI
- OpenAI (GPT family)  
- Google Gemini (`@google/generative-ai`)  
- Retrieval-Augmented Generation (RAG) utilities

### File Parsing
- `pdf-parse` (PDF parsing)  
- `mammoth` (DOCX parsing)  
- Plain TXT parsing

### Document Export
- `pdfkit` (PDF generation)  
- `docx` (DOCX generation)

### HTTP / Utilities
- `axios`  
- `dotenv`
