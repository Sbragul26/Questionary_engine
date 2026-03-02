# Questionnaire AI - Auto-Answer System

An intelligent web application that automatically answers questionnaires using company reference documents with AI-powered insights.

## 🎯 Features

- **User Authentication**: Secure sign-up and login system with JWT tokens
- **Document Upload**: Upload questionnaires and reference documents (PDF, DOCX, TXT)
- **AI-Powered Answers**: Automatic question answering using OpenAI's GPT models
- **RAG System**: Retrieval Augmented Generation for contextual answers
- **Citations**: Every answer includes source citations from reference documents
- **Confidence Scoring**: Answers rated as High, Medium, or Low confidence
- **Coverage Summary**: Overview of answered vs. unanswered questions
- **Edit & Review**: Manually review and edit AI-generated answers
- **Export**: Download completed questionnaires as PDF or DOCX
- **Edit History**: Track all changes to answers

## 🏢 Sample Company: CloudTrack

**Industry**: SaaS (Cloud Software)

**Description**: CloudTrack is a SaaS company that provides project management software for small businesses. It stores customer data in the cloud and follows strict security practices.

**Key Features**:
- Data encrypted with AES-256
- Multi-factor authentication (MFA) required for all employees
- Role-based access control (RBAC)
- Hosted on AWS (Mumbai & N. Virginia regions)
- Daily automated backups with 90-day retention
- Annual third-party security audits
- Quarterly employee security training
- GDPR & CCPA compliant

## 📋 Sample Questionnaire

The system comes with a 15-question security questionnaire covering:
- Data Protection (encryption, standards)
- Access Control (RBAC, audit logs)
- Backup & Disaster Recovery (RTO/RPO)
- Security Practices (audits, training)
- Compliance (GDPR, certifications)

## 📁 Project Structure

```
questionnaire-ai/
├── app/
│   ├── page.jsx              # Home page
│   ├── layout.jsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── login/page.jsx        # Login page
│   ├── signup/page.jsx       # Sign-up page
│   ├── dashboard/page.jsx    # Main dashboard
│   ├── results/page.jsx      # Results & editing page
│   └── api/
│       ├── auth/
│       │   ├── login/route.js
│       │   └── signup/route.js
│       ├── upload-questionnaire/route.js
│       ├── upload-reference/route.js
│       ├── generate/route.js
│       ├── save-edits/route.js
│       └── export/route.js
├── lib/
│   ├── supabase.js           # Supabase client
│   ├── openai.js             # OpenAI integration
│   ├── rag.js                # RAG pipeline
│   ├── parsing.js            # Document parsing
│   └── auth.js               # Auth utilities
├── public/
│   └── sample-docs/
│       ├── company-profile.txt
│       ├── security-policy.txt
│       ├── infrastructure-policy.txt
│       ├── compliance-policy.txt
│       └── questionnaire.txt
├── package.json
├── next.config.js
└── .env.local
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   cd /home/sbragul/Questionnaire_Engine
   npm install
   ```

2. **Set up environment variables**

   Create/update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://murxwhdbvrjsyqejiadd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_S-3iBBZIrdR8-aJIA2Pnyw_g1vh1g_H
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Setup Supabase Database**

   See SQL schema section below. Run all SQL commands in your Supabase SQL editor.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📊 Database Schema

The application uses Supabase PostgreSQL with the following tables:

### users
- Stores user accounts with email and password hash
- JWT tokens are generated on login

### questionnaires
- Stores uploaded questionnaire files
- Includes file content for question extraction

### reference_documents
- Stores company reference documents
- Used for RAG-based answer generation

### generated_answers
- Stores AI-generated answers with citations
- Includes confidence scores and coverage data

### answer_edit_history
- Tracks all edits made to answers
- Maintains version history

See `SQL_SCHEMA.sql` for complete schema definition.

## 🔄 How It Works

### 1. User Authentication
- User signs up with email/password
- Password is hashed with bcryptjs
- JWT token issued on login
- Token required for all subsequent API calls

### 2. Document Upload
- User uploads questionnaire and reference documents
- Files are parsed (PDF/DOCX/TXT) into plain text
- Content stored in Supabase

### 3. Question Extraction
- Questions extracted from uploaded questionnaire
- Handles multiple formats: numbered, bulleted, or direct questions

### 4. RAG Pipeline
- For each question:
  1. Search reference documents for relevant chunks
  2. Calculate similarity scores
  3. Retrieve top 3 most relevant chunks
  4. Send to OpenAI with context

### 5. Answer Generation
- OpenAI generates answer based on question + relevant chunks
- If no relevant chunks found: "Not found in references."
- Confidence score calculated (High/Medium/Low)

### 6. Review & Edit
- User reviews AI-generated answers
- Can manually edit answers
- Changes saved to database with history

### 7. Export
- User can export as PDF or DOCX
- Original question structure preserved
- Answers and citations included
- Formatted for professional presentation

## 🎛️ Nice-to-Have Features Implemented

### Feature 1: Confidence Scoring ⭐
Every answer includes a confidence level:
- **High**: 3+ relevant chunks with >80% similarity
- **Medium**: 2+ chunks with >60% similarity
- **Low**: 1 chunk or <60% similarity

Visual badges show confidence level with color coding.

### Feature 2: Coverage Summary ⭐
Dashboard shows at a glance:
- Total questions in questionnaire
- Questions answered with citation
- Questions not found in references

Helps identify gaps in reference documentation.

## 🔐 Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens for API authentication
- Environment variables for sensitive keys
- Row-level security can be enabled in Supabase
- HTTPS required in production

## 📦 Dependencies

- **next**: React framework
- **@supabase/supabase-js**: Database client
- **openai**: OpenAI API client
- **pdf-parse**: PDF parsing
- **mammoth**: DOCX parsing
- **jsonwebtoken**: JWT handling
- **bcryptjs**: Password hashing
- **pdfkit**: PDF generation
- **docx**: DOCX generation

## 🧪 Testing

Test with sample company data:

1. Sign up with test email
2. Upload `questionnaire.txt`
3. Upload `security-policy.txt`, `infrastructure-policy.txt`, `compliance-policy.txt`
4. Generate answers
5. Review coverage summary
6. Export as PDF/DOCX

## 🐛 Troubleshooting

### "No reference documents found"
- Ensure reference documents are uploaded before generating answers
- Try uploading sample documents from `public/sample-docs/`

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI account balance
- Ensure API key has sufficient permissions

### "Invalid token"
- Clear browser local storage
- Log out and log back in
- Check JWT_SECRET environment variable

## 📝 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create new user |
| POST | `/api/auth/login` | No | User login |
| POST | `/api/upload-questionnaire` | JWT | Upload questionnaire |
| POST | `/api/upload-reference` | JWT | Upload reference doc |
| POST | `/api/generate` | JWT | Generate answers |
| POST | `/api/save-edits` | JWT | Save edited answers |
| POST | `/api/export` | JWT | Export as PDF/DOCX |

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ for automating questionnaire responses
