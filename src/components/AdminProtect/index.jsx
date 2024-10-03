import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtect = ({ children }) => {
  const navigate = useNavigate();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(null); // null for loading state

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate('/login');
    } else {
      setIsAdminAuthenticated(true);
    }
  }, [navigate]);

  if (isAdminAuthenticated === null) {
    return <div>Loading...</div>; // Simple text-based loading message
  }

  return (
    <>
      {isAdminAuthenticated && children}
    </>
  );
}

export default AdminProtect;

