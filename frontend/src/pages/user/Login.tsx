import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/user/assets';
import { isValidEmail, isValidPassword } from '../../utils/validator';



const Login = () => {


  const navigate = useNavigate()

  const context = useContext(AppContext);

  if (!context) {
    throw new Error("TopDoctors must be used within an AppContextProvider");
  }

  const { backendUrl, token, setToken } = context;

  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')


  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()


    if (!email || !password || (state === "Sign Up" && !name)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      toast.error("Password must be at least 8 characters long, include 1 number and 1 special character.");
      return;
    }


    try {

      if (state === 'Sign Up') {

        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (data.success) {
          localStorage.setItem("tempUserData", JSON.stringify({ email, name, purpose: 'register' }));
          toast.success("OTP sent to your email");
          navigate('/verify-otp');
        } else {
          toast.error(data.message)
        }

      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data?.message || 'Something went wrong')
        }
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || "Something went wrong";
        toast.error(errorMsg);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  }


  useEffect(() => {
    if (token) {
      navigate('/')
    }
  })

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center'>
  <div className='flex flex-col mt-40 sm:flex-row bg-white shadow-lg rounded-xl overflow-hidden'>
    
    {/* LEFT: Image section */}
    <div className='hidden sm:block w-full sm:w-96'>
      <img 
        src={assets.contact_image}  // replace with your image path
        alt="Login Visual"
        className='w-full h-full object-cover'
      />
    </div>

    {/* RIGHT: Form section */}
    <div className='flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 text-zinc-600 text-sm'>
      <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
      <p>Please {state === 'Sign Up' ? "sign up" : "login"} to book appointment</p>

      {state === 'Sign Up' && (
        <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setName(e.target.value)} value={name} required />
        </div>
      )}

      <div className='w-full'>
        <p>Email</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
      </div>

      <div className='w-full'>
        <p>Password</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
      </div>

      {state === 'Login' && (
        <div className="w-full text-right text-sm mt-1">
          <span
            onClick={() => navigate('/verify-email')}
            className="text-primary cursor-pointer hover:underline"
          >
            Forgot Password?
          </span>
        </div>
      )}

      <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state === 'Sign Up' ? "Create Account" : "Login"}</button>

      <button
        type='button'
        onClick={() => window.location.href = `${backendUrl}/api/auth/google`}
        className='flex items-center justify-center gap-2 border border-zinc-300 w-full py-2 rounded-md mt-2 hover:bg-zinc-100'
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

      <p className='mt-2'>
        {state === "Sign Up" ? (
          <>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></>
        ) : (
          <>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></>
        )}
      </p>
    </div>
  </div>
</form>

  )
}

export default Login
