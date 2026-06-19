import Company from "../models/Company.js"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js"
import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import Assessment from "../models/Assessment.js"
import Certification from "../models/Certification.js"
import Interview from "../models/Interview.js"
import CampusDrive from "../models/CampusDrive.js"
import { sendInterviewInviteEmail, sendApplicationStatusEmail } from "../utils/emailService.js"

//Register a new company
export const registerCompany = async (req,res) => {

    const {name,email,password} = req.body

    const imageFile = req.file

    if (!name || !email || !password || !imageFile) {
        return res.json({success:false,message:"Missing Details"})
    }

    try {
        
        const companyExist = await Company.findOne({email})

        if(companyExist){
            return res.json({success:false , message:"Company already registered"})
        }

        //Password Hashing
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password , salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password:hashPassword,
            image:imageUpload.secure_url
        })

        res.json({
            success:true,
            company:{
                _id:company._id,
                name:company.name,
                email:company.email,
                image:company.image
            },
            token:generateToken(company._id)
        })

    } catch (error) {
        res.json({success:false , message:error.message})
    }

}

//Company login
export const loginCompany = async (req,res) => {
    const { email , password } = req.body

    try {
        
        const company = await Company.findOne({email});
        if( await bcrypt.compare(password,company.password)){
            res.json({
                success:true,
                company:{
                    _id:company._id,
                    name:company.name,
                    email:company.email,
                    image:company.image
                },
                token:generateToken(company._id)
            })
        }
        else{
            res.json({
                success:false,
                message:'Invalid email or password'
            })
        }

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}

//Get company data
export const getCompanyData = async (req,res) => {
    
    try {
        const company = req.company
        res.json({
            success:true,
            company
        })
    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }

}

//Post a new Job
export const postJob = async (req,res) => {

    const {title , description , location , salary , level , category} = req.body;

    const companyId = req.company._id

    try {
        
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date:Date.now(),
            level,
            category,
        })

        await newJob.save();

        res.json({
            success:true,
            newJob
        })

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}
//Get Company Job applicants
export const getCompanyJobApplicants = async (req,res) => {
    try {
        const companyId = req.company._id
        console.log("Looking for applications with companyId:", companyId)

        const applications = await JobApplication.find({companyId})
        .populate('userId','name image resume')
        .populate('jobId','title location category level salary')
        .exec()

        return res.json({
            success:true,
            applications
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}
//Get Company Posted Jobs
export const getCompanyPostedJobs = async (req,res) => {

    try {
        
        const companyId = req.company._id

        const jobs = await Job.find({companyId})

        //adding number of applicants
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({jobId:job._id})
            return {...job.toObject(),applicants:applicants.length}
        }))

        res.json({
            success:true,
            jobsData
        })

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }

}
//Change Job Application Status
export const ChangeJobApplicationsStatus = async (req,res) => {

    try {
        const { id , status } = req.body
        await JobApplication.findOneAndUpdate({_id:id},{status, updatedAt:Date.now()})
        res.json({
        success:true,
        message:"status changed"
        })
    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }

}
//Change Job Visibility
export const changeVisibility = async (req,res) => {
    try {
        
        const {id} = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if(companyId.toString() == job.companyId.toString()){
            job.visible = !job.visible
        }

        await job.save()

        res.json({
            success:true,
            job
        })

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}

export const createAssessment = async (req, res) => {
    try {
        const companyId = req.company._id
        const { title, skill, level, passingScore, durationMinutes, questions } = req.body

        if (!title || !skill || !Array.isArray(questions) || questions.length === 0) {
            return res.json({ success:false, message:"Assessment title, skill and questions are required" })
        }

        const assessment = await Assessment.create({
            title,
            skill,
            level,
            passingScore,
            durationMinutes,
            questions,
            companyId,
        })

        res.json({ success:true, assessment, message:"Assessment created" })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getCompanyAssessments = async (req, res) => {
    try {
        const companyId = req.company._id
        const assessments = await Assessment.find({ companyId }).sort({ createdAt: -1 })
        res.json({ success:true, assessments })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const scheduleInterview = async (req, res) => {
    try {
        const companyId = req.company._id
        const { applicationId, scheduledAt, durationMinutes = 30, notes = "" } = req.body
        const application = await JobApplication.findById(applicationId)
            .populate('userId', 'name email')
            .populate('jobId', 'title')

        if (!application || application.companyId.toString() !== companyId.toString()) {
            return res.json({ success:false, message:"Application not found" })
        }

        const roomId = `${companyId}-${application.jobId._id}-${application.userId._id}`.replace(/[^a-zA-Z0-9-]/g, "")
        const videoLink = `https://meet.jit.si/insiderjobs-${roomId}`
        const interview = await Interview.create({
            companyId,
            userId: application.userId._id,
            jobId: application.jobId._id,
            applicationId,
            scheduledAt,
            durationMinutes,
            videoLink,
            notes,
        })

        application.status = "Interview"
        application.updatedAt = Date.now()
        await application.save()

        // Send email notification to candidate
        await sendInterviewInviteEmail(
            application.userId.email,
            application.jobId.title,
            (await Company.findById(companyId)).name,
            scheduledAt,
            videoLink
        )

        // Send application status update email
        await sendApplicationStatusEmail(
            application.userId.email,
            application.jobId.title,
            (await Company.findById(companyId)).name,
            'Interview'
        )

        res.json({ success:true, interview, message:"Interview scheduled and email sent to candidate" })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getCompanyInterviews = async (req, res) => {
    try {
        const companyId = req.company._id
        const interviews = await Interview.find({ companyId })
            .populate("userId", "name image email resume")
            .populate("jobId", "title location")
            .sort({ scheduledAt: 1 })
        res.json({ success:true, interviews })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const createCampusDrive = async (req, res) => {
    try {
        const companyId = req.company._id
        const drive = await CampusDrive.create({ ...req.body, companyId })
        res.json({ success:true, drive, message:"Campus drive created" })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getCompanyCampusDrives = async (req, res) => {
    try {
        const companyId = req.company._id
        const drives = await CampusDrive.find({ companyId })
            .populate("jobId", "title location")
            .sort({ driveDate: 1 })
        res.json({ success:true, drives })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}

export const getRecruiterAnalytics = async (req, res) => {
    try {
        const companyId = req.company._id
        const [jobs, applications, certifications, interviews, campusDrives] = await Promise.all([
            Job.find({ companyId }),
            JobApplication.find({ companyId }).populate("jobId", "title"),
            Certification.find(),
            Interview.find({ companyId }),
            CampusDrive.find({ companyId }),
        ])

        const statusCounts = applications.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1
            return acc
        }, {})

        const applicationsByJob = jobs.map(job => ({
            jobId: job._id,
            title: job.title,
            applications: applications.filter(item => item.jobId?._id?.toString() === job._id.toString()).length,
        }))

        const hiredOrAccepted = applications.filter(item => ["Accepted", "Offered"].includes(item.status)).length
        const conversionRate = applications.length ? Math.round((hiredOrAccepted / applications.length) * 100) : 0
        const avgScreeningMs = applications
            .filter(item => item.updatedAt && item.date)
            .reduce((total, item) => total + (item.updatedAt - item.date), 0) / Math.max(applications.length, 1)

        res.json({
            success:true,
            analytics: {
                totals: {
                    jobs: jobs.length,
                    applications: applications.length,
                    interviews: interviews.length,
                    campusDrives: campusDrives.length,
                    certifiedCandidates: certifications.length,
                    conversionRate,
                    averageScreeningHours: Math.round(avgScreeningMs / 36e5),
                },
                statusCounts,
                applicationsByJob,
            },
        })
    } catch (error) {
        res.json({ success:false, message:error.message })
    }
}
