import React, { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/admin/assets';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {

  const context = useContext(AdminContext);
      
          if (!context) {
              throw new Error('AdminContext must be used within AdminContextProvider');
          }
      
          const { aToken } = context;

  return (
    <div className='min-h-screen bg-white border-r'>
      {
        // aToken &&
         <ul className='text-[#515151] mt-5'>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/dashboard'>
            <img src={assets.home_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/user-management'>
            <img src={assets.people_icon} alt="" />
            <p>Manage Users</p>
          </NavLink>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/appointments'>
            <img src={assets.appointment_icon} alt="" />
            <p>Appointments</p>
          </NavLink>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/add-doctor'>
            <img src={assets.add_icon} alt="" />
            <p>Add Doctor</p>
          </NavLink>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/update-doctor'>
            <img src={assets.people_icon} alt="" />
            <p>Update Doctor</p>
          </NavLink>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/all-doctors'>
            <img src={assets.people_icon} alt="" />
            <p>Doctor List</p>
          </NavLink>

          <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#2F3FF] border-r-4 border-primary' : ''}`} to='/admin/inbox'>
            <img src={assets.appointment_icon} alt="" />
            <p>Inbox</p>
          </NavLink>

        </ul>
      }
    </div>
  )
}

export default AdminSidebar
