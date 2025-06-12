import React from 'react'
import VideoCallCard from '../../components/user/VideoCallCard'
import ChatCard from '../../components/user/ChatCard'

const Consultation = () => {
  return (
    <div className='flex place-items-center justify-center gap-6 p-8'>
      < VideoCallCard />
      < ChatCard />
    </div>
  )
}

export default Consultation
