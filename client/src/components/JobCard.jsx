import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function JobCard({job}) {

    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    // Safely access company image from nested object
    const companyImage = job?.companyId?.image;
    const companyName = job?.companyId?.name || 'Unknown Company';

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className='border p-6 shadow rounded'>
            <div className='flex justify-between items-center'>
                {companyImage && !imageError ? (
                    <img 
                        className='h-8 object-contain' 
                        src={companyImage} 
                        alt={companyName}
                        onError={handleImageError}
                    />
                ) : (
                    <div className='h-8 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 font-semibold'>
                        {companyName.slice(0, 3).toUpperCase()}
                    </div>
                )}
            </div>
            <h4 className='font-medium text-xl mt-2'>{job.title}</h4>
            <p className='text-gray-600 text-sm'>{companyName}</p>
            <div className='flex items-center gap-3 mt-2 text-xs'>
                <span className='bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>{job.location}</span>
                <span className='bg-red-50 border border-red-200 px-4 py-1.5 rounded'>{job.level}</span>
            </div>
            <p className='text-gray-500 text-sm mt-4' dangerouslySetInnerHTML={{__html:job.description.slice(0,150)}}></p>
            <div className='mt-4 flex gap-4 text-sm'>
                <button onClick={()=>{navigate(`/apply-job/${job._id}`);scrollTo(0,0)}} className='bg-blue-600 text-white px-4 py-2 rounded'>Apply Now</button>
                <button onClick={()=>{navigate(`/apply-job/${job._id}`);scrollTo(0,0)}} className='text-gray-500 border border-gray-500 rounded px-4 py-2'>Learn More</button>
            </div>
        </div>
    )
}

export default JobCard
