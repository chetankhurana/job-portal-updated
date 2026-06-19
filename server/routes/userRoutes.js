import  express  from "express";
import {
    applyForJob,
    generateCoverLetter,
    getAssessmentById,
    getAssessments,
    getCampusDrives,
    getCertifications,
    getRecommendations,
    getResumeBuilder,
    getResumeTemplates,
    getUserData,
    getUserInterviews,
    getUserJobApplications,
    matchResumeKeywords,
    rsvpCampusDrive,
    saveRecommendationFeedback,
    saveResumeBuilder,
    submitAssessment,
    updateUserResume
} from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router()

//get user data
router.get('/user',getUserData)

//apply for job
router.post('/apply',applyForJob)

//get applied jobs data
router.get('/applications',getUserJobApplications)

//update user profile(resume)
router.post('/update-resume',upload.single('resume'),updateUserResume)

router.get('/resume-builder', getResumeBuilder)
router.post('/resume-builder', saveResumeBuilder)
router.get('/resume-templates', getResumeTemplates)
router.post('/keyword-match', matchResumeKeywords)
router.get('/recommendations/jobs', getRecommendations)
router.post('/recommendations/feedback', saveRecommendationFeedback)
router.post('/cover-letter', generateCoverLetter)
router.get('/assessments', getAssessments)
router.get('/assessments/:id', getAssessmentById)
router.post('/assessments/submit', submitAssessment)
router.get('/certifications', getCertifications)
router.get('/interviews', getUserInterviews)
router.get('/campus-drives', getCampusDrives)
router.post('/campus-drives/:id/rsvp', rsvpCampusDrive)

export default router;
