import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { loginRequest } from '../api/authApi.js';
import { fetchMe } from '../api/usersApi.js';
import { DEV_CREDENTIALS, DEV_TOKEN, DEV_USER } from '../constants/devAuth.js';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  const loadUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (token === DEV_TOKEN) {
      setUser(DEV_USER);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const me = await fetchMe();
      setUser(me);
    } catch (error) {
      console.error('Error loading user', error);
      setUser(null);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (credentials) => {
      if (
        credentials.username === DEV_CREDENTIALS.username &&
        credentials.password === DEV_CREDENTIALS.password
      ) {
        localStorage.setItem('token', DEV_TOKEN);
        setToken(DEV_TOKEN);
        setUser(DEV_USER);
        setLoading(false);
        return;
      }
      const data = await loginRequest(credentials);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setLoading(true);
      try {
        const me = await fetchMe();
        setUser(me);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      loadUser,
      isAdmin: Boolean(user?.is_admin)
    }),
    [loading, loadUser, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
