import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const blankQuestion = { prompt: '', options: ['', '', '', ''], answerIndex: 0 }

function RecruiterInsights() {
    const { backendUrl, companyToken } = useContext(AppContext)
    const [analytics, setAnalytics] = useState(null)
    const [applications, setApplications] = useState([])
    const [jobs, setJobs] = useState([])
    const [interviews, setInterviews] = useState([])
    const [drives, setDrives] = useState([])
    const [selectedApplication, setSelectedApplication] = useState('')
    const [scheduledAt, setScheduledAt] = useState('')
    const [assessment, setAssessment] = useState({
        title: '',
        skill: '',
        level: 'Beginner',
        passingScore: 70,
        durationMinutes: 15,
        questions: [blankQuestion],
    })
    const [drive, setDrive] = useState({
        title: '',
        institution: '',
        stream: '',
        semester: '',
        location: 'Virtual',
        driveDate: '',
        jobId: '',
        eligibility: '',
        description: '',
    })

    const headers = { token: companyToken }

    const fetchInsights = async () => {
        try {
            const [analyticsRes, applicantsRes, jobsRes, interviewsRes, drivesRes] = await Promise.all([
                axios.get(`${backendUrl}/api/company/analytics`, { headers }),
                axios.get(`${backendUrl}/api/company/applicants`, { headers }),
                axios.get(`${backendUrl}/api/company/list-jobs`, { headers }),
                axios.get(`${backendUrl}/api/company/interviews`, { headers }),
                axios.get(`${backendUrl}/api/company/campus-drives`, { headers }),
            ])

            if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics)
            if (applicantsRes.data.success) setApplications(applicantsRes.data.applications.filter(item => item.userId && item.jobId))
            if (jobsRes.data.success) setJobs(jobsRes.data.jobsData)
            if (interviewsRes.data.success) setInterviews(interviewsRes.data.interviews)
            if (drivesRes.data.success) setDrives(drivesRes.data.drives)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (companyToken) fetchInsights()
    }, [companyToken])

    const scheduleInterview = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/company/interviews`, {
                applicationId: selectedApplication,
                scheduledAt: new Date(scheduledAt).getTime(),
            }, { headers })

            if (data.success) {
                toast.success(data.message)
                setSelectedApplication('')
                setScheduledAt('')
                fetchInsights()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateQuestion = (index, field, value) => {
        setAssessment(prev => ({
            ...prev,
            questions: prev.questions.map((question, questionIndex) => questionIndex === index ? { ...question, [field]: value } : question),
        }))
    }

    const updateOption = (questionIndex, optionIndex, value) => {
        setAssessment(prev => ({
            ...prev,
            questions: prev.questions.map((question, index) => index === questionIndex ? {
                ...question,
                options: question.options.map((option, itemIndex) => itemIndex === optionIndex ? value : option),
            } : question),
        }))
    }

    const createAssessment = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/company/assessments`, assessment, { headers })
            if (data.success) {
                toast.success(data.message)
                setAssessment({ title: '', skill: '', level: 'Beginner', passingScore: 70, durationMinutes: 15, questions: [blankQuestion] })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const createDrive = async () => {
        try {
            const payload = { ...drive, driveDate: new Date(drive.driveDate).getTime() }
            const { data } = await axios.post(`${backendUrl}/api/company/campus-drives`, payload, { headers })
            if (data.success) {
                toast.success(data.message)
                setDrive({ title: '', institution: '', stream: '', semester: '', location: 'Virtual', driveDate: '', jobId: '', eligibility: '', description: '' })
                fetchInsights()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='space-y-6'>
            <section>
                <h1 className='text-2xl font-semibold mb-4'>Recruiter Analytics</h1>
                <div className='grid sm:grid-cols-2 xl:grid-cols-4 gap-3'>
                    {[
                        ['Jobs', analytics?.totals?.jobs || 0],
                        ['Applications', analytics?.totals?.applications || 0],
                        ['Interviews', analytics?.totals?.interviews || 0],
                        ['Conversion', `${analytics?.totals?.conversionRate || 0}%`],
                    ].map(([label, value]) => (
                        <div key={label} className='bg-white border rounded p-4'>
                            <p className='text-sm text-gray-500'>{label}</p>
                            <p className='text-3xl font-semibold'>{value}</p>
                        </div>
                    ))}
                </div>
                <div className='grid lg:grid-cols-2 gap-4 mt-4'>
                    <div className='bg-white border rounded p-4'>
                        <h2 className='font-semibold mb-3'>Application Status</h2>
                        {Object.entries(analytics?.statusCounts || {}).map(([status, count]) => (
                            <div key={status} className='mb-2'>
                                <div className='flex justify-between text-sm mb-1'><span>{status}</span><span>{count}</span></div>
                                <div className='h-2 bg-gray-100 rounded'><div className='h-2 bg-blue-600 rounded' style={{ width: `${Math.min(100, count * 20)}%` }} /></div>
                            </div>
                        ))}
                    </div>
                    <div className='bg-white border rounded p-4'>
                        <h2 className='font-semibold mb-3'>Applications Per Job</h2>
                        {(analytics?.applicationsByJob || []).map(job => (
                            <div key={job.jobId} className='flex justify-between border-b py-2 text-sm'>
                                <span>{job.title}</span>
                                <span>{job.applications}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className='grid lg:grid-cols-2 gap-4'>
                <div className='bg-white border rounded p-4'>
                    <h2 className='font-semibold mb-3'>Schedule Interview</h2>
                    <select value={selectedApplication} onChange={e => setSelectedApplication(e.target.value)} className='w-full border rounded px-3 py-2 mb-3'>
                        <option value=''>Choose applicant</option>
                        {applications.map(application => (
                            <option key={application._id} value={application._id}>
                                {application.userId.name} - {application.jobId.title}
                            </option>
                        ))}
                    </select>
                    <input type='datetime-local' value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className='w-full border rounded px-3 py-2 mb-3' />
                    <button disabled={!selectedApplication || !scheduledAt} onClick={scheduleInterview} className='bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded'>Create Video Slot</button>
                    <div className='mt-4 space-y-2'>
                        {interviews.map(interview => (
                            <div key={interview._id} className='border rounded p-3 text-sm'>
                                <p className='font-medium'>{interview.userId?.name} - {interview.jobId?.title}</p>
                                <p className='text-gray-500'>{moment(interview.scheduledAt).format('lll')}</p>
                                <a href={interview.videoLink} target='_blank' className='text-blue-600'>Open room</a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='bg-white border rounded p-4'>
                    <h2 className='font-semibold mb-3'>Create Skill Assessment</h2>
                    <div className='grid sm:grid-cols-2 gap-3 mb-3'>
                        <input className='border rounded px-3 py-2' value={assessment.title} onChange={e => setAssessment(prev => ({ ...prev, title: e.target.value }))} placeholder='Assessment title' />
                        <input className='border rounded px-3 py-2' value={assessment.skill} onChange={e => setAssessment(prev => ({ ...prev, skill: e.target.value }))} placeholder='Skill' />
                        <input className='border rounded px-3 py-2' type='number' value={assessment.passingScore} onChange={e => setAssessment(prev => ({ ...prev, passingScore: Number(e.target.value) }))} placeholder='Passing score' />
                        <input className='border rounded px-3 py-2' type='number' value={assessment.durationMinutes} onChange={e => setAssessment(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))} placeholder='Duration' />
                    </div>
                    {assessment.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className='border rounded p-3 mb-3'>
                            <input className='w-full border rounded px-3 py-2 mb-2' value={question.prompt} onChange={e => updateQuestion(questionIndex, 'prompt', e.target.value)} placeholder='Question prompt' />
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className='flex gap-2 mb-2'>
                                    <input type='radio' name={`answer-${questionIndex}`} checked={question.answerIndex === optionIndex} onChange={() => updateQuestion(questionIndex, 'answerIndex', optionIndex)} />
                                    <input className='flex-1 border rounded px-3 py-2' value={option} onChange={e => updateOption(questionIndex, optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} />
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className='flex gap-2'>
                        <button onClick={() => setAssessment(prev => ({ ...prev, questions: [...prev.questions, blankQuestion] }))} className='border px-4 py-2 rounded'>Add Question</button>
                        <button onClick={createAssessment} className='bg-blue-600 text-white px-4 py-2 rounded'>Publish</button>
                    </div>
                </div>
            </section>

            <section className='bg-white border rounded p-4'>
                <h2 className='font-semibold mb-3'>Campus Hiring Drive</h2>
                <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                    <input className='border rounded px-3 py-2' value={drive.title} onChange={e => setDrive(prev => ({ ...prev, title: e.target.value }))} placeholder='Drive title' />
                    <input className='border rounded px-3 py-2' value={drive.institution} onChange={e => setDrive(prev => ({ ...prev, institution: e.target.value }))} placeholder='Institution' />
                    <input className='border rounded px-3 py-2' value={drive.stream} onChange={e => setDrive(prev => ({ ...prev, stream: e.target.value }))} placeholder='Stream' />
                    <input className='border rounded px-3 py-2' value={drive.semester} onChange={e => setDrive(prev => ({ ...prev, semester: e.target.value }))} placeholder='Semester' />
                    <input className='border rounded px-3 py-2' type='datetime-local' value={drive.driveDate} onChange={e => setDrive(prev => ({ ...prev, driveDate: e.target.value }))} />
                    <select className='border rounded px-3 py-2' value={drive.jobId} onChange={e => setDrive(prev => ({ ...prev, jobId: e.target.value }))}>
                        <option value=''>Link a job</option>
                        {jobs.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
                    </select>
                    <input className='border rounded px-3 py-2 lg:col-span-2' value={drive.eligibility} onChange={e => setDrive(prev => ({ ...prev, eligibility: e.target.value }))} placeholder='Eligibility' />
                </div>
                <textarea className='w-full border rounded px-3 py-2 mt-3' value={drive.description} onChange={e => setDrive(prev => ({ ...prev, description: e.target.value }))} placeholder='Drive details' />
                <button onClick={createDrive} className='mt-3 bg-blue-600 text-white px-4 py-2 rounded'>Create Drive</button>
                <div className='grid md:grid-cols-2 gap-3 mt-4'>
                    {drives.map(item => (
                        <div key={item._id} className='border rounded p-3 text-sm'>
                            <p className='font-medium'>{item.title}</p>
                            <p className='text-gray-500'>{item.institution} | {moment(item.driveDate).format('lll')} | RSVPs {item.rsvps?.length || 0}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default RecruiterInsights
