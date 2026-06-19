import React, { useContext, useEffect } from 'react'
import {Route , Routes} from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import CareerToolkit from './pages/CareerToolkit'
import RecruiterInsights from './pages/RecruiterInsights'
import 'quill/dist/quill.snow.css'; // Import Quill styles
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { usePWA, PWAInstallBanner } from './hooks/usePWA'

function App() {

  const {showRecruiterLogin , companyToken} = useContext(AppContext);
  
  // Initialize PWA
  usePWA();

  return (
    <div>
      <PWAInstallBanner />
      { showRecruiterLogin && <RecruiterLogin /> }
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications/>} />
        <Route path='/career-toolkit' element={<CareerToolkit />} />
          <Route path='/dashboard' element={<Dashboard />}>
            {companyToken ? <>
              <Route path='add-job' element={<AddJob />} />
              <Route path='manage-jobs' element={<ManageJobs />} />
              <Route path='view-applications' element={<ViewApplications />} />
              <Route path='insights' element={<RecruiterInsights />} />
            </> : null
            }
          </Route>
      </Routes>
    </div>
  )
}

export default App
