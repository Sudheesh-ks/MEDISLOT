import { useState } from 'react';

// New Password Page Component
const NewPasswordPage = () => {

  
  return (
   <form className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>Set New Password</p>
        <p>Create a strong password for your account</p>
        {
        
          <div className='w-full'>
            <p>New Password</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text"  required />
          </div>
        }
        <div className='w-full'>
          <p>Confirm Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" required />
        </div>
        
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>Set New Password</button>
        {
          
        }
      </div>

    </form>
  );
};

export default NewPasswordPage;