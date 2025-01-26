import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://192.168.0.5:5000/api", // Replace with your local IP address for Expo
  timeout: 10000, // Timeout for requests (in milliseconds)
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can log or modify the request config here if needed
    console.log("Request Config:", config);
    return config; // Proceed with the request
  },
  (error) => {
    // Handle request errors
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "Response Error:",
        error.response.status,
        error.response.data
      );
      if (error.response.status === 401) {
        console.log("Unauthorized request. Please log in.");
      }
    } else {
      console.error("Network Error or Server Unreachable");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
