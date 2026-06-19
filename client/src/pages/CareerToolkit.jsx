import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useAuth, useUser } from '@clerk/clerk-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import { AppContext } from '../context/AppContext'

const emptyResume = {
    template: 'classic',
    headline: '',
    phone: '',
    location: '',
    links: [],
    summary: '',
    skills: [],
    education: [{ title: '', subtitle: '', startDate: '', endDate: '', description: '' }],
    projects: [{ title: '', subtitle: '', startDate: '', endDate: '', description: '' }],
    experience: [],
    certifications: [],
}

const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'jobs', label: 'Recommendations' },
    { id: 'cover', label: 'Cover Letter' },
    { id: 'skills', label: 'Skills' },
    { id: 'schedule', label: 'Interviews' },
    { id: 'campus', label: 'Campus' },
]

function CareerToolkit() {
    const { backendUrl, jobs } = useContext(AppContext)
    const { getToken } = useAuth()
    const { user } = useUser()
    const [activeTab, setActiveTab] = useState('resume')
    const [resume, setResume] = useState(emptyResume)
    const [templates, setTemplates] = useState([])
    const [keywordJobId, setKeywordJobId] = useState('')
    const [match, setMatch] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [coverJobId, setCoverJobId] = useState('')
    const [coverLetter, setCoverLetter] = useState('')
    const [assessments, setAssessments] = useState([])
    const [selectedAssessment, setSelectedAssessment] = useState(null)
    const [answers, setAnswers] = useState([])
    const [certifications, setCertifications] = useState([])
    const [interviews, setInterviews] = useState([])
    const [drives, setDrives] = useState([])

    const authHeaders = async () => {
        const token = await getToken()
        return { Authorization: `Bearer ${token}` }
    }

    const fetchToolkit = async () => {
        if (!user) return
        try {
            const headers = await authHeaders()
            const [resumeRes, templateRes, recRes, assessmentRes, certRes, interviewRes, driveRes] = await Promise.all([
                axios.get(`${backendUrl}/api/users/resume-builder`, { headers }),
                axios.get(`${backendUrl}/api/users/resume-templates`, { headers }),
                axios.get(`${backendUrl}/api/users/recommendations/jobs`, { headers }),
                axios.get(`${backendUrl}/api/users/assessments`, { headers }),
                axios.get(`${backendUrl}/api/users/certifications`, { headers }),
                axios.get(`${backendUrl}/api/users/interviews`, { headers }),
                axios.get(`${backendUrl}/api/users/campus-drives`, { headers }),
            ])

            if (resumeRes.data.success && resumeRes.data.resume) setResume({ ...emptyResume, ...resumeRes.data.resume })
            if (templateRes.data.success) setTemplates(templateRes.data.templates)
            if (recRes.data.success) setRecommendations(recRes.data.recommendations)
            if (assessmentRes.data.success) setAssessments(assessmentRes.data.assessments)
            if (certRes.data.success) setCertifications(certRes.data.certifications)
            if (interviewRes.data.success) setInterviews(interviewRes.data.interviews)
            if (driveRes.data.success) setDrives(driveRes.data.drives)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchToolkit()
    }, [user])

    const resumeText = useMemo(() => {
        const sectionText = ['education', 'projects', 'experience', 'certifications']
            .flatMap(key => resume[key] || [])
            .map(item => `${item.title} ${item.subtitle} ${item.description}`)
            .join(' ')
        return `${resume.headline} ${resume.summary} ${(resume.skills || []).join(' ')} ${sectionText}`
    }, [resume])

    const updateField = (field, value) => setResume(prev => ({ ...prev, [field]: value }))

    const updateSection = (section, index, field, value) => {
        setResume(prev => ({
            ...prev,
            [section]: prev[section].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
        }))
    }

    const addSectionItem = (section) => {
        setResume(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), { title: '', subtitle: '', startDate: '', endDate: '', description: '' }],
        }))
    }

    const saveResume = async () => {
        try {
            const headers = await authHeaders()
            const { data } = await axios.post(`${backendUrl}/api/users/resume-builder`, resume, { headers })
            if (data.success) {
                toast.success(data.message)
                setResume({ ...emptyResume, ...data.resume })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const runKeywordMatch = async () => {
        try {
            const headers = await authHeaders()
            const { data } = await axios.post(`${backendUrl}/api/users/keyword-match`, { jobId: keywordJobId }, { headers })
            if (data.success) setMatch(data)
            else toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const generateCoverLetter = async () => {
        try {
            const headers = await authHeaders()
            const { data } = await axios.post(`${backendUrl}/api/users/cover-letter`, { jobId: coverJobId }, { headers })
            if (data.success) setCoverLetter(data.letter)
            else toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const openAssessment = async (assessmentId) => {
        try {
            const headers = await authHeaders()
            const { data } = await axios.get(`${backendUrl}/api/users/assessments/${assessmentId}`, { headers })
            if (data.success) {
                setSelectedAssessment(data.assessment)
                setAnswers([])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const submitAssessment = async () => {
        try {
            const headers = await authHeaders()
            const { data } = await axios.post(`${backendUrl}/api/users/assessments/submit`, {
                assessmentId: selectedAssessment._id,
                answers,
            }, { headers })
            if (data.success) {
                toast.success(data.passed ? `Passed with ${data.score}%` : `Scored ${data.score}%. Try again after review.`)
                setSelectedAssessment(null)
                fetchToolkit()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendFeedback = async (jobId, rating) => {
        try {
            const headers = await authHeaders()
            await axios.post(`${backendUrl}/api/users/recommendations/feedback`, { jobId, rating }, { headers })
            toast.success('Recommendation feedback saved')
            fetchToolkit()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const rsvpDrive = async (driveId) => {
        try {
            const headers = await authHeaders()
            const { data } = await axios.post(`${backendUrl}/api/users/campus-drives/${driveId}/rsvp`, {}, { headers })
            if (data.success) {
                toast.success(data.message)
                fetchToolkit()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const printResume = () => window.print()

    return (
        <>
            <NavBar />
            <main className='container px-4 2xl:px-20 mx-auto py-8 min-h-[70vh]'>
                <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6'>
                    <div>
                        <p className='text-sm text-blue-600 font-medium'>Fresher career toolkit</p>
                        <h1 className='text-3xl font-semibold text-gray-900'>Build, match, prepare, and track</h1>
                    </div>
                    <div className='flex gap-2 overflow-x-auto'>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 border rounded whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'resume' && (
                    <section className='grid lg:grid-cols-[1.1fr_0.9fr] gap-6'>
                        <div className='space-y-4'>
                            <div className='bg-white border rounded p-4'>
                                <label className='block text-sm font-medium mb-2'>Template</label>
                                <div className='grid sm:grid-cols-3 gap-3'>
                                    {templates.map(template => (
                                        <button key={template.id} onClick={() => updateField('template', template.id)} className={`text-left border rounded p-3 ${resume.template === template.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                            <span className='block font-medium'>{template.name}</span>
                                            <span className='text-sm text-gray-500'>{template.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className='bg-white border rounded p-4 grid sm:grid-cols-2 gap-3'>
                                <input className='border rounded px-3 py-2' value={resume.headline} onChange={e => updateField('headline', e.target.value)} placeholder='Headline, e.g. Frontend Developer Fresher' />
                                <input className='border rounded px-3 py-2' value={resume.phone} onChange={e => updateField('phone', e.target.value)} placeholder='Phone' />
                                <input className='border rounded px-3 py-2' value={resume.location} onChange={e => updateField('location', e.target.value)} placeholder='Location' />
                                <input className='border rounded px-3 py-2' value={(resume.skills || []).join(', ')} onChange={e => updateField('skills', e.target.value.split(',').map(item => item.trim()).filter(Boolean))} placeholder='Skills, comma separated' />
                                <textarea className='border rounded px-3 py-2 sm:col-span-2' rows='4' value={resume.summary} onChange={e => updateField('summary', e.target.value)} placeholder='Professional summary' />
                            </div>
                            {['education', 'projects', 'experience', 'certifications'].map(section => (
                                <div key={section} className='bg-white border rounded p-4'>
                                    <div className='flex justify-between items-center mb-3'>
                                        <h2 className='font-semibold capitalize'>{section}</h2>
                                        <button onClick={() => addSectionItem(section)} className='text-blue-600 text-sm'>Add</button>
                                    </div>
                                    {(resume[section] || []).map((item, index) => (
                                        <div key={`${section}-${index}`} className='grid sm:grid-cols-2 gap-3 mb-3'>
                                            <input className='border rounded px-3 py-2' value={item.title} onChange={e => updateSection(section, index, 'title', e.target.value)} placeholder='Title' />
                                            <input className='border rounded px-3 py-2' value={item.subtitle} onChange={e => updateSection(section, index, 'subtitle', e.target.value)} placeholder='Institute, company, or stack' />
                                            <input className='border rounded px-3 py-2' value={item.startDate} onChange={e => updateSection(section, index, 'startDate', e.target.value)} placeholder='Start' />
                                            <input className='border rounded px-3 py-2' value={item.endDate} onChange={e => updateSection(section, index, 'endDate', e.target.value)} placeholder='End' />
                                            <textarea className='border rounded px-3 py-2 sm:col-span-2' value={item.description} onChange={e => updateSection(section, index, 'description', e.target.value)} placeholder='Impact, responsibilities, outcomes' />
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className='flex gap-3'>
                                <button onClick={saveResume} className='bg-blue-600 text-white px-5 py-2 rounded'>Save Resume</button>
                                <button onClick={printResume} className='border px-5 py-2 rounded'>Download PDF</button>
                            </div>
                        </div>
                        <aside className='bg-white border rounded p-6 h-fit print:border-0' id='resume-preview'>
                            <div className='border-b pb-4 mb-4'>
                                <h2 className='text-2xl font-bold'>{user?.fullName || 'Your Name'}</h2>
                                <p className='text-gray-700'>{resume.headline || 'Fresher candidate'}</p>
                                <p className='text-sm text-gray-500'>{[resume.phone, resume.location].filter(Boolean).join(' | ')}</p>
                            </div>
                            <p className='text-sm text-gray-700 mb-4'>{resume.summary || 'Add a concise summary tailored to the role.'}</p>
                            <h3 className='font-semibold mb-2'>Skills</h3>
                            <p className='text-sm text-gray-700 mb-4'>{(resume.skills || []).join(', ') || 'Add skills to improve ATS matching.'}</p>
                            {['education', 'projects', 'experience', 'certifications'].map(section => (
                                <div key={section} className='mb-4'>
                                    <h3 className='font-semibold capitalize mb-2'>{section}</h3>
                                    {(resume[section] || []).filter(item => item.title || item.subtitle || item.description).map((item, index) => (
                                        <div key={index} className='mb-3'>
                                            <p className='font-medium'>{item.title}</p>
                                            <p className='text-sm text-gray-600'>{item.subtitle} {[item.startDate, item.endDate].filter(Boolean).join(' - ')}</p>
                                            <p className='text-sm text-gray-700'>{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className='text-xs text-gray-500 border-t pt-3'>{resumeText.split(/\s+/).filter(Boolean).length} resume keywords indexed</div>
                        </aside>
                    </section>
                )}

                {activeTab === 'jobs' && (
                    <section className='space-y-5'>
                        <div className='bg-white border rounded p-4 flex flex-col md:flex-row gap-3 md:items-center'>
                            <select value={keywordJobId} onChange={e => setKeywordJobId(e.target.value)} className='border rounded px-3 py-2 flex-1'>
                                <option value=''>Choose a job to run ATS keyword match</option>
                                {jobs.map(job => <option value={job._id} key={job._id}>{job.title} - {job.companyId?.name}</option>)}
                            </select>
                            <button disabled={!keywordJobId} onClick={runKeywordMatch} className='bg-blue-600 disabled:bg-gray-300 text-white px-5 py-2 rounded'>Run Match</button>
                        </div>
                        {match && (
                            <div className='bg-white border rounded p-4'>
                                <h2 className='font-semibold mb-2'>ATS Score: {match.atsScore}%</h2>
                                <p className='text-sm text-gray-600 mb-2'>Matched: {match.matchedKeywords.join(', ') || 'No matches yet'}</p>
                                <p className='text-sm text-gray-600'>Missing: {match.missingKeywords.join(', ') || 'No missing keywords'}</p>
                            </div>
                        )}
                        <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                            {recommendations.map(job => (
                                <div key={job._id} className='border rounded p-3 bg-white'>
                                    <div className='flex justify-between items-center mb-2'>
                                        <span className='text-sm font-medium text-green-700'>{job.matchScore}% match</span>
                                        <div className='flex gap-2'>
                                            <button onClick={() => sendFeedback(job._id, 'up')} className='border rounded px-2' aria-label='Helpful recommendation'>+</button>
                                            <button onClick={() => sendFeedback(job._id, 'down')} className='border rounded px-2' aria-label='Not helpful recommendation'>-</button>
                                        </div>
                                    </div>
                                    <JobCard job={job} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'cover' && (
                    <section className='bg-white border rounded p-4 space-y-4'>
                        <div className='flex flex-col md:flex-row gap-3'>
                            <select value={coverJobId} onChange={e => setCoverJobId(e.target.value)} className='border rounded px-3 py-2 flex-1'>
                                <option value=''>Choose a job</option>
                                {jobs.map(job => <option value={job._id} key={job._id}>{job.title} - {job.companyId?.name}</option>)}
                            </select>
                            <button disabled={!coverJobId} onClick={generateCoverLetter} className='bg-blue-600 disabled:bg-gray-300 text-white px-5 py-2 rounded'>Generate</button>
                        </div>
                        <textarea className='w-full min-h-80 border rounded p-3 whitespace-pre-wrap' value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder='Generated cover letter will appear here.' />
                    </section>
                )}

                {activeTab === 'skills' && (
                    <section className='grid lg:grid-cols-[0.9fr_1.1fr] gap-5'>
                        <div className='space-y-3'>
                            {assessments.map(assessment => (
                                <button key={assessment._id} onClick={() => openAssessment(assessment._id)} className='block w-full text-left bg-white border rounded p-4'>
                                    <span className='block font-semibold'>{assessment.title}</span>
                                    <span className='text-sm text-gray-500'>{assessment.skill} | {assessment.level} | Pass {assessment.passingScore}%</span>
                                </button>
                            ))}
                            <div className='bg-white border rounded p-4'>
                                <h2 className='font-semibold mb-2'>Certifications</h2>
                                {certifications.length === 0 ? <p className='text-sm text-gray-500'>No badges earned yet.</p> : certifications.map(cert => (
                                    <div key={cert._id} className='border rounded p-3 mb-2'>
                                        <p className='font-medium'>{cert.title}</p>
                                        <p className='text-sm text-gray-500'>Score {cert.score}% | {moment(cert.issuedAt).format('ll')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='bg-white border rounded p-4'>
                            {!selectedAssessment ? <p className='text-gray-500'>Select an assessment to begin.</p> : (
                                <div>
                                    <h2 className='font-semibold text-xl mb-4'>{selectedAssessment.title}</h2>
                                    {selectedAssessment.questions.map((question, questionIndex) => (
                                        <div key={questionIndex} className='mb-5'>
                                            <p className='font-medium mb-2'>{questionIndex + 1}. {question.prompt}</p>
                                            <div className='grid sm:grid-cols-2 gap-2'>
                                                {question.options.map((option, optionIndex) => (
                                                    <label key={optionIndex} className='border rounded p-3 flex gap-2'>
                                                        <input type='radio' name={`q-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }))} />
                                                        {option}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={submitAssessment} className='bg-blue-600 text-white px-5 py-2 rounded'>Submit Assessment</button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'schedule' && (
                    <section className='grid md:grid-cols-2 gap-4'>
                        {interviews.length === 0 ? <p className='text-gray-500'>No interviews scheduled yet.</p> : interviews.map(interview => (
                            <div key={interview._id} className='bg-white border rounded p-4'>
                                <p className='font-semibold'>{interview.jobId?.title}</p>
                                <p className='text-sm text-gray-500'>{interview.companyId?.name} | {moment(interview.scheduledAt).format('lll')}</p>
                                <a href={interview.videoLink} target='_blank' className='inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded'>Join Video</a>
                            </div>
                        ))}
                    </section>
                )}

                {activeTab === 'campus' && (
                    <section className='grid md:grid-cols-2 gap-4'>
                        {drives.length === 0 ? <p className='text-gray-500'>No campus drives posted yet.</p> : drives.map(drive => (
                            <div key={drive._id} className='bg-white border rounded p-4'>
                                <p className='font-semibold'>{drive.title}</p>
                                <p className='text-sm text-gray-500'>{drive.institution} | {moment(drive.driveDate).format('ll')} | {drive.location}</p>
                                <p className='text-sm text-gray-700 mt-2'>{drive.eligibility}</p>
                                <button onClick={() => rsvpDrive(drive._id)} className='mt-4 bg-blue-600 text-white px-4 py-2 rounded'>RSVP</button>
                            </div>
                        ))}
                    </section>
                )}
            </main>
            <Footer />
        </>
    )
}

export default CareerToolkit
