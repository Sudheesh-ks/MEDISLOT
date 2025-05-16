import { useState } from 'react';

// 1. Email Verification Page Component
const EmailVerificationPage = () => {

  
  return (
    <form className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>Verify Your Email</p>
        <p>Please enter your email to receive a verification code</p>
        
        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" required />
        </div>
        
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>Send Verification Code</button>
        {
          
        }
      </div>

    </form>
  );
};

export default EmailVerificationPage;