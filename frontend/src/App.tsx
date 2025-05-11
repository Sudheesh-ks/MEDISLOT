import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';


// Layouts
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import DoctorLayout from './layouts/DoctorLayout'


// User Pages
import Home from './pages/user/Home'
import Doctors from './pages/user/Doctors'
import Contact from './pages/user/Contact'
import About from './pages/user/About'
import Login from './pages/user/Login'
import MyProfile from './pages/user/MyProfile'
import MyAppointments from './pages/user/MyAppointments'
import Appointment from './pages/user/Appointment'


// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'


// Doctor Pages
import DoctorLogin from './pages/admin/AdminLogin'


const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      
      <Routes>

        {/* User Routes */}
        <Route path='/' element={ <UserLayout><Home /></UserLayout> } />
        <Route path='/login' element={ <UserLayout><Login /></UserLayout> } />
        <Route path='/doctors' element={ <UserLayout><Doctors /></UserLayout>} />
        <Route path='/doctors/:speciality' element={ <UserLayout><Doctors /></UserLayout>} />
        <Route path='/about' element={ <UserLayout><About /></UserLayout>} />
        <Route path='/contact' element={ <UserLayout><Contact /></UserLayout>} />
        <Route path='/my-profile' element={ <UserLayout><MyProfile /></UserLayout>} />
        <Route path='/my-appointments' element={ <UserLayout><MyAppointments /></UserLayout>} />
        <Route path='/appointment/:docId' element={ <UserLayout><Appointment /></UserLayout>} />

        {/* Admin Routes */}
        <Route path='/admin/login' element={ <AdminLayout><AdminLogin /></AdminLayout> } />

        {/* Doctor Routes */}
        <Route path='/doctor/login' element={ <DoctorLayout><DoctorLogin /></DoctorLayout> } />

      </Routes>

      <ToastContainer />
      
    </div>
  )
}

export default App
