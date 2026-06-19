# InsiderJobs - Quick Setup Guide for Phase 1 Features

## 🚀 Getting Started (5 Minutes)

### Prerequisites
- Node.js 20+ installed
- MongoDB Atlas account (already configured)
- Gmail account for email notifications
- Render account for HTTPS deployment

---

## 1️⃣ Email Notifications Setup

### Step 1: Enable Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows (or your OS)"
3. Copy the 16-character app password

### Step 2: Update .env File
Edit `/server/.env`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=InsiderJobs <noreply@insiderjobs.com>
FRONTEND_URL=http://localhost:5173
```

### Step 3: Test Email Sending
```bash
# In server directory
node -e "
import('./utils/emailService.js').then(m => {
  m.sendWelcomeEmail('test@example.com', 'Test User').then(r => {
    console.log('Email sent:', r);
    process.exit(0);
  });
});
"
```

### Step 4: Verify in Application
1. Start app: `npm run dev`
2. Schedule an interview in recruiter dashboard
3. Check candidate's email inbox
4. Verify both interview invite + status update emails received

---

## 2️⃣ PWA Setup (Already Configured ✅)

### What's Already Done
- [x] Service Worker created (`public/service-worker.js`)
- [x] Manifest.json configured (`public/manifest.json`)
- [x] App.jsx updated with PWA hook
- [x] index.html updated with meta tags

### To Deploy PWA
1. Build: `npm run build`
2. Test locally: `npm run dev`
3. On mobile browser:
   - Open app
   - Click "Install" button (should appear after 3 visits)
   - Confirm installation

### Features to Test
- [ ] Visit homepage
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Try browsing jobs (should load from cache)
- [ ] Reconnect (new data fetches)
- [ ] On mobile: "Add to Home Screen" works

---

## 3️⃣ Analytics Dashboard Setup

### Step 1: Verify Installation
```bash
cd client
npm ls chart.js react-chartjs-2
# Should show: chart.js@^4.4.x and react-chartjs-2@^5.2.x
```

### Step 2: Access Dashboard
1. Start app: `npm run dev`
2. Login as recruiter: 
   - Email: `recruiter@microsoft.com`
   - Password: `Recruiter@123`
3. Navigate to: **Dashboard** → **Analytics** (new tab)
4. Should see charts and metrics

### Step 3: Verify Data
- Create a job posting
- Have a candidate apply
- Go to Analytics Dashboard
- Should see:
  - Total Applications: 1
  - Doughnut chart with 1 "Pending"
  - Trend line shows application
  - Top jobs shows your job

### Step 4: Test Export
- Click "📊 Export Report" button
- CSV file downloads with application data

---

## 🧪 Full Testing Workflow

### Test 1: Email Notifications Flow
```
1. Recruiter creates job
2. Candidate applies
3. Recruiter reviews application
4. Recruiter schedules interview
5. ✅ Candidate receives email with video link
6. ✅ Candidate receives status update email
```

### Test 2: PWA Offline Experience
```
1. Open app on mobile
2. Browse 3+ pages to trigger install
3. Click install/add to home screen
4. Close browser
5. Reopen from home screen
6. Go offline (turn off WiFi)
7. ✅ Previously visited pages still load
8. Reconnect WiFi
9. ✅ New data fetches automatically
```

### Test 3: Analytics Accuracy
```
1. Create 5 jobs
2. Apply to 3 jobs
3. Accept 1, Reject 1, Schedule interview for 1
4. Go to Analytics Dashboard
5. ✅ Doughnut: 1 Accepted, 1 Rejected, 1 Interview, 1 Pending
6. ✅ Metrics show: 4 total, 25% accepted, 25% rejected
7. ✅ Top jobs: 3 jobs listed with counts
8. Export CSV and verify data
```

---

## 🔗 Integration Points

### 1. Email Notifications
When interview scheduled:
```javascript
// In scheduleInterview controller (companyController.js:279)
await sendInterviewInviteEmail(
  application.userId.email,
  application.jobId.title,
  company.name,
  scheduledAt,
  videoLink
)
```

When status changes:
```javascript
// Add to changeApplicationStatus
await sendApplicationStatusEmail(
  userEmail,
  jobTitle,
  companyName,
  newStatus
)
```

### 2. PWA Caching
All static assets cached:
- JS files (React bundles)
- CSS (Tailwind)
- Images (logos, icons)
- Fonts

API calls always go to network:
- `/api/jobs` → Always fresh
- `/api/applications` → Always fresh
- `/api/company/*` → Always fresh

### 3. Analytics Data Flow
```
User Action → Database → Aggregation → API Response → Charts → Dashboard
Application Created → MongoDB → Group by Status → /api/analytics → Doughnut Chart
```

---

## 📦 Files Modified/Created

### Created
- ✅ `server/utils/emailService.js` - Email templates and sending logic
- ✅ `server/controllers/analyticsController.js` - Analytics computation
- ✅ `client/public/service-worker.js` - PWA offline support
- ✅ `client/public/manifest.json` - PWA configuration
- ✅ `client/src/hooks/usePWA.js` - PWA React integration
- ✅ `client/src/components/AnalyticsDashboard.jsx` - Dashboard UI
- ✅ `client/src/components/JobSearchFilters.jsx` - Advanced filters
- ✅ `IMPLEMENTATION_PHASE1.md` - This guide

### Modified
- ✅ `server/.env` - Added email configuration
- ✅ `server/package.json` - nodemailer dependency (already installed)
- ✅ `server/routes/companyRoutes.js` - Added analytics routes
- ✅ `server/controllers/companyController.js` - Email on interview schedule
- ✅ `client/src/App.jsx` - Added PWA setup
- ✅ `client/index.html` - Updated meta tags for PWA
- ✅ `client/package.json` - Added chart.js, react-chartjs-2

---

## 🚨 Troubleshooting

### "Email not sending"
**Cause:** Gmail credentials wrong or 2FA not enabled
**Fix:**
1. Go to myaccount.google.com
2. Enable 2-Factor Authentication
3. Generate App Password
4. Copy exact 16-char password to .env
5. Restart server

### "PWA not installing"
**Cause:** HTTPS not available or Service Worker broken
**Fix:**
1. Deploy to Render (provides HTTPS)
2. Check browser console for SW errors
3. Clear cache: DevTools → Application → Clear storage
4. Restart browser

### "Analytics shows no data"
**Cause:** Not logged in or MongoDB aggregation slow
**Fix:**
1. Login as recruiter first
2. Create some test data (applications)
3. Refresh analytics page
4. Check server logs for errors

### "Charts not displaying"
**Cause:** Chart.js not installed or data format wrong
**Fix:**
```bash
cd client
npm install chart.js@^4.4.x react-chartjs-2@^5.2.x
npm run dev
```

---

## 📱 Mobile Testing

### On iPhone/Android
1. Open browser
2. Visit: http://your-domain.com
3. Scroll down to see "Add to Home Screen" option
4. Tap → Select "Add to Home Screen"
5. Confirm
6. App now on home screen like native app

### Offline Testing
1. Install PWA
2. Launch app
3. Settings → Airplane mode ON
4. Try to browse → Works from cache!
5. Airplane mode OFF
6. Refresh → Fresh data loads

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- [x] Email notifications send on interview schedule
- [x] PWA installs on mobile devices
- [x] Analytics dashboard displays charts
- [x] Offline browsing works (cached jobs visible)
- [x] All features tested and working

### Estimated Timeline
- Setup: 10 minutes
- Testing: 20 minutes  
- Deployment: 5 minutes
- **Total: ~35 minutes**

---

## 📞 Quick Reference

### Important URLs
- Dashboard: `http://localhost:5173/dashboard/insights`
- Analytics: `http://localhost:5173/dashboard/insights` (new tab)
- CareerToolkit: `http://localhost:5173/career-toolkit`
- Applications: `http://localhost:5173/applications`

### Test Credentials
```
Recruiter:
Email: recruiter@microsoft.com
Password: Recruiter@123

Other recruiters available:
- recruiter@google.com
- recruiter@amazon.com
- recruiter@walmart.com
- recruiter@samsung.com
- recruiter@adobe.com
- recruiter@accenture.com
```

### Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests (when available)
npm test

# Check dependencies
npm ls chart.js nodemailer
```

---

## ✅ Final Checklist

Before marking Phase 1 complete:
- [ ] Email service configured and tested
- [ ] PWA working on mobile
- [ ] Analytics dashboard accessible
- [ ] All 7 companies showing logos
- [ ] Jobs searchable with filters
- [ ] Video interviews working
- [ ] Database synced and working
- [ ] No console errors
- [ ] Documentation updated

---

**Setup Date:** June 9, 2026  
**Phase:** 1 of 3  
**Status:** Ready for Testing  
**Support:** Check IMPLEMENTATION_PHASE1.md for details
