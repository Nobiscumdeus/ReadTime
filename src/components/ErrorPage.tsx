import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

interface ErrorPageProps {
  error?: string;
  title?: string;
  buttonText?: string;
  redirectPath?: string;
  showSupportLink?: boolean;
  showLogoutButton?: boolean;
  customAction?: () => void;
}

const ErrorPage = ({
  error = "Something went wrong",
  title = "Oops!",
  buttonText = "Return to Login",
  redirectPath = "/",
  showSupportLink = true,
  showLogoutButton = false, // Changed default to false
  customAction
}: ErrorPageProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(redirectPath);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleAction = () => {
    if (customAction) {
      customAction();
    } else {
      navigate(redirectPath);
    }
  };

  // Determine which button to show
  const showPrimaryButton = !showLogoutButton || customAction;
  const showSecondaryButton = showLogoutButton && !customAction;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 to-violet-300 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        {/* Error message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-red-600 font-medium mb-6">{error}</p>
        
        {/* Primary action button (only shows when not showing logout) */}
        {showPrimaryButton && (
          <button
            onClick={handleAction}
            className="w-full mb-4 cursor-pointer bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-50"
          >
            {buttonText}
          </button>
        )}
        
        {/* Logout button (only shows when no custom action) */}
        {showSecondaryButton && (
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-50"
          >
            Log Out
          </button>
        )}
        
        {/* Optional support link */}
        {showSupportLink && (
          <p className="mt-6 text-sm text-gray-600">
            Need help? <a href="mailto:support@example.com" className="text-violet-600 hover:underline">Contact support</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;