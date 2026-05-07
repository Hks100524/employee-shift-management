import { createContext, useContext, useEffect, useMemo, useState } from "react";

import authService from "../services/authService.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "ems_token";
const USER_KEY = "ems_user";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistAuth = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    let ignore = false;

    const bootstrap = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();

        if (!ignore) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
          setUser(response.data.data);
        }
      } catch (_error) {
        if (!ignore) {
          clearAuth();
        }
      } finally {
        if (!ignore) {
          setAuthLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (payload) => {
    const response = await authService.login(payload);
    persistAuth(response.data.token, response.data.data);
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    persistAuth(response.data.token, response.data.data);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_error) {
      // Best-effort logout on the server, local cleanup still happens.
    } finally {
      clearAuth();
    }
  };

  const value = useMemo(
    () => ({
      authLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      register,
      setUser,
      token,
      user,
    }),
    [authLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
