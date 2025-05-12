import React from 'react'
import { Route } from 'react-router-dom'


// Layout
import DoctorLayout from '../layouts/DoctorLayout';


// Doctor Pages
import DoctorLogin from '../pages/admin/AdminLogin';



const DoctorRoutes = () => {
  return (
    <>
        {/* Doctor Routes */}
        <Route path='/doctor/login' element={ <DoctorLayout><DoctorLogin /></DoctorLayout> } />
      
    </>
  )
}

export default DoctorRoutes
