import { useEffect, useState, createContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/vars';

export const AuthContext = createContext();

function AuthHOC({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        async function verifyToken() {
            const token = localStorage.getItem('token');
            const publicRoutes = ['/', '/signin', '/signup'];

            // If on a public route, don’t redirect even if token is missing
            if (!token && publicRoutes.includes(location.pathname)) {
                setLoading(false);
                return;
            }

            // If token missing on a protected route, redirect to signin
            if (!token) {
                navigate('/signin');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.post(
                    `${BASE_URL}/api/v1/auth/validate`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.ok) {
                    setUser(response.data.user);
                } else {
                    localStorage.removeItem('token');
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                localStorage.removeItem('token');
                if (!publicRoutes.includes(location.pathname)) {
                    navigate('/signin');
                }
            } finally {
                setLoading(false);
            }
        }

        verifyToken();
    }, [navigate, location.pathname]);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}

export default AuthHOC;
