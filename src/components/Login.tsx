// src/components/Login.tsx
/*
import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNeedsVerification(false);
    
    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      // Check if user is admin based on response and navigate accordingly
      if (response.user && response.user.isAdmin) {
        navigate('/admin_dashboard');
      } else {
        navigate('/monitor');
      }
    } catch (err) {
      setIsLoading(false);
      
      // Check if the error is related to email verification
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      
      if (errorMessage.includes('verify your email')) {
        setNeedsVerification(true);
      } else {
        setError(errorMessage);
      }
    }
  };

  if (needsVerification) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verification Required</h2>
          <p className="text-gray-600 mb-4">You need to verify your email address before you can log in.</p>
          <button
            onClick={() => navigate(`/resend-verification?email=${formData.email}`)}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium text-white transition-colors mb-4"
          >
            Resend Verification Email
          </button>
          <button
            onClick={() => setNeedsVerification(false)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Forgot password?
          </a>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`cursor-pointer w-full py-2 px-4 rounded-md font-medium text-white ${
            isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.188-2.707-6.735-2.707-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-7.584 10-10 0-0.665-0.058-1.319-0.173-1.958h-9.825z"/>
              </svg>
              Google
            </div>
          </button>
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
              </svg>
              Facebook
            </div>
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => navigate('/register')}>
          Sign up
        </a>
      </div>
    </div>
  );
};

export default Login;


*/
import React, { useState, useEffect } from 'react';
import { login, resendVerification } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface VerificationError {
  isVerificationError: true;
  message: string;
  email: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState({
    show: false,
    email: '',
  });
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Clear resend success when returning to verification view
  useEffect(() => {
    if (needsVerification.show) {
      setResendSuccess(false);
    }
  }, [needsVerification.show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.user?.isAdmin) {
        navigate('/admin_dashboard');
      } else {
        navigate('/monitor');
      }
    } catch (err) {
      setIsLoading(false);
      
      if (isVerificationError(err)) {
        setNeedsVerification({
          show: true,
          email: err.email
        });
      } else {
        setError(
          err instanceof Error ? err.message : 'Login failed. Please try again.'
        );
      }
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      await resendVerification(needsVerification.email);
      setResendSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to resend verification email'
      );
    } finally {
      setIsResending(false);
    }
  };

  /*
  const isVerificationError = (error: any): error is VerificationError => {
    return error?.isVerificationError === true;
  };
  */
  const isVerificationError = (error: unknown): error is VerificationError => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isVerificationError' in error &&
      error.isVerificationError === true &&  // Type-safe check
      'message' in error &&
      'email' in error
    );
  };







  if (needsVerification.show) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">
            Email Verification Required
          </h2>
          
          <p className="text-gray-600 mb-4">
            Please verify your email address (<span className="font-medium">{needsVerification.email}</span>) before logging in.
          </p>

          {resendSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              Verification email resent successfully!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                isResending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>
            
            <button
              onClick={() => setNeedsVerification({ show: false, email: '' })}
              className="w-full py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ... rest of your existing login form JSX ...
  // (Keep all your current return JSX for the login form)
  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Forgot password?
          </a>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`cursor-pointer w-full py-2 px-4 rounded-md font-medium text-white ${
            isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.188-2.707-6.735-2.707-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-7.584 10-10 0-0.665-0.058-1.319-0.173-1.958h-9.825z"/>
              </svg>
              Google
            </div>
          </button>
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
              </svg>
              Facebook
            </div>
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => navigate('/register')}>
          Sign up
        </a>
      </div>
    </div>
  );
};

export default Login;