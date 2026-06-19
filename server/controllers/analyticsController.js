import Company from "../models/Company.js"
import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import Interview from "../models/Interview.js"

/**
 * Get recruitment analytics for a company
 */
export const getCompanyAnalytics = async (req, res) => {
    try {
        const companyId = req.company._id
        
        // Fetch all relevant data
        const totalApplications = await JobApplication.countDocuments({ companyId })
        const acceptedApplications = await JobApplication.countDocuments({ companyId, status: 'Accepted' })
        const rejectedApplications = await JobApplication.countDocuments({ companyId, status: 'Rejected' })
        const interviewApplications = await JobApplication.countDocuments({ companyId, status: 'Interview' })
        const jobsPosted = await Job.countDocuments({ companyId })

        // Calculate average screening time
        const applications = await JobApplication.find({ companyId })
        let totalScreeningTime = 0
        let screenedCount = 0
        applications.forEach(app => {
            if (app.status !== 'Applied') {
                const screeningTime = (new Date(app.updatedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)
                totalScreeningTime += screeningTime
                screenedCount++
            }
        })
        const averageScreeningTime = screenedCount > 0 ? Math.round(totalScreeningTime / screenedCount) : 0

        // Applications trend (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const applicationsTrend = await JobApplication.aggregate([
            {
                $match: {
                    companyId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // Top performing jobs
        const topJobs = await JobApplication.aggregate([
            { $match: { companyId } },
            { $group: { _id: "$jobId", applicationCount: { $sum: 1 } } },
            { $sort: { applicationCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "jobs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $project: {
                    _id: 0,
                    jobId: "$_id",
                    title: { $arrayElemAt: ["$job.title", 0] },
                    applicationCount: 1
                }
            }
        ])

        res.json({
            success: true,
            analytics: {
                totalApplications,
                acceptedApplications,
                rejectedApplications,
                interviewApplications,
                averageScreeningTime,
                jobsPosted,
                applicationsTrend: applicationsTrend.map(t => ({
                    date: t._id,
                    count: t.count
                })),
                topJobs,
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

/**
 * Get detailed recruitment funnel analytics
 */
export const getRecruitmentFunnel = async (req, res) => {
    try {
        const companyId = req.company._id
        
        const funnel = {
            applied: await JobApplication.countDocuments({ companyId, status: 'Applied' }),
            screened: await JobApplication.countDocuments({ companyId, status: 'Screened' }),
            interviewed: await JobApplication.countDocuments({ companyId, status: 'Interview' }),
            offered: await JobApplication.countDocuments({ companyId, status: 'Accepted' }),
        }

        // Calculate conversion rates
        const funnelData = {
            ...funnel,
            conversionRates: {
                appliedToScreened: ((funnel.screened / funnel.applied) * 100).toFixed(2),
                screenedToInterview: ((funnel.interviewed / funnel.screened) * 100).toFixed(2),
                interviewToOffer: ((funnel.offered / funnel.interviewed) * 100).toFixed(2),
                overall: ((funnel.offered / funnel.applied) * 100).toFixed(2),
            }
        }

        res.json({ success: true, funnelData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

/**
 * Get job-specific analytics
 */
export const getJobAnalytics = async (req, res) => {
    try {
        const { jobId } = req.params
        const companyId = req.company._id

        const job = await Job.findOne({ _id: jobId, companyId })
        if (!job) {
            return res.json({ success: false, message: "Job not found" })
        }

        const applications = await JobApplication.find({ jobId })
        const statusBreakdown = {
            applied: applications.filter(a => a.status === 'Applied').length,
            interviewed: applications.filter(a => a.status === 'Interview').length,
            accepted: applications.filter(a => a.status === 'Accepted').length,
            rejected: applications.filter(a => a.status === 'Rejected').length,
        }

        // Time to hire
        const hiredApplications = applications.filter(a => a.status === 'Accepted')
        let totalTimeToHire = 0
        hiredApplications.forEach(app => {
            totalTimeToHire += (new Date(app.updatedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)
        })
        const avgTimeToHire = hiredApplications.length > 0 ? (totalTimeToHire / hiredApplications.length).toFixed(1) : 0

        res.json({
            success: true,
            jobAnalytics: {
                jobTitle: job.title,
                totalApplications: applications.length,
                statusBreakdown,
                avgTimeToHire,
                conversionRate: ((hiredApplications.length / applications.length) * 100).toFixed(2)
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

/**
 * Export analytics as CSV
 */
export const exportAnalytics = async (req, res) => {
    try {
        const companyId = req.company._id
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name email')
            .populate('jobId', 'title')

        // Generate CSV
        let csv = "Application Date,Candidate Name,Email,Job Title,Status,Days to Screen\n"
        applications.forEach(app => {
            const daysToScreen = ((new Date(app.updatedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24)).toFixed(1)
            csv += `${app.createdAt.toISOString().split('T')[0]},${app.userId.name},${app.userId.email},"${app.jobId.title}",${app.status},${daysToScreen}\n`
        })

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="recruitment-analytics.csv"')
        res.send(csv)
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
