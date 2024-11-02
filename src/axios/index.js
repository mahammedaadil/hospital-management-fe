import axios from 'axios';

// Create an instance of Axios

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl, // Replace with your actual base URL
  // timeout: 5000, // Set a timeout (optional)
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token or any other headers here
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

export default axiosInstance