import React, { useContext, useEffect } from 'react'
import Quill from 'quill';
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import {toast} from 'react-toastify'

function AddJob() {

    const [title, setTitle] = React.useState('');
    const [location, setLocation] = React.useState('Bangalore');
    const [category, setCategory] = React.useState('Programming');
    const [level, setLevel] = React.useState('Beginner Level');
    const [salary, setSalary] = React.useState(0);
    const editorRef = React.useRef(null);
    const quillRef = React.useRef(null);
    const {backendUrl , companyToken} = useContext(AppContext)

    useEffect(()=>{
        //Initiate Quill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current , {
                theme: 'snow',
            })
        }
    } , [])

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            
            const description = quillRef.current.root.innerHTML

            const {data} = await axios.post(backendUrl + '/api/company/post-job',{
                title,description,salary,category,level,location
            },
            {headers:{token:companyToken}})

            if(data.success){
                toast.success("Job created Successfully")
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML = ""
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full items-start gap-3'>
            <div className='w-full'>
                <p className='mb-2'>Job Title</p>
                <input className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded' type="text" placeholder='Type Here' onChange={e => setTitle(e.target.value)} value={title} required />
            </div>

            <div className='w-full max-w-lg'>
                <p className='my-2'>Job Description</p>
                <div ref={editorRef}>

                </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2'>Job Category</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setCategory(e.target.value)}>
                        {JobCategories.map((category , index)=>(
                            <option value={category} key={index}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Job Location</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLocation(e.target.value)}>
                        {JobLocations.map((location , index)=>(
                            <option value={location} key={index}>{location}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Job Level</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLevel(e.target.value)}>
                        <option value="Beginner Level">Beginner Level</option>
                        <option value="Intermediate Level">Intermediate Level</option>
                        <option value="Senior Level">Senior Level</option>
                    </select>
                </div>
            </div>
            <div>
                <p className='mb-2'>Job Salary</p>
                <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' type="number" placeholder='2500' onChange={e => setSalary(e.target.value)} />
            </div>
            <button className='w-28 py-3 mt-4 bg-black text-white rounded'>ADD</button>
        </form>
    )
}

export default AddJob
