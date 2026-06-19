import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import {v2 as cloudinary} from "cloudinary"
import Resume from "../models/Resume.js"
import Assessment from "../models/Assessment.js"
import TestResult from "../models/TestResult.js"
import Certification from "../models/Certification.js"
import Interview from "../models/Interview.js"
import CampusDrive from "../models/CampusDrive.js"
import RecommendationFeedback from "../models/RecommendationFeedback.js"
import { clerkClient } from "@clerk/express";
import { sendCertificationEmail, sendWelcomeEmail } from "../utils/emailService.js";



const getOrCreateUser = async (userId) => {
    let user = await User.findById(userId)
    if (!user) {
        try {
            const clerkUser = await clerkClient.users.getUser(userId)
            if (clerkUser) {
                const email = clerkUser.emailAddresses && clerkUser.emailAddresses[0]
                    ? clerkUser.emailAddresses[0].emailAddress
                    : ""
                const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Candidate"
                
                user = await User.create({
                    _id: userId,
                    email: email,
                    name: name,
                    image: clerkUser.imageUrl || "",
                    resume: ""
                })

                try {
                    await sendWelcomeEmail(email, name)
                } catch (welcomeEmailError) {
                    console.error("Failed to send welcome email:", welcomeEmailError.message)
                }
            }
        } catch (clerkError) {
            console.error("Failed to fetch user from Clerk:", clerkError.message)
        }
    }
    return user
}

//get user data
export const getUserData = async (req , res) => {
    const userId = req.auth.userId
    try {
        const user = await getOrCreateUser(userId)

        if(!user){
            return res.json({success:false,message:'User not Found'})
        }

        res.json({success:true,user})

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}

//apply for a job
export const applyForJob = async (req , res) => {
    const { jobId } = req.body

    const userId = req.auth.userId
    
    try {
        
        const isAlreadyApplied = await JobApplication.findOne({jobId , userId})

        if(isAlreadyApplied){
            return res.json({
                success:false,
                message:"Already Applied"
            })
        }

        const jobData = await Job.findById(jobId)

        if(!jobData){
            return res.json({
                success:false,
                message:"Job not Found"
            })
        }

        await JobApplication.create({
            companyId:jobData.companyId,
            userId,
            jobId,
            date:Date.now(),
            updatedAt:Date.now()
        })

        res.json({
            success:true,
            message:"Applied Successfully"
        })

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}

const normalizeWords = (value = "") => {
    return String(value)
        .toLowerCase()
        .replace(/<[^>]*>/g, " ")
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 2)
}

const resumeToText = (resume) => {
    if (!resume) return ""
    const sections = ["education", "projects", "experience", "certifications"]
        .flatMap(key => resume[key] || [])
        .map(item => `${item.title} ${item.subtitle} ${item.description}`)
    return [
        resume.headline,
        resume.summary,
        ...(resume.skills || []),
        ...sections,
    ].join(" ")
}

export const getResumeTemplates = async (req, res) => {
    res.json({
        success: true,
        templates: [
            { id: "classic", name: "Classic ATS", description: "Single-column resume for ATS parsers." },
            { id: "technical", name: "Technical Fresher", description: "Project-first layout for technical roles." },
            { id: "campus", name: "Campus Drive", description: "Compact education and achievements layout." },
        ],
    })
}

export const getResumeBuilder = async (req, res) => {
    try {
        const userId = req.auth.userId
        const resume = await Resume.findOne({ userId })
        res.json({ success: true, resume })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const saveResumeBuilder = async (req, res) => {
    try {
        const userId = req.auth.userId
        const payload = { ...req.body, userId }
        const resume = await Resume.findOneAndUpdate(
            { userId },
            payload,
            { new: true, upsert: true, runValidators: true }
        )
        res.json({ success:true, resume, message:"Resume saved" })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const matchResumeKeywords = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { jobId, jobDescription = "" } = req.body
        const resume = await Resume.findOne({ userId })
        const job = jobId ? await Job.findById(jobId) : null
        const resumeWords = new Set(normalizeWords(resumeToText(resume)))
        const jobWords = [...new Set(normalizeWords(job ? `${job.title} ${job.category} ${job.level} ${job.description}` : jobDescription))]
            .filter(word => !["and", "the", "for", "with", "you", "are", "our", "this", "that"].includes(word))
        const matchedKeywords = jobWords.filter(word => resumeWords.has(word))
        const missingKeywords = jobWords.filter(word => !resumeWords.has(word)).slice(0, 20)
        const atsScore = jobWords.length ? Math.round((matchedKeywords.length / jobWords.length) * 100) : 0

        if (resume) {
            resume.atsScore = atsScore
            resume.matchedKeywords = matchedKeywords.slice(0, 30)
            resume.missingKeywords = missingKeywords
            await resume.save()
        }

        res.json({ success:true, atsScore, matchedKeywords: matchedKeywords.slice(0, 30), missingKeywords })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)
        const resume = await Resume.findOne({ userId })
        const certifications = await Certification.find({ userId })
        const certTexts = certifications.map(c => `${c.title} ${c.skill}`).join(" ")
        
        const applications = await JobApplication.find({ userId }).select("jobId")
        const appliedIds = new Set(applications.map(item => item.jobId.toString()))
        const feedback = await RecommendationFeedback.find({ userId })
        const feedbackMap = new Map(feedback.map(item => [item.jobId.toString(), item.rating]))
        const jobs = await Job.find({ visible: true }).populate({ path:"companyId", select:"-password" })
        
        const profileWords = new Set(normalizeWords(`${user?.name || ""} ${resumeToText(resume)} ${certTexts}`))
        const stopwords = new Set(["and", "the", "for", "with", "you", "are", "our", "this", "that", "from", "their", "will", "your", "have", "about", "they", "them", "then", "there", "these", "those", "upon", "what", "when", "where", "which", "while", "who", "whom", "whose", "why", "within", "without", "would", "yet", "yours", "yourself", "yourselves"])

        const recommendations = jobs
            .filter(job => !appliedIds.has(job._id.toString()))
            .map(job => {
                const jobWords = normalizeWords(`${job.title} ${job.category} ${job.level} ${job.description}`)
                const cleanJobWords = [...new Set(jobWords)].filter(w => !stopwords.has(w))
                const matches = cleanJobWords.filter(word => profileWords.has(word))
                const feedbackBoost = feedbackMap.get(job._id.toString()) === "up" ? 15 : feedbackMap.get(job._id.toString()) === "down" ? -15 : 0
                
                let score = 0
                if (matches.length > 0) {
                    const ratio = matches.length / Math.min(cleanJobWords.length, 20)
                    score = Math.round(ratio * 100)
                    
                    const titleWords = normalizeWords(job.title).filter(w => !stopwords.has(w))
                    const titleMatch = titleWords.filter(w => profileWords.has(w))
                    if (titleMatch.length > 0) {
                        score += 20
                    }
                    
                    const catWords = normalizeWords(job.category).filter(w => !stopwords.has(w))
                    const catMatch = catWords.filter(w => profileWords.has(w))
                    if (catMatch.length > 0) {
                        score += 15
                    }
                }
                
                score = Math.max(0, Math.min(98, score + feedbackBoost))
                return { ...job.toObject(), matchScore: score, matchedKeywords: [...new Set(matches)].slice(0, 8) }
            })
            .sort((a, b) => b.matchScore - a.matchScore || b.date - a.date)
            .slice(0, 12)

        res.json({ success:true, recommendations })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const saveRecommendationFeedback = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { jobId, rating } = req.body
        await RecommendationFeedback.findOneAndUpdate(
            { userId, jobId },
            { userId, jobId, rating },
            { upsert: true, new: true, runValidators: true }
        )
        res.json({ success:true, message:"Feedback saved" })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const generateCoverLetter = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { jobId, hiringManager = "Hiring Manager" } = req.body
        const user = await User.findById(userId)
        const resume = await Resume.findOne({ userId })
        const job = await Job.findById(jobId).populate("companyId", "name")

        if (!job) return res.json({ success:false, message:"Job not found" })

        const skills = (resume?.skills || []).slice(0, 5).join(", ") || "the required skills"
        const projects = (resume?.projects || [])[0]?.title
        const projectLine = projects ? ` My project work on ${projects} has helped me practice these skills in a practical setting.` : ""
        const letter = `Dear ${hiringManager},\n\nI am excited to apply for the ${job.title} role at ${job.companyId?.name || "your company"}. As an early-career candidate, I bring strong fundamentals in ${skills} and a clear motivation to grow in ${job.category}.${projectLine}\n\nThe role description aligns with my interest in ${job.level?.toLowerCase() || "entry-level"} opportunities, and I would value the chance to contribute with discipline, curiosity, and fast learning. I have attached my resume for your review and would welcome an interview to discuss how I can support your team.\n\nSincerely,\n${user?.name || "Applicant"}`

        res.json({ success:true, letter })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getAssessments = async (req, res) => {
    try {
        const existingCount = await Assessment.countDocuments()
        if (existingCount === 0) {
            await Assessment.insertMany([
                {
                    title: "JavaScript Fundamentals",
                    skill: "JavaScript",
                    level: "Beginner",
                    passingScore: 70,
                    durationMinutes: 10,
                    questions: [
                        { prompt: "Which keyword declares a block-scoped variable?", options: ["var", "let", "global", "static"], answerIndex: 1 },
                        { prompt: "What does Array.map return?", options: ["A new array", "A boolean", "The original array only", "Nothing"], answerIndex: 0 },
                        { prompt: "Which value is falsy in JavaScript?", options: ["1", "hello", "0", "[]"], answerIndex: 2 },
                    ],
                },
                {
                    title: "Aptitude Starter",
                    skill: "Aptitude",
                    level: "Beginner",
                    passingScore: 70,
                    durationMinutes: 10,
                    questions: [
                        { prompt: "If 5x = 45, what is x?", options: ["5", "7", "9", "11"], answerIndex: 2 },
                        { prompt: "What is 20% of 250?", options: ["25", "40", "50", "75"], answerIndex: 2 },
                        { prompt: "Complete the series: 2, 4, 8, 16, ?", options: ["18", "24", "32", "40"], answerIndex: 2 },
                    ],
                },
            ])
        }
        const assessments = await Assessment.find().select("-questions.answerIndex").sort({ createdAt: -1 })
        res.json({ success:true, assessments })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id).select("-questions.answerIndex")
        if (!assessment) return res.json({ success:false, message:"Assessment not found" })
        res.json({ success:true, assessment })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const submitAssessment = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { assessmentId, answers = [] } = req.body
        const assessment = await Assessment.findById(assessmentId)
        if (!assessment) return res.json({ success:false, message:"Assessment not found" })

        const correct = assessment.questions.reduce((total, question, index) => total + (question.answerIndex === answers[index] ? 1 : 0), 0)
        const score = Math.round((correct / Math.max(assessment.questions.length, 1)) * 100)
        const passed = score >= assessment.passingScore
        const result = await TestResult.create({ userId, assessmentId, answers, score, passed })

        if (passed) {
            await Certification.findOneAndUpdate(
                { userId, assessmentId },
                { userId, assessmentId, title: `${assessment.skill} Certified`, skill: assessment.skill, score, issuedAt: Date.now() },
                { upsert: true, new: true }
            )
            try {
                const user = await User.findById(userId)
                if (user && user.email) {
                    await sendCertificationEmail(user.email, user.name, `${assessment.skill} Certified`, assessment.skill)
                }
            } catch (emailError) {
                console.error("Failed to send certification email:", emailError.message)
            }
        }

        res.json({ success:true, result, passed, score })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getCertifications = async (req, res) => {
    try {
        const userId = req.auth.userId
        const certifications = await Certification.find({ userId }).sort({ issuedAt: -1 })
        res.json({ success:true, certifications })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getUserInterviews = async (req, res) => {
    try {
        const userId = req.auth.userId
        const interviews = await Interview.find({ userId })
            .populate("jobId", "title location")
            .populate("companyId", "name image")
            .sort({ scheduledAt: 1 })
        res.json({ success:true, interviews })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getCampusDrives = async (req, res) => {
    try {
        const drives = await CampusDrive.find()
            .populate("companyId", "name image")
            .populate("jobId", "title location")
            .sort({ driveDate: 1 })
        res.json({ success:true, drives })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const rsvpCampusDrive = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { id } = req.params
        const drive = await CampusDrive.findByIdAndUpdate(id, { $addToSet: { rsvps: userId } }, { new: true })
        if (!drive) return res.json({ success:false, message:"Campus drive not found" })
        res.json({ success:true, drive, message:"RSVP confirmed" })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

//get user applied applications
export const getUserJobApplications = async (req , res) => {

    try {
        
        const userId = req.auth.userId

        const applications = await JobApplication.find({ userId })
  .populate({
    path: 'jobId',
    populate: { path: 'companyId', select: 'name email image' },
    select: 'title description category level salary '
  })
  .exec();

        if (!applications) {
            return res.json({
                success:false,
                message:"No job applications found"
            })
        }

        return res.json({
            success:true,
            applications
        })

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }

}

//update user profile(resume)
export const updateUserResume = async (req , res) => {
    try {
        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await getOrCreateUser(userId);

        if (!userData) {
            return res.json({ success: false, message: "User not Found" });
        }

        if(resumeFile){
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        res.json({
            success:true,
            message:"Resume Updated"
        })

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}
