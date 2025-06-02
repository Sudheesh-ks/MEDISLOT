import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});


export const getDoctorsAPI = async () => {
  return await api.get('/api/doctor/list');
};