import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import axios from 'axios'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement)

function AnalyticsDashboard() {
    const { companyToken, backendUrl } = useContext(AppContext)
    const [analytics, setAnalytics] = useState({
        totalApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        interviewApplications: 0,
        averageScreeningTime: 0,
        jobsPosted: 0,
        applicationsByStatus: {},
        applicationsTrend: [],
        topJobs: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [companyToken])

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/company/analytics`, {
                headers: { token: companyToken }
            })
            if (data.success) {
                setAnalytics(data.analytics)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading analytics...</div>
    }

    // Application Status Distribution (Doughnut Chart)
    const statusChartData = {
        labels: ['Accepted', 'Rejected', 'Interview', 'Pending'],
        datasets: [{
            label: 'Applications by Status',
            data: [
                analytics.acceptedApplications,
                analytics.rejectedApplications,
                analytics.interviewApplications,
                analytics.totalApplications - analytics.acceptedApplications - analytics.rejectedApplications - analytics.interviewApplications
            ],
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'],
            borderColor: ['#059669', '#dc2626', '#1d4ed8', '#d97706'],
            borderWidth: 2,
        }]
    }

    // Applications Trend (Line Chart)
    const trendChartData = {
        labels: analytics.applicationsTrend?.map(t => t.date) || [],
        datasets: [{
            label: 'Applications Over Time',
            data: analytics.applicationsTrend?.map(t => t.count) || [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
        }]
    }

    // Top Jobs (Bar Chart)
    const topJobsData = {
        labels: analytics.topJobs?.map(j => j.title) || [],
        datasets: [{
            label: 'Applications per Job',
            data: analytics.topJobs?.map(j => j.applicationCount) || [],
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            borderWidth: 1,
        }]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 15, font: { size: 12 } }
            }
        }
    }

    return (
        <div className='flex flex-col gap-6 p-6 bg-gray-50 min-h-screen'>
            {/* Header */}
            <div className='bg-white rounded-lg shadow p-6'>
                <h1 className='text-3xl font-bold text-gray-800'>Recruitment Analytics</h1>
                <p className='text-gray-600 mt-2'>Track your hiring metrics and performance</p>
            </div>

            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <MetricCard title="Total Applications" value={analytics.totalApplications} color="blue" />
                <MetricCard title="Accepted" value={analytics.acceptedApplications} color="green" />
                <MetricCard title="Rejected" value={analytics.rejectedApplications} color="red" />
                <MetricCard title="Interviews Scheduled" value={analytics.interviewApplications} color="purple" />
            </div>

            {/* Charts Row 1 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Application Status Distribution */}
                <div className='bg-white rounded-lg shadow p-6'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4'>Application Status</h2>
                    <div className='flex justify-center'>
                        <Doughnut data={statusChartData} options={chartOptions} height={250} />
                    </div>
                </div>

                {/* Key Metrics Summary */}
                <div className='bg-white rounded-lg shadow p-6'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4'>Performance Summary</h2>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center pb-2 border-b'>
                            <span className='text-gray-600'>Jobs Posted</span>
                            <span className='font-bold text-lg'>{analytics.jobsPosted}</span>
                        </div>
                        <div className='flex justify-between items-center pb-2 border-b'>
                            <span className='text-gray-600'>Conversion Rate</span>
                            <span className='font-bold text-lg'>
                                {((analytics.acceptedApplications / analytics.totalApplications) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className='flex justify-between items-center pb-2 border-b'>
                            <span className='text-gray-600'>Average Screening Time</span>
                            <span className='font-bold text-lg'>{analytics.averageScreeningTime} days</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Acceptance Rate</span>
                            <span className='font-bold text-lg'>
                                {((analytics.acceptedApplications / analytics.totalApplications) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className='grid grid-cols-1 gap-6'>
                {/* Applications Trend */}
                <div className='bg-white rounded-lg shadow p-6'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4'>Applications Over Time</h2>
                    <Line data={trendChartData} options={{
                        ...chartOptions,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }} height={150} />
                </div>

                {/* Top Jobs */}
                {analytics.topJobs && analytics.topJobs.length > 0 && (
                    <div className='bg-white rounded-lg shadow p-6'>
                        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Top Performing Jobs</h2>
                        <Bar data={topJobsData} options={{
                            ...chartOptions,
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }} height={150} />
                    </div>
                )}
            </div>

            {/* Export Button */}
            <div className='flex justify-end'>
                <button onClick={exportReport} className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'>
                    📊 Export Report
                </button>
            </div>
        </div>
    )
}

function MetricCard({ title, value, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        red: 'bg-red-50 border-red-200 text-red-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
    }

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-4`}>
            <p className='text-gray-600 text-sm'>{title}</p>
            <p className='text-3xl font-bold mt-2'>{value}</p>
        </div>
    )
}

function exportReport() {
    const element = document.querySelector('[role="main"]')
    const opt = {
        margin: 10,
        filename: 'recruitment-analytics.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }
    // Requires html2pdf library
    console.log('Export functionality requires html2pdf library')
}

export default AnalyticsDashboard
