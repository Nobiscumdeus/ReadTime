// src/services/authService.ts
import axios from 'axios';

const API_URL=import.meta.env.VITE_APP_API_URL|| 'https://readtime.onrender.com';
import { UserData ,RegisterData,LoginData} from '../types/auth';


export interface AuthResponse {
    success: boolean;
    message?: string;  // Optional if not always present
    token?: string;
    user: {           // Matches your backend response
      isAdmin: boolean;
      // Add other properties your frontend uses
      // (Only include what you actually need)
    };
  }
export interface VerificationError {
    isVerificationError: true;
    message: string;
    email: string;
  }

// Set authentication token for protected routes
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

// Register user - now handles email verification flow
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/register`, userData);
    
    // Note: We don't set the token here anymore as the user needs to verify their email first
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error('Registration failed. Please try again.');
  }
};

// Verify email
export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axios.get<AuthResponse>(`${API_URL}/api/auth/verify/${token}`);
    
    // Save token after email verification
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Email verification failed");
    }
    throw new Error('Email verification failed. Please try again.');
  }
};

/*
// Resend verification email
export const resendVerification = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/resend-verification`, { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to resend verification email");
    }
    throw new Error('Failed to resend verification email. Please try again.');
  }
};
*/
// Add to your authService.ts
/*
--------------------------2
export const resendVerification = async (email: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-verification`, { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend verification');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to resend verification');
      }
      throw new Error('Failed to resend verification');
    }
  };
*/
export const resendVerification = async (email: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-verification`, { 
        email 
      }, {
        timeout: 10000 // 10 second timeout
      });
  
      if (!response.data.success) {
        // Handle business logic failures (like already verified)
        throw new Error(response.data.message || 'Verification failed');
      }
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle network errors and HTTP errors
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Network error during verification resend';
        throw new Error(errorMessage);
      }
      throw new Error('Failed to resend verification');
    }
  };


// Login users - now checks for verified emails
/*
export const login = async (userData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/login`, userData);
    
    // Save token to localStorage and set axios headers
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Login failed. Please try again.');
  }
};
*/


export const login = async (userData: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/login`, userData);
      
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) ){
        const responseData = error.response?.data;
        
        // Handle verification required case
        if (error.response?.status === 403 && responseData?.needsVerification) {
          const verificationError: VerificationError = {
            isVerificationError: true,
            message: responseData.message,
            email: responseData.email
          };
          throw verificationError;
        }
        
        // Handle other error cases
        throw new Error(responseData?.message || 'Login failed');
      }
      throw new Error('Network error. Please try again.');
    }
  };











// Logout user
export const logout = (): void => {
  localStorage.removeItem('token');
  setAuthToken(null);
};

// Get current user
export const getCurrentUser = async (): Promise<UserData> => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Make API request to get current user details
    const response = await axios.get(`${API_URL}/api/user`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Initialize - Call this when your app loads
export const initializeAuth = (): void => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
};

export default {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  isAuthenticated,
  setAuthToken,
  initializeAuth
};