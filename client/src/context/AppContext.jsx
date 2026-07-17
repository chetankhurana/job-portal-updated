import { createContext, useEffect } from "react";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import { jobsData } from "../assets/assets";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const {user} = useUser()
    const {getToken} = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title:'',
        location:''
    });

    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([]);

    const [showRecruiterLogin , setShowRecruiterLogin] = useState(false);

    const [companyToken , setCompanyToken] = useState(null)
    const [companyData , setCompanyData] = useState(null)
    const [userData,setUserData] = useState(null)
    const [userApplications,setUserApplications] = useState([])

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const formatImageUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http://localhost:3000')) {
            return url.replace('http://localhost:3000', backendUrl);
        }
        return url;
    }


    //function to fetch job data
    const fetchJobs = async () => {
        try {
            
            const { data } = await axios.get(backendUrl+'/api/jobs')
            if(data.success){
                const formattedJobs = data.jobs.map(job => {
                    if (job.companyId && job.companyId.image) {
                        job.companyId.image = formatImageUrl(job.companyId.image);
                    }
                    return job;
                });
                setJobs(formattedJobs)
                console.log(formattedJobs)
            }
            else{
                setJobs(jobsData)
                toast.info('Showing demo jobs until the database reconnects')
            }

        } catch {
            setJobs(jobsData)
            toast.info('Showing demo jobs until the database reconnects')
        }
    }

    //function ot fetch user data
    const fetchUserData = async () => {
        try {
            
            const token = await getToken()
            const {data} = await axios.get(backendUrl+'/api/users/user',
            {headers:{Authorization:`Bearer ${token}`}})

            if(data.success){
                setUserData(data.user)
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to fetch company data
    const fetchCompanyData = async () => {
        try {
            
            const {data} = await axios.get(backendUrl+'/api/company/company',{headers:{token:companyToken}})

            if(data.success){
                if (data.company && data.company.image) {
                    data.company.image = formatImageUrl(data.company.image);
                }
                setCompanyData(data.company)
                console.log(data);
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUserApplications = async () => {
        try {
            
            const token = await getToken()
            const {data} = await axios.get(backendUrl+'/api/users/applications',
            {headers:{Authorization:`Bearer ${token}`}})
            

            if(data.success){
                const formattedApps = data.applications.map(app => {
                    if (app.jobId && app.jobId.companyId && app.jobId.companyId.image) {
                        app.jobId.companyId.image = formatImageUrl(app.jobId.companyId.image);
                    }
                    return app;
                });
                setUserApplications(formattedApps)
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchJobs() 
        const storedCompanyToken = localStorage.getItem('companyToken')
        if(storedCompanyToken){
            setCompanyToken(storedCompanyToken);
        }
    },[])

    useEffect(()=>{
        if(companyToken){
            fetchCompanyData();
        }
    } , [companyToken])

    useEffect(()=>{
        if(user){
            fetchUserData()
            fetchUserApplications()
        }
    } , [user])

    const value = {
        setSearchFilter,searchFilter,
        isSearched,setIsSearched,
        jobs,setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken , setCompanyToken,
        companyData , setCompanyData,
        backendUrl,
        userData , setUserData , 
        userApplications , setUserApplications,
        fetchUserData , fetchUserApplications
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </ AppContext.Provider>)
}
