import { UserRound } from 'lucide-react'
import React from 'react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/vars';



function TopBar() {
  const [user, setUser] = useState(null);
const [token, setToken] = useState(null)
  
  useEffect(() => {

    async function fetchUser() {
      try {
        const userdata = await axios.get(`${BASE_URL}/api/v1/user/me`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }

        });
        if (userdata && userdata.data) {
          console.log("User data fetched successfully:", userdata.data);
          
          setUser(userdata.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      }
    }
     

    fetchUser();
  }, []);

  

  return (
    <div className="w-full px-13 h-[80px] flex items-center justify-end py-5">
      <div className="h-[60px] w-[60px] bg-white rounded-full flex items-center justify-center border border-[var(--grey)]">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="User Avatar"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <UserRound className="h-8 w-8 text-gray-400" />
        )}
      </div>
      <Link to="signup">
        <button
          className="ml-4 px-4 py-2 bg-[var(--grey)] text-black rounded hover:bg-gray-300 transition"
        >
          Logout
        </button>
      </Link>
    </div>
  );
}

export default TopBar