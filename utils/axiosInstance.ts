import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // important for Sanctum cookies
});

export default axiosInstance;
