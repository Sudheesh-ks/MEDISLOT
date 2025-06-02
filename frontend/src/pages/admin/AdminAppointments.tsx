import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext';

const AdminAppointments = () => {


  const navigate = useNavigate();
    const context = useContext(AdminContext);

    if (!context) {
    throw new Error('AdminContext must be used within AdminContextProvider');
  }

  const { aToken } = context;

  useEffect(() => {
    if(!aToken){
      navigate('/admin/login')
    }
  })


  return (
    <div>
      
    </div>
  )
}

export default AdminAppointments
