import { useEffect, useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/vars';

export const AuthContext = createContext();

function AuthHOC({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function verifyToken() {
            const token = localStorage.getItem('token');
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
                 console.log("AuthHOC received user:", response.data.user);  // <── ADD THIS
                 setUser(response.data.user);
                } else {
                    localStorage.removeItem('token');
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                localStorage.removeItem('token');
                navigate('/signin');
            } finally {
                setLoading(false);
            }
        }

        verifyToken();
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}

export default AuthHOC;
