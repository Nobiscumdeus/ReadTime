// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';

import Monitor from './components/Monitor';
import { AuthProvider} from './contexts/AuthContext';
import AdminDashboard from './components/NeoDashboard';



import { isAuthenticated } from './services/authServiceBefore';
import VerifyEmail from './components/VerifyEmail';
import ResendVerification from './components/ResendVerification';

/*
// Simple auth check - replace with your actual auth logic
const isAuthenticated = (): boolean => {
  // Check if user is logged in (e.g., check for token in localStorage)
  return localStorage.getItem('authToken') !== null;
};
*/

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
       <Router>
      <Routes>
      <Route path="/" element={<Landing />} />
        <Route 
          path="/monitor" 
          element={<ProtectedRoute element={<Monitor />} />} 
        />
          
        
        {/* All protected routes will be placed here later
         <Route 
          path="/monitor" 
          element={<ProtectedRoute element={<Monitor />} />} 
        />
       
          <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<Dashboard/>} />} 
        />
        
        */}
        
     
        {/* Add more routes as needed 
         <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/monitor" element={<Monitor />} />
          
        */}
         
          <Route path="/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/verify-email" element={<VerifyEmail/>} />
          <Route path="/resend-verification" element={<ResendVerification/>} />
   
        <Route path="*" element={<Navigate to="/" />} />
       
        
    
        
       
        
      </Routes>
    </Router>

    </AuthProvider>
   
  );
};

export default App;