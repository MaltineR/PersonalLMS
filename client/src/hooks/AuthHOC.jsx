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
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const publicRoutes = ['/', '/signin', '/signup'];

      if (!token) {
        if (!publicRoutes.includes(location.pathname)) navigate('/signin');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${BASE_URL}/api/v1/auth/validate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.ok && response.data.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          if (!publicRoutes.includes(location.pathname)) navigate('/signin');
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        localStorage.removeItem('token');
        setUser(null);
        if (!publicRoutes.includes(location.pathname)) navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {loading ? (
        <div className="h-screen flex items-center justify-center text-2xl">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export default AuthHOC;
