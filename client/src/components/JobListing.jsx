import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import JobCard from './JobCard';
import JobSearchFilters from './JobSearchFilters';

function JobListing() {
    const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);
    const [showFilter, setShowFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilters, setActiveFilters] = useState({});
    const [filteredJobs, setFilteredJobs] = useState(jobs);

    useEffect(() => {
        let list = jobs.slice().reverse();

        if (activeFilters.title) {
            list = list.filter(job => job.title.toLowerCase().includes(activeFilters.title.toLowerCase()));
        }
        if (activeFilters.location) {
            list = list.filter(job => job.location.toLowerCase().includes(activeFilters.location.toLowerCase()));
        }
        if (activeFilters.remote) {
            list = list.filter(job => 
                job.location.toLowerCase().includes('remote') || 
                (job.description && job.description.toLowerCase().includes('remote'))
            );
        }
        if (activeFilters.salary) {
            const [minSalary, maxSalary] = activeFilters.salary;
            list = list.filter(job => {
                const sal = job.salary || 0;
                return sal >= minSalary && sal <= maxSalary;
            });
        }
        if (activeFilters.category && activeFilters.category.length > 0) {
            list = list.filter(job => activeFilters.category.includes(job.category));
        }
        if (activeFilters.level && activeFilters.level.length > 0) {
            list = list.filter(job => activeFilters.level.includes(job.level));
        }
        if (activeFilters.company && activeFilters.company.length > 0) {
            list = list.filter(job => activeFilters.company.includes(job.companyId?.name || 'Unknown'));
        }
        if (activeFilters.postedWithin) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - activeFilters.postedWithin);
            list = list.filter(job => new Date(job.date || job.createdAt) >= cutoffDate);
        }

        // Search inputs from Hero component
        if (searchFilter.title) {
            list = list.filter(job => job.title.toLowerCase().includes(searchFilter.title.toLowerCase()));
        }
        if (searchFilter.location) {
            list = list.filter(job => job.location.toLowerCase().includes(searchFilter.location.toLowerCase()));
        }

        setFilteredJobs(list);
        setCurrentPage(1);
    }, [jobs, activeFilters, searchFilter]);

    return (
        <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8 gap-6'>
            {/* Sidebar Filters */}
            <div className={`${showFilter ? "block" : "max-lg:hidden"} w-full lg:w-1/4`}>
                <button onClick={() => setShowFilter(false)} className='w-full mb-4 px-4 py-2 bg-gray-100 border rounded lg:hidden text-sm font-medium'>
                    Close Filters
                </button>
                <JobSearchFilters onFilterChange={setActiveFilters} jobs={jobs} />
            </div>

            {/* Mobile Filter Trigger Button */}
            {!showFilter && (
                <div className='lg:hidden px-4'>
                    <button onClick={() => setShowFilter(true)} className='w-full px-6 py-2.5 rounded border border-gray-400 bg-white font-medium text-sm'>
                        Filters
                    </button>
                </div>
            )}

            {/* Job Listing */}
            <section className='w-full lg:w-3/4 text-gray-800 max-lg:px-4'>
                {/* Search tags */}
                {isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                    <div className='mb-6'>
                        <h3 className='font-medium text-lg mb-2'>Current Search</h3>
                        <div className='flex flex-wrap gap-2 text-gray-600'>
                            {searchFilter.title && (
                                <span className='inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded text-sm'>
                                    {searchFilter.title}
                                    <img onClick={() => setSearchFilter(prev=>({...prev,title:""}))} className='cursor-pointer w-3 h-3' src={assets.cross_icon} alt="" />
                                </span>
                            )}
                            {searchFilter.location && (
                                <span className='inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded text-sm'>
                                    {searchFilter.location}
                                    <img onClick={() => setSearchFilter(prev=>({...prev,location:""}))} className='cursor-pointer w-3 h-3' src={assets.cross_icon} alt="" />
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <h3 className='font-medium text-3xl py-2' id='job-list'>Latest Jobs</h3>
                <p className='mb-8 text-gray-500'>Get your desired job from top companies</p>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {filteredJobs.slice((currentPage-1)*12,currentPage*12).map((job,index)=>(
                        <JobCard key={index} job={job} />
                    ))}
                </div>

                {/* Pagination Section */}
                {filteredJobs.length > 0 && (
                    <div className='flex items-center justify-center space-x-2 mt-10'>
                        <a href="#job-list">
                            <img onClick={()=>setCurrentPage(Math.max(currentPage-1, 1))} src={assets.left_arrow_icon} alt="" />
                        </a>
                        {Array.from({length:Math.ceil(filteredJobs.length/12)}).map((_,index)=>(
                            <a key={index} href="#job-list">
                                <button onClick={()=>setCurrentPage(index+1)} className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded ${currentPage === index+1 ? 'bg-blue-100 text-blue-500 font-semibold' : 'text-gray-500'}`}>
                                    {index+1}
                                </button>
                            </a>
                        ))}
                        <a href="#job-list">
                            <img onClick={()=>setCurrentPage(Math.min(currentPage+1, Math.ceil(filteredJobs.length/6)))} src={assets.right_arrow_icon} alt="" />
                        </a>
                    </div>
                )}
                {filteredJobs.length === 0 && (
                    <div className='text-center py-12 text-gray-500 border rounded-lg bg-gray-50'>
                        No jobs matched your filter criteria. Try resetting the filters.
                    </div>
                )}
            </section>
        </div>
    )
}

export default JobListing
