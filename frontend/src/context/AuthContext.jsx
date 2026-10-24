import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, logoutApi, getMeApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('maruthuvam_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await getMeApi();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username, password) => {
    const data = await loginApi(username, password);
    localStorage.setItem('maruthuvam_access_token', data.access_token);
    localStorage.setItem('maruthuvam_refresh_token', data.refresh_token);
    await fetchCurrentUser();
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
    localStorage.setItem('maruthuvam_access_token', data.access_token);
    localStorage.setItem('maruthuvam_refresh_token', data.refresh_token);
    await fetchCurrentUser();
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
