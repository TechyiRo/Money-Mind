import axios from 'axios';

let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (backendUrl.endsWith('/')) {
  backendUrl = backendUrl.slice(0, -1);
}
if (!backendUrl.endsWith('/api')) {
  backendUrl += '/api';
}

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export default api;
