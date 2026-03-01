import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
    // Try to get a fresh token from Firebase Auth SDK first
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
        // getIdToken(true) forces a refresh if the token is expired
        const freshToken = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${freshToken}`;
        // Keep localStorage in sync
        localStorage.setItem('token', freshToken);
    } else {
        // Fallback to stored token (for initial page load before Firebase initializes)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
