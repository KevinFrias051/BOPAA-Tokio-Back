import axios, { AxiosInstance } from 'axios';

export const baseURL = 'http://ec2-54-145-211-254.compute-1.amazonaws.com:3000'; 

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default axiosInstance;