import  { useEffect, useState } from 'react';
import axios from 'axios';
import UserReadingChart from './UserReadingChart';
import { AxiosError } from 'axios';

import {UserDetails} from '../types/userDetailsModal'

const API_URL=import.meta.env.VITE_APP_API_URL || 'https://readtime.onrender.com';

const UserDetailsModal = ({ userId, onClose }: { userId: string | null, onClose: () => void }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/admin/users/${userId}`, {
          headers: { 'x-auth-token': token }
        });

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch user data');
        }
      } catch (err:unknown) {
        const error = err as AxiosError<{ message: string }>;
        console.error('Error fetching user details:', error);
        setError(error.response?.data?.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  if (!userId) return null;

  return (

    <div className="fixed inset-0 bg-gray-100/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">{user?.name} Reading Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-gray-600">Loading user reading data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-8 text-center text-red-500">
              <p>{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          )}

          {/* Success State */}
          {user && !loading && !error && (
            <div className="mt-6 space-y-6">
              {/* User Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">User Info</h3>
                  <p className="truncate"><span className="font-medium">Name:</span> {user.name}</p>
                  <p className="truncate"><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Joined:</span> {user.formattedJoinDate}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Reading Stats</h3>
                  <p><span className="font-medium">Total Sessions:</span> {user.readings.length}</p>
                  <p><span className="font-medium">Total Hours:</span> {formatHours(user.totalHours)}</p>
                  <p><span className="font-medium">Avg/Session:</span> {user.averageHours} hours</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Activity</h3>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p><span className="font-medium">Last Active:</span> {user.formattedLastActive || 'Never'}</p>
                </div>
              </div>

              {/* 📊 Add the Chart Here */}
              {(user._id ) && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Reading Activity Chart</h3>
    <UserReadingChart userId={user._id } />
  </div>
)}



  
              




            </div>
          )}

        </div>
      </div>
    </div>


  );
};

export default UserDetailsModal;