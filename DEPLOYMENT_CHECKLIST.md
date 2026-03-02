# 📋 Deployment Checklist & Quick Start

## Pre-Deployment Setup (15 minutes)

### Step 1: Supabase Setup (3 min)

- [ ] Open https://app.supabase.com
- [ ] Select project: `murxwhdbvrjsyqejiadd`
- [ ] Go to SQL Editor → New Query
- [ ] Copy entire SQL from `SQL_SCHEMA.sql` OR `SQL_QUICK_REFERENCE.md`
- [ ] Click "Run"
- [ ] Verify: Go to Tables, you should see 5 tables

### Step 2: Get API Keys (3 min)

**Supabase Keys:**
- [ ] Settings → API → Copy URL: `https://murxwhdbvrjsyqejiadd.supabase.co`
- [ ] Settings → API → Copy Publishable Key: `sb_publishable_...`
- [ ] Settings → API → Copy Service Role Key (bottom of page)

**OpenAI Key:**
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Click "Create new secret key"
- [ ] Copy the key (save it, you won't see it again!)

### Step 3: Environment Variables (2 min)

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://murxwhdbvrjsyqejiadd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_S-3iBBZIrdR8-aJIA2Pnyw_g1vh1g_H
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_key_here
JWT_SECRET=your_super_secret_key_change_in_production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Install & Run (4 min)

```bash
cd /home/sbragul/Questionnaire_Engine
npm install
npm run dev
```

Open http://localhost:3000 ✅

---

## Testing Workflow (10 minutes)

### 1. Sign Up (1 min)
- [ ] Go to http://localhost:3000/signup
- [ ] Email: `test@example.com`
- [ ] Password: `test123456`
- [ ] Click Sign Up
- [ ] Should redirect to dashboard

### 2. Upload Questionnaire (2 min)
- [ ] Click "📝 Questionnaire" tab
- [ ] Click file input
- [ ] Select: `public/sample-docs/questionnaire.txt`
- [ ] Should appear in table below

### 3. Upload Reference Docs (3 min)
- [ ] Click "📚 Reference Documents" tab
- [ ] Upload these files one by one:
  - [ ] `public/sample-docs/security-policy.txt`
  - [ ] `public/sample-docs/infrastructure-policy.txt`
  - [ ] `public/sample-docs/compliance-policy.txt`
- [ ] All should appear in the table

### 4. Generate Answers (2 min)
- [ ] Click back to "📝 Questionnaire"
- [ ] Click "Generate Answers" button
- [ ] Wait for processing (30-60 seconds)
- [ ] Should show coverage summary with results

### 5. Review Results (2 min)
- [ ] Look at generated answers
- [ ] Check confidence badges (High/Medium/Low)
- [ ] Check citations showing document names
- [ ] Try editing one answer
- [ ] Click "Save Edits"

### 6. Export (1 min)
- [ ] Click "Export as PDF"
- [ ] PDF should download
- [ ] Or click "Export as DOCX"
- [ ] DOCX should download

---

## Production Deployment (Vercel)

### Step 1: Prepare Repository
```bash
cd /home/sbragul/Questionnaire_Engine
git init
git add .
git commit -m "Initial commit: Questionnaire AI"
```

### Step 2: Push to GitHub
```bash
git remote add origin https://github.com/your-username/questionnaire-ai.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Click "Import Project"
- [ ] Select your GitHub repository
- [ ] Framework: Next.js
- [ ] Environment Variables: Add all from `.env.local`
- [ ] Click "Deploy"
- [ ] Wait 5 minutes for deployment

### Step 4: Update Production URL
- [ ] Get Vercel deployment URL
- [ ] Update in `.env.local`: `NEXT_PUBLIC_APP_URL=your_vercel_url`
- [ ] Redeploy

---

## Performance Optimization

### Database Optimization
- [ ] Verify indexes created (run: `SELECT * FROM pg_indexes;`)
- [ ] Enable RLS for security
- [ ] Monitor slow queries in Supabase dashboard

### Frontend Optimization
- [ ] Enable caching headers
- [ ] Minimize bundle size
- [ ] Use CDN for static assets

### API Optimization
- [ ] Add rate limiting
- [ ] Cache OpenAI responses (optional)
- [ ] Monitor API usage

---

## Security Checklist

### Before Production
- [ ] Change JWT_SECRET to strong random value
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Rotate API keys regularly
- [ ] Use HTTPS only
- [ ] Set CORS headers properly
- [ ] Add rate limiting
- [ ] Implement request validation

### After Deployment
- [ ] Enable firewall rules
- [ ] Set up SSL certificate
- [ ] Monitor for suspicious activity
- [ ] Regular backups enabled
- [ ] Update dependencies regularly

---

## Monitoring & Maintenance

### Daily
- [ ] Check Supabase dashboard for errors
- [ ] Monitor OpenAI API usage
- [ ] Review error logs

### Weekly
- [ ] Check failed uploads/generations
- [ ] Update dependencies
- [ ] Review user feedback

### Monthly
- [ ] Security audit
- [ ] Database optimization
- [ ] Performance review

---

## Troubleshooting Common Issues

### "Database connection failed"
```
✓ Check Supabase URL in .env.local
✓ Verify API key is correct
✓ Check network connectivity
✓ Restart development server
```

### "OpenAI API error"
```
✓ Verify API key is set correctly
✓ Check API key has sufficient balance
✓ Monitor rate limits
✓ Check OpenAI service status
```

### "File upload error"
```
✓ Check file size < 10MB
✓ Verify file format (PDF/DOCX/TXT)
✓ Check server storage space
✓ Review browser console for errors
```

### "Answer generation hanging"
```
✓ Check internet connection
✓ Verify OpenAI API key
✓ Check questionnaire has questions
✓ Ensure reference docs are uploaded
✓ Try with smaller questionnaire first
```

### "RLS policy errors"
```
✓ Disable RLS in development
✓ Check user authentication
✓ Verify token is valid
✓ Check policy conditions
```

---

## Feature Testing Checklist

### Authentication
- [ ] Sign up creates user account
- [ ] Login generates JWT token
- [ ] Token stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Logout clears token

### Document Upload
- [ ] PDF files parse correctly
- [ ] DOCX files parse correctly
- [ ] TXT files parse correctly
- [ ] Large files handled
- [ ] Duplicate uploads handled

### Answer Generation
- [ ] Questions extracted correctly
- [ ] Relevant documents searched
- [ ] OpenAI generates answers
- [ ] Citations include document names
- [ ] Confidence scores calculated

### Editing & Export
- [ ] Answers can be edited
- [ ] Edits saved to database
- [ ] Edit history tracked
- [ ] PDF export works
- [ ] DOCX export works
- [ ] Exported format looks good

### User Experience
- [ ] Dashboard loads quickly
- [ ] Loading indicators show
- [ ] Error messages clear
- [ ] Success messages display
- [ ] Mobile responsive

---

## Database Maintenance

### Backup
```bash
# Supabase auto-backs up to multiple regions
# Manual backup:
pg_dump -h murxwhdbvrjsyqejiadd.supabase.co ...
```

### Restore
```bash
psql -h murxwhdbvrjsyqejiadd.supabase.co < backup.sql
```

### Clean Up (Optional)
```sql
-- Delete old edit history (optional)
DELETE FROM answer_edit_history 
WHERE updated_at < NOW() - INTERVAL '90 days';

-- Optimize tables (optional)
VACUUM ANALYZE;
```

---

## Performance Metrics to Monitor

- [ ] Page load time < 3 seconds
- [ ] API response time < 2 seconds
- [ ] PDF generation < 5 seconds
- [ ] DOCX generation < 5 seconds
- [ ] Database query time < 500ms
- [ ] Uptime > 99.9%

---

## Next Steps After Deployment

1. **Promote**: Share with team/users
2. **Gather Feedback**: Collect user feedback
3. **Iterate**: Add requested features
4. **Monitor**: Watch performance metrics
5. **Scale**: Add caching/optimization as needed
6. **Secure**: Regular security audits

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm run start           # Start production server

# Maintenance
npm install             # Install dependencies
npm update              # Update dependencies
npm audit              # Check for vulnerabilities
npm run lint           # Lint code

# Database
# Run in Supabase SQL Editor:
SELECT * FROM users;   # View users
SELECT * FROM questionnaires; # View questionnaires
```

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Project README**: See `README.md`
- **Setup Guide**: See `SETUP_GUIDE.md`

---

## ✅ Final Checklist

- [ ] SQL schema created in Supabase
- [ ] All environment variables set
- [ ] npm install completed
- [ ] Development server running
- [ ] Can sign up and log in
- [ ] Can upload files
- [ ] Can generate answers
- [ ] Can export documents
- [ ] No errors in console
- [ ] Ready for testing!

---

**Status**: ✅ Ready to Deploy!

You now have a fully functional Questionnaire AI application. 

**Time to first test**: ~15 minutes  
**Time to production**: ~30 minutes (with Vercel)

Good luck! 🚀
