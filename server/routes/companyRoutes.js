import  express  from "express";
import {
    ChangeJobApplicationsStatus,
    changeVisibility,
    createAssessment,
    createCampusDrive,
    getCompanyAssessments,
    getCompanyCampusDrives,
    getCompanyInterviews,
    getCompanyJobApplicants,
    getCompanyPostedJobs,
    getRecruiterAnalytics,
    postJob,
    registerCompany,
    scheduleInterview
} from "../controllers/companyController.js";
import { getCompanyData, loginCompany } from "../controllers/companyController.js";
import { getCompanyAnalytics, getRecruitmentFunnel, getJobAnalytics, exportAnalytics } from "../controllers/analyticsController.js";
import upload from "../config/multer.js";
import { protectCompany } from "../middlewares/authMiddleware.js";

const router = express.Router();

//register a company
router.post('/register' , upload.single('image') , registerCompany)

//company login
router.post('/login',loginCompany)

//get company data
router.get('/company', protectCompany , getCompanyData)

//post a job
router.post('/post-job', protectCompany , postJob)

//get applicants data of company
router.get('/applicants', protectCompany , getCompanyJobApplicants)

//get company job list
router.get('/list-jobs', protectCompany , getCompanyPostedJobs)

//change application status
router.post('/change-status', protectCompany , ChangeJobApplicationsStatus)

//change applications visibility
router.post('/change-visibility', protectCompany , changeVisibility)

router.get('/analytics', protectCompany, getRecruiterAnalytics)
router.get('/assessments', protectCompany, getCompanyAssessments)
router.post('/assessments', protectCompany, createAssessment)
router.get('/interviews', protectCompany, getCompanyInterviews)
router.post('/interviews', protectCompany, scheduleInterview)
router.get('/campus-drives', protectCompany, getCompanyCampusDrives)
router.post('/campus-drives', protectCompany, createCampusDrive)

//analytics endpoints
router.get('/analytics/dashboard', protectCompany, getCompanyAnalytics)
router.get('/analytics/funnel', protectCompany, getRecruitmentFunnel)
router.get('/analytics/job/:jobId', protectCompany, getJobAnalytics)
router.get('/analytics/export', protectCompany, exportAnalytics)

export default router
