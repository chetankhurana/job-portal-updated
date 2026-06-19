import React, { useState } from 'react'

function JobSearchFilters({ onFilterChange, jobs }) {
    const [filters, setFilters] = useState({
        title: '',
        location: '',
        salary: [0, 500000],
        category: [],
        level: [],
        company: [],
        postedWithin: 30, // days
        remote: false,
    })

    // Extract unique values from jobs
    const uniqueLocations = [...new Set(jobs.map(j => j.location))].filter(Boolean)
    const uniqueCategories = [...new Set(jobs.map(j => j.category))].filter(Boolean)
    const uniqueLevels = [...new Set(jobs.map(j => j.level))].filter(Boolean)
    const uniqueCompanies = [...new Set(jobs.map(j => j.companyId?.name || 'Unknown'))].filter(Boolean)

    const handleFilterChange = (field, value) => {
        const updated = { ...filters, [field]: value }
        setFilters(updated)
        onFilterChange(updated)
    }

    const handleMultiSelect = (field, value) => {
        let updated = [...filters[field]]
        if (updated.includes(value)) {
            updated = updated.filter(v => v !== value)
        } else {
            updated.push(value)
        }
        handleFilterChange(field, updated)
    }

    const resetFilters = () => {
        const resetData = {
            title: '',
            location: '',
            salary: [0, 500000],
            category: [],
            level: [],
            company: [],
            postedWithin: 30,
            remote: false,
        }
        setFilters(resetData)
        onFilterChange(resetData)
    }

    return (
        <div className='w-full bg-slate-50/60 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/50 p-6 sticky top-6 transition-all duration-300'>
            {/* Header */}
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-slate-200/60'>
                <div className='flex items-center gap-2'>
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                    </svg>
                    <h3 className='font-bold text-slate-800 text-lg tracking-tight'>Filter Jobs</h3>
                </div>
                <button 
                    onClick={resetFilters}
                    className='text-xs font-semibold bg-white border border-slate-200 hover:border-blue-500 text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-200'
                >
                    Clear All
                </button>
            </div>

            {/* Job Title Search */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2'>Job Title</label>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search job title...'
                        value={filters.title}
                        onChange={(e) => handleFilterChange('title', e.target.value)}
                        className='w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white shadow-sm placeholder-slate-400 outline-none'
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Location Filter */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2'>Location</label>
                <div className='relative'>
                    <select
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className='w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl pl-10 pr-10 py-2.5 text-sm bg-white shadow-sm appearance-none outline-none text-slate-700 cursor-pointer'
                    >
                        <option value=''>All Locations</option>
                        {uniqueLocations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Remote Filter Switch */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <label className='flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow hover:bg-slate-50 transition-all duration-200 cursor-pointer select-none'>
                    <div className='flex items-center gap-2.5'>
                        <span className='bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100'>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </span>
                        <span className='text-sm font-semibold text-slate-700'>Remote Only</span>
                    </div>
                    <input
                        type='checkbox'
                        checked={filters.remote}
                        onChange={(e) => handleFilterChange('remote', e.target.checked)}
                        className='w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
                    />
                </label>
            </div>

            {/* Salary Range Filter */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <div className='flex justify-between items-center mb-3'>
                    <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase'>Max Salary</label>
                    <span className='bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-lg text-xs border border-blue-100'>₹{(filters.salary[1] / 100000).toFixed(1)}L+</span>
                </div>
                <input
                    type='range'
                    min='0'
                    max='500000'
                    step='10000'
                    value={filters.salary[1]}
                    onChange={(e) => handleFilterChange('salary', [filters.salary[0], parseInt(e.target.value)])}
                    className='w-full accent-blue-600 cursor-ew-resize bg-slate-200 h-1.5 rounded-lg appearance-none'
                />
                <div className='flex justify-between text-[11px] text-slate-400 font-semibold mt-2.5'>
                    <span>₹0L</span>
                    <span>₹5L+</span>
                </div>
            </div>

            {/* Job Category Filter */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2.5'>Category</label>
                <div className='space-y-1.5 max-h-40 overflow-y-auto pr-1 select-none scrollbar-thin'>
                    {uniqueCategories.map(cat => (
                        <label key={cat} className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/60 transition-all duration-150 cursor-pointer text-slate-600 text-sm font-medium'>
                            <input
                                type='checkbox'
                                checked={filters.category.includes(cat)}
                                onChange={() => handleMultiSelect('category', cat)}
                                className='w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
                            />
                            <span>{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Job Level Filter */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2.5'>Experience Level</label>
                <div className='space-y-1.5 select-none'>
                    {uniqueLevels.map(level => (
                        <label key={level} className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/60 transition-all duration-150 cursor-pointer text-slate-600 text-sm font-medium'>
                            <input
                                type='checkbox'
                                checked={filters.level.includes(level)}
                                onChange={() => handleMultiSelect('level', level)}
                                className='w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
                            />
                            <span>{level}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Company Filter */}
            <div className='mb-5 pb-5 border-b border-slate-200/60'>
                <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2.5'>Company</label>
                <div className='space-y-1.5 max-h-40 overflow-y-auto pr-1 select-none scrollbar-thin'>
                    {uniqueCompanies.map(comp => (
                        <label key={comp} className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/60 transition-all duration-150 cursor-pointer text-slate-600 text-sm font-medium'>
                            <input
                                type='checkbox'
                                checked={filters.company.includes(comp)}
                                onChange={() => handleMultiSelect('company', comp)}
                                className='w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
                            />
                            <span>{comp}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Posted Within Filter */}
            <div>
                <label className='block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2'>Posted Within</label>
                <div className='relative'>
                    <select
                        value={filters.postedWithin}
                        onChange={(e) => handleFilterChange('postedWithin', parseInt(e.target.value))}
                        className='w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl pl-10 pr-10 py-2.5 text-sm bg-white shadow-sm appearance-none outline-none text-slate-700 cursor-pointer'
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default JobSearchFilters
