"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { setCookie, getCookie, eraseCookie } from "@/lib/cookies";
import { apiClient, LoginCredentials, ApiError } from "@/lib/apiClient";
import AuthLoader from "@/components/AuthLoader";
import config from "@/lib/config";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  loginAttempts?: number;
  assignments?: number;
  changePassword?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      const storedAuth = localStorage.getItem(config.auth.cookieKey);
      const cookieAuth = getCookie(config.auth.cookieKey);
      const token = localStorage.getItem(config.auth.tokenKey);
      
      if ((storedAuth === "true" || cookieAuth === "true") && token) {
        try {
          // Verify token with the API
          const response = await apiClient.verifyToken();
          if (response.valid) {
            setIsAuthenticated(true);
            
            // Always fetch fresh user data from database on page load
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              const localUser = JSON.parse(savedUser);
              if (localUser.id) {
                try {
                  console.log('Fetching fresh user data from database on page load...');
                  const userDetailsResponse = await apiClient.getUserProfile(localUser.id.toString());
                  const userData = userDetailsResponse?.data;
                  
                  if (userData) {
                    const freshUser = {
                      id: userData.id?.toString() || localUser.id,
                      username: userData.username,
                      email: userData.email,
                      role: userData.userRole || userData.role,
                      phone: userData.phone,
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      jobTitle: userData.jobTitle,
                      active: userData.active,
                      createdAt: userData.createdAt,
                      updatedAt: userData.updatedAt,
                      lastLogin: userData.lastLogin,
                      loginAttempts: userData.loginAttempts,
                      assignments: userData.assignments,
                      changePassword: userData.changePassword,
                    };
                    
                    console.log('Fresh user data loaded from database:', freshUser);
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                  } else {
                    // Fallback to localStorage data if API fails
                    console.warn('Failed to fetch fresh user data, using localStorage fallback');
                    setUser(localUser);
                  }
                } catch (userFetchError) {
                  console.error('Failed to fetch fresh user data, using localStorage fallback:', userFetchError);
                  setUser(localUser);
                }
              } else {
                console.warn('No user ID found in localStorage');
                setUser(localUser);
              }
            } else if (response.user) {
              // Use user data from token verification if available
              setUser(response.user);
            }
          } else {
            // Token is invalid, clear auth state
            clearAuthState();
          }
        } catch (error) {
          console.warn("Token verification failed, but keeping auth state:", error);
          // Don't clear auth state on verification failure - user might still be logged in
          // Just set authenticated based on stored values but try to fetch fresh data
          setIsAuthenticated(true);
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const localUser = JSON.parse(savedUser);
            if (localUser.id) {
              try {
                console.log('Token verification failed, but fetching fresh user data...');
                const userDetailsResponse = await apiClient.getUserProfile(localUser.id.toString());
                const userData = userDetailsResponse?.data;
                
                if (userData) {
                  const freshUser = {
                    id: userData.id?.toString() || localUser.id,
                    username: userData.username,
                    email: userData.email,
                    role: userData.userRole || userData.role,
                    phone: userData.phone,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    jobTitle: userData.jobTitle,
                    active: userData.active,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                    lastLogin: userData.lastLogin,
                    loginAttempts: userData.loginAttempts,
                    assignments: userData.assignments,
                    changePassword: userData.changePassword,
                  };
                  
                  setUser(freshUser);
                  localStorage.setItem('user', JSON.stringify(freshUser));
                } else {
                  setUser(localUser);
                }
              } catch (userFetchError) {
                console.error('Failed to fetch fresh user data during fallback:', userFetchError);
                setUser(localUser);
              }
            } else {
              setUser(localUser);
            }
          }
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const clearAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(config.auth.cookieKey);
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem('user');
    eraseCookie(config.auth.cookieKey);
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const credentials: LoginCredentials = { username, password };
      const response = await apiClient.login(credentials);
      
      console.log('Login response:', response);
      
      if (response.status === "SUCCESS" && response.data) {
        try {
          // Extract user ID from the login response structure
          const userId = response.data.user.id;
          console.log('Extracted user ID:', userId);
          
          if (userId) {
            try {
              console.log('Fetching detailed user info for ID:', userId);
              const userDetailsResponse = await apiClient.getUserProfile(userId.toString());
              console.log('Detailed user info response:', userDetailsResponse);
              
              // Extract user data from the API response structure
              const userData = userDetailsResponse?.data;
              console.log('Extracted user data from API:', userData);
              
              if (userData) {
                // Create user object with detailed information from database
                console.log('Creating user object from database data:', userData);
                const user: User = {
                  id: userData.id?.toString() || userId.toString(),
                  username: userData.username,
                  email: userData.email,
                  role: userData.userRole || userData.role,
                  phone: userData.phone,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  jobTitle: userData.jobTitle,
                  active: userData.active,
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt,
                  lastLogin: userData.lastLogin,
                  loginAttempts: userData.loginAttempts,
                  assignments: userData.assignments,
                  changePassword: userData.changePassword,
                };
                
                console.log('Final user object created from database:', user);
                
                setIsAuthenticated(true);
                setUser(user);
                localStorage.setItem(config.auth.cookieKey, "true");
                localStorage.setItem('user', JSON.stringify(user));
                setCookie(config.auth.cookieKey, "true", config.auth.cookieExpiration);
                
                // Store the token from login response
                if (response.data.token) {
                  localStorage.setItem(config.auth.tokenKey, response.data.token);
                }
                
                console.log('Login successful with database user data');
                return { success: true };
              } else {
                throw new Error('No user data received from database');
              }
            } catch (userFetchError) {
              console.error('Failed to fetch detailed user info from database:', userFetchError);
              return { 
                success: false, 
                error: "Failed to load user profile. Please try again." 
              };
            }
          } else {
            console.error('No user ID found in login response');
            return { 
              success: false, 
              error: "Invalid login response. Please try again." 
            };
          }
        } catch (error) {
          console.error('Error processing user details:', error);
          // Fall back to basic user creation if detailed fetch fails
          const basicUser: User = {
            id: response.user?.id || Date.now().toString(),
            username: response.user?.username || username,
            email: response.user?.email,
            role: response.user?.role
          };
          
          setIsAuthenticated(true);
          setUser(basicUser);
          localStorage.setItem(config.auth.cookieKey, "true");
          localStorage.setItem('user', JSON.stringify(basicUser));
          setCookie(config.auth.cookieKey, "true", config.auth.cookieExpiration);
          
          if (response.token) {
            localStorage.setItem(config.auth.tokenKey, response.token);
          }
          
          return { success: true };
        }
      } else {
        console.log('Login failed:', response.message);
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      return { 
        success: false, 
        error: apiError.message || "Network error occurred. Please check your connection." 
      };
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      try {
        const userDetailsResponse = await apiClient.getUserProfile(user.id.toString());
        const userData = userDetailsResponse?.data;
        
        if (userData) {
          const refreshedUser: User = {
            id: userData.id?.toString() || user.id,
            username: userData.username,
            email: userData.email,
            role: userData.userRole || userData.role,
            phone: userData.phone,
            firstName: userData.firstName,
            lastName: userData.lastName,
            jobTitle: userData.jobTitle,
            active: userData.active,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLogin: userData.lastLogin,
            loginAttempts: userData.loginAttempts,
            assignments: userData.assignments,
            changePassword: userData.changePassword,
          };
          
          setUser(refreshedUser);
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Try to logout from the API
      await apiClient.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, refreshUser, isLoading }}>
      {isLoading ? <AuthLoader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
