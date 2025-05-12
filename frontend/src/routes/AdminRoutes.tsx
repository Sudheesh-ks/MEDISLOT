import React from 'react'
import { Route } from 'react-router-dom'


// Layout
import AdminLayout from '../layouts/AdminLayout';


// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAppointments from '../pages/admin/AdminAppointments';
import AdminAddDoctor from '../pages/admin/AdminAddDoctor';
import AdminUpdateDoctor from '../pages/admin/AdminUpdateDoctor';
import AdminDoctorList from '../pages/admin/AdminDoctorList';
import AdminInbox from '../pages/admin/AdminInbox';



const AdminRoutes = () => {
  return (
    <>

            {/* Admin Routes */}
            <Route path='/admin/login' element={ <AdminLogin /> } />
            <Route path='/admin/dashboard' element={ <AdminLayout><AdminDashboard /></AdminLayout> } />
            <Route path='/admin/appointments' element={ <AdminLayout><AdminAppointments /></AdminLayout> } />
            <Route path='/admin/add-doctor' element={ <AdminLayout><AdminAddDoctor /></AdminLayout> } />
            <Route path='/admin/update-doctor' element={ <AdminLayout><AdminUpdateDoctor /></AdminLayout> } />
            <Route path='/admin/all-doctors' element={ <AdminLayout><AdminDoctorList /></AdminLayout> } />
            <Route path='/admin/inbox' element={ <AdminLayout><AdminInbox /></AdminLayout> } />

    </>
  )
}

export default AdminRoutes
