# 🚀 JobPortal — Full-Stack Job Portal Platform

A modern, full-featured job portal built with the **MERN stack** (MongoDB, Express, React, Node.js). It connects job seekers with recruiters through a sleek, responsive UI — featuring advanced search & filters, recruiter dashboards, application tracking, career tools, email notifications, and analytics.

---

## ✨ Features

### 👤 Job Seekers (Candidates)
- **Browse & Search Jobs** — Explore job listings with a rich, paginated UI (12 jobs per page)
- **Advanced Filters** — Filter by title, location, remote, salary range, category, experience level, company, and posting date
- **Apply to Jobs** — Submit applications with resume upload directly from the job detail page
- **Application Tracking** — View all applied jobs and their current status (Pending, Accepted, Rejected)
- **Career Toolkit** — Access resume tips, interview prep resources, and career development tools
- **User Authentication** — Secure sign-in/sign-up via [Clerk](https://clerk.com/) (supports OAuth, email/password)
- **Email Notifications** — Receive email updates on application status changes and interview invitations

### 🏢 Recruiters (Companies)
- **Recruiter Authentication** — Dedicated recruiter login/sign-up with company logo upload
- **Dashboard** — Full-featured recruiter dashboard with sidebar navigation
- **Post Jobs** — Create new job listings with rich text descriptions (Quill editor), salary, category, level, and location
- **Manage Jobs** — View, toggle visibility, and manage all posted jobs
- **View Applications** — Review candidate applications, accept or reject them, and schedule interviews
- **Recruiter Insights** — Analytics dashboard with charts (Chart.js) showing application trends, job performance, and hiring metrics

### 🔧 Platform Features
- **Responsive Design** — Mobile-first, fully responsive UI with Tailwind CSS
- **Real-Time Search** — Hero search bar synced with job listing filters
- **Image Uploads** — Cloudinary integration for company logos and user assets
- **Email Service** — Gmail SMTP (Nodemailer) for automated emails — application confirmations, status updates, interview invitations
- **Database Seeding** — Pre-built seed script with 30+ jobs across 7 companies (Microsoft, Google, Amazon, Walmart, Samsung, Adobe, Accenture)
- **Error Monitoring** — Sentry integration for server-side error tracking
- **Webhook Support** — Clerk webhooks (via Svix) for user sync

---

## 🛠 Tech Stack

| Layer       | Technology                                                  |
|-------------|-------------------------------------------------------------|
| **Frontend**| React 19, Vite 7, Tailwind CSS 3, React Router 7           |
| **Backend** | Node.js, Express 5, Mongoose (MongoDB)                      |
| **Auth**    | Clerk (candidates), JWT (recruiters)                        |
| **Storage** | Cloudinary (images), Multer (file uploads)                  |
| **Email**   | Nodemailer (Gmail SMTP)                                     |
| **Charts**  | Chart.js + react-chartjs-2                                  |
| **Editor**  | Quill (rich text job descriptions)                          |
| **Monitoring** | Sentry                                                   |
| **Deploy**  | Vercel-ready (serverless-http)                              |

---

## 📁 Project Structure

```
job-portal2/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── assets/             # Static assets & icons
│       ├── components/         # Reusable UI components
│       │   ├── NavBar.jsx          # Public navigation bar
│       │   ├── Hero.jsx            # Hero search section
│       │   ├── JobListing.jsx      # Job listing with pagination & filters
│       │   ├── JobCard.jsx         # Individual job card
│       │   ├── JobSearchFilters.jsx# Advanced sidebar filters
│       │   ├── RecruiterLogin.jsx  # Recruiter auth modal
│       │   ├── AnalyticsDashboard.jsx # Analytics charts
│       │   ├── Footer.jsx         # Site footer
│       │   └── Loading.jsx        # Loading spinner
│       ├── context/
│       │   └── AppContext.jsx     # Global state (auth, jobs, filters)
│       └── pages/
│           ├── Home.jsx           # Landing page
│           ├── ApplyJob.jsx       # Job detail & apply page
│           ├── Applications.jsx   # Candidate's applied jobs
│           ├── CareerToolkit.jsx   # Career development tools
│           ├── Dashboard.jsx      # Recruiter dashboard layout
│           ├── AddJob.jsx         # Post a new job
│           ├── ManageJobs.jsx     # Manage posted jobs
│           ├── ViewApplications.jsx # Review applications
│           └── RecruiterInsights.jsx # Recruiter analytics
│
├── server/                     # Express backend
│   ├── config/                 # DB connection config
│   ├── controllers/            # Route handlers
│   │   ├── userController.js       # Candidate operations & email
│   │   ├── companyController.js    # Recruiter operations
│   │   ├── jobController.js        # Job CRUD
│   │   ├── analyticsController.js  # Dashboard analytics
│   │   └── webhooks.js             # Clerk webhook handler
│   ├── middlewares/            # Auth & upload middleware
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js, Company.js, Job.js, JobApplication.js
│   │   ├── Resume.js, Interview.js, Assessment.js
│   │   ├── Certification.js, CampusDrive.js
│   │   ├── TestResult.js, RecommendationFeedback.js
│   │   └── ...
│   ├── routes/                 # API route definitions
│   ├── utils/                  # Helper utilities (email service, etc.)
│   ├── seed.js                 # Database seeder
│   └── server.js               # Express app entry point
│
├── IMPLEMENTATION_PHASE1.md    # Implementation roadmap
├── SETUP_GUIDE.md              # Setup & configuration guide
└── package.json                # Root scripts (concurrently)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Clerk** account (for candidate auth)
- **Cloudinary** account (for image uploads)
- **Gmail App Password** (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/job-portal2.git
cd job-portal2
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Configure Environment Variables

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/job-portal
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

Create `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Seed the Database (Optional)
```bash
cd server && node seed.js
```
This creates 7 companies with 30+ diverse job listings.

### 5. Run the App
```bash
npm run dev
```
- **Client**: http://localhost:5173
- **Server**: http://localhost:3000

---

## 📊 Data Models

| Model                  | Purpose                                      |
|------------------------|----------------------------------------------|
| `User`                 | Candidate profiles (synced via Clerk)         |
| `Company`              | Recruiter accounts with logo & credentials    |
| `Job`                  | Job listings with details & visibility toggle |
| `JobApplication`       | Applications linking candidates to jobs       |
| `Resume`               | Candidate resume uploads & metadata           |
| `Interview`            | Scheduled interviews with status tracking     |
| `Assessment`           | Skill assessments for candidates              |
| `Certification`        | Professional certifications                   |
| `CampusDrive`          | Campus recruitment drives                     |
| `TestResult`           | Assessment/test results                       |
| `RecommendationFeedback` | Feedback and recommendations               |

---

## 🔐 Authentication

| Role         | Method                              |
|--------------|-------------------------------------|
| **Candidates** | Clerk (OAuth, email/password)     |
| **Recruiters** | JWT-based (email + password)      |

---

## 📬 Email Notifications

Automated emails via **Nodemailer** (Gmail SMTP):
- ✅ Application confirmation
- 📋 Status updates (accepted/rejected)
- 📅 Interview invitations
- 🔔 General notifications

---

## 🧪 Seeded Test Data

Run `node server/seed.js` to populate the database with:

| Company    | Sample Roles                                          |
|------------|-------------------------------------------------------|
| Microsoft  | Software Engineer, Product Manager, Cloud Architect, Cyber Security Specialist |
| Google     | ML Engineer, SRE, Deep Learning Research Scientist, Data Scientist |
| Amazon     | DevOps Engineer, Logistics Analyst, Fullstack Engineer |
| Walmart    | iOS Developer, Data Analyst, React Native Developer    |
| Samsung    | Electronics Engineer, Software Developer, IoT Firmware |
| Adobe      | UX/UI Designer, Frontend Developer, Lead Creative Designer |
| Accenture  | IT Consultant, Business Analyst, Solutions Architect, MLOps Lead |

**Default recruiter password**: `Recruiter@123`

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.
