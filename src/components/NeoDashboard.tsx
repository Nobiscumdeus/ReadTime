import { useState, useEffect ,useCallback} from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { getCurrentUser } from '../services/authService';

import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../utils/date';
import LogoutButton from './Logout';
import { UsersQueryParams,UserListItem, UsersPaginatedResponse  } from '../types/user.types';
import ErrorPage from './ErrorPage';
import {User,DashboardData,SystemStats,SystemMetric,SystemLog} from '../types/dashboard';
import UserDetailsModal from './UserDetailsModal';

const API_URL=import.meta.env.VITE_APP_API_URL;

//........................................

const AdminDashboard=()=> {

  //............................ General States ..................................... //
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingData, setLoadingData] = useState(true);
  const navigate=useNavigate();
  const [showErrorPage, setShowErrorPage] = useState(false);
  const [error,setError]=useState<string |null>(null);
  // In your component
  const [selectedUser, setSelectedUser] = useState<User|null>(null);



  //............................Overview Tab States & Variables ............................//
  const [user, setUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  //Dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  //Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  // Filtering
  const [filters, setFilters] = useState<UsersQueryParams>({
    search: '',
    status: 'all',
    sortBy: 'newest'
  });
  
  //........................System Tabs States & Variables ------------------------------//
  const [serverStats, setServerStats] = useState({
    cpu: 0,
    memory: 0,
    dbSize: 0,
    dbAvailable: 0
  });
  const [systemStats, setSystemStats] = useState<SystemMetric[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);


  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

//...................................Overview Section .................................//

//.....................................Use Effects ......................................//

//Use Effect to fetch user data and get the current logged in user 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        console.log(userData)
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user data', err);
        setError('Failed to load user data, please refresh or log in again');
        setShowErrorPage(true); // Trigger error page
       

      } finally {
       console.log('Admin is in.....')
      }
    }
    fetchUserData();

  }, [navigate])

//Use Effect to fetch dashboard data 

  useEffect(() => {

    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No token found');
        }
        
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
          params: { range: dateRange },
          headers: {
            'x-auth-token': token
          }
        });
        
        setDashboardData({
          stats: response.data.stats,
          userActivityData: response.data.userActivityData,
          monthlyTrendData: response.data.monthlyTrendData,
          recentActivity: response.data.recentActivity
        });
        
      } 
     catch(error:unknown){
      if (axios.isAxiosError(error)){
        
        if(error?.response?.status === 401){
          localStorage.removeItem('token');
          window.location.href='/login';
          return;
        }
        //Handle other HTTP errors
        console.error('API Error: ',error.response?.data)
      }else{
        console.error('Unexpected error:',error)
        setShowErrorPage(true); // Trigger error page
      }
     }
      finally {
        setLoadingData(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);



  const fetchUsers = useCallback(async (page = pagination.page) => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      
      if (!token) throw new Error('No authentication token found');
      
      const { data } = await axios.get<UsersPaginatedResponse>(
        `${API_URL}/api/admin/users`, 
        {
          headers: { 'x-auth-token': token },
          params: {
            page,
            limit: pagination.limit,
            ...filters
          }
        }
      );
      
      setUserList(data.users);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });
      
    } catch (err) {
      // ... error handling ...
      console.error('Error occured:',err);
      setShowErrorPage(true); // Trigger error page
    } finally {
      setLoadingData(false);
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.limit, filters]); 

  
// Initial load and pagination effect
useEffect(() => {
  fetchUsers();
}, [fetchUsers, pagination.page]);

// Use effect for debounced search 
useEffect(() => {
  const timer = setTimeout(() => {
    if (pagination.page === 1) {
      fetchUsers(1); // Explicitly fetch page 1
    } else {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, 300);
  
  return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filters.search, fetchUsers]);





//...............................................Functions to handle Changes..................................//

// Handle search input change
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFilters(prev => ({ ...prev, search: e.target.value }));
};

// Handle status filter change
const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'active' | 'inactive' }));
};

// Handle sort change
const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setFilters(prev => ({ ...prev, sortBy: e.target.value as 'newest' | 'oldest' | 'reading_hours' | 'last_active' }));
};

// Handle page change
const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > pagination.totalPages) return;
  setPagination(prev => ({ ...prev, page: newPage }));
};

// Handle user deletion
const handleDeleteUser = async (userId: string) => {
  if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
      headers: { 'x-auth-token': token }
    });
    
    // Refresh user list
    fetchUsers();
    
  } catch (err) {
    console.error('Error deleting user:', err);
    alert('Failed to delete user');
  }
};



//.........................................System Statistics Section .................//
  // Function to fetch system stats
  const fetchSystemStats = async () => {
    setLoadingStats(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch current server stats
      const { data: statsData } = await axios.get<SystemStats>(
        `${API_URL}/api/admin/system/stats`, 
        { headers: { 'x-auth-token': token } }
      );
      
      setServerStats({
        cpu: statsData.cpu || 0,
        memory: statsData.memory || 0,
        dbSize: statsData.dbSize || 0,
        dbAvailable: statsData.dbAvailable || 0
      });
      
      // Fetch historical metrics
      const { data: metricsData } = await axios.get<SystemMetric[]>(
        `${API_URL}/api/admin/system/metrics`, 
        { headers: { 'x-auth-token': token } }
      );
      
      // Format the timestamps and prepare chart data
      const formattedMetrics = metricsData.map(metric => ({
        timestamp: new Date(metric.timestamp).toLocaleTimeString(),
        cpu: metric.cpu,
        memory: metric.memory,
        requests: metric.requests
      }));
      
      setSystemStats(formattedMetrics);
      
      // Fetch system logs
      const { data: logsData } = await axios.get(
        `${API_URL}/api/admin/system/logs`, 
        { headers: { 'x-auth-token': token } }
      );
      
      setSystemLogs(logsData);
      
    } catch (err) {
      console.error('Error fetching system data:', err);
      
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('You do not have permission to access system information');
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('Failed to load system data. Please try again.');
      }
    } finally {
      setLoadingStats(false);
    }
  };

  // Initial load
  useEffect(() => {
    
    fetchSystemStats();
    
    // Optional: Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchSystemStats();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);




//........................................Utility functions .............................
  
  // Get color based on usage percentage
  const getUsageColor = (percentage:number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

   // Get badge color based on log level
   const getLogLevelBadge = (level:string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return 'bg-green-100 text-green-800';
      case 'warn':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'debug':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


   // Format date for display
   const formatDate = (dateString:string | Date) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

    // Format file size
    const formatFileSize = (sizeInMB:number) => {
      if (sizeInMB < 1000) {
        return `${sizeInMB.toFixed(1)} MB`;
      } else {
        return `${(sizeInMB / 1024).toFixed(1)} GB`;
      }
    };

///////////////////////////////////////End of utility functions ////////////////////////////////////////
    


  //...........................................System Settings tab -----------------------------------//



//...................................Handling General Error Page ...................
if(showErrorPage){
 return <ErrorPage 
 error={error || "Something went wrong, please try again later"}
 title="Internet Disconnected"
 buttonText="Login again"
 redirectPath="/"
 showLogoutButton={true} // Optional since it defaults to true
/>

}





  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ReadTime Admin</h1>
        <div className="flex items-center">
           
            <span mr-2 text-sm><LogoutButton /></span>
          <span className="mr-2 ml-2 text-sm text-gray-600"> {user?.name || 'Admin user'}</span>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
             {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 font-medium ${activeTab === 'system' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          System Performance
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Dashboard Overview</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setDateRange('week')}
                className={`px-3 py-1 text-sm rounded ${dateRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 text-sm rounded ${dateRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setDateRange('year')}
                className={`px-3 py-1 text-sm rounded ${dateRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Year
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Total Users Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Total Users</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.userCount || '...'}</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.userTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.userTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.userGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>

  {/* Total Readings Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Total Readings</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.totalReadings || '...'}</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.readingsTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.readingsTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.readingsGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>

  {/* Active Users Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Active Users</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.activeUsersCount || '...'}</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.activeUsersTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.activeUsersTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.activeUsersGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>

  {/* Active Users Engagement Rate Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Active Users Engagement Rate</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.activeUsersGrowthPercent || '0'}%</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.activeUsersTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.activeUsersTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.activeUsersGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>

  {/* Avg. Reading Hours Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Avg. Reading Hours</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.averageReadingHours || '...'}</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.avgHoursTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.avgHoursTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.avgHoursGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>

  {/* User Engagement Percentage Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">User Engagement Percentage</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.userGrowthPercent || '0'}%</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.userTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.userTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.userGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>

  {/* Readings Volume Percentage Card */}
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Readings Volume Percentage</div>
    <div className="text-2xl font-bold">{dashboardData?.stats?.readingsGrowthPercent || '0'}%</div>
    <div className={`text-xs mt-1 ${
      dashboardData?.stats?.readingsTrend === 'up' ? 'text-green-500' : 'text-red-500'
    }`}>
      {dashboardData?.stats?.readingsTrend === 'up' ? '↑' : '↓'} 
      {dashboardData?.stats?.readingsGrowthPercent || 0}% from last {dateRange}
    </div>
  </div>
</div>




              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Activity Distribution */}
               
                <div className="bg-white p-4 rounded-lg shadow">
  <h3 className="font-medium mb-4">User Reading Time Distribution</h3>
  <div className="h-64">
    {dashboardData?.userActivityData ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dashboardData.userActivityData}  // Use dynamic data
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            dataKey="value"  // Matches your backend's 'value' key
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {dashboardData.userActivityData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} users`, "Count"]} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full">
        <p>Loading distribution data...</p>
      </div>
    )}
  </div>
</div>

                
                {/* Monthly Trends */}
<div className="bg-white p-4 rounded-lg shadow">
  <h3 className="font-medium mb-4">Monthly Trends</h3>
  <div className="h-64">
    {dashboardData?.monthlyTrendData ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dashboardData.monthlyTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#8884d8" 
            label={{ 
              value: 'Users', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#82ca9d" 
            label={{ 
              value: 'Readings', 
              angle: 90, 
              position: 'insideRight' 
            }}
          />
          <Tooltip 
            formatter={(value, name) => [
              value, 
              name === 'users' ? 'Active Users' : 'Reading Entries'
            ]}
          />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="users" 
            fill="#8884d8" 
            name="Active Users"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="right" 
            dataKey="readings" 
            fill="#82ca9d" 
            name="Reading Entries"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading trend data...</p>
      </div>
    )}
  </div>
</div>


              </div>

          
              <div className="bg-white p-4 rounded-lg shadow mb-6">
  <h3 className="font-medium mb-4">Recent Activity</h3>
  <div className="space-y-3">
    {dashboardData?.recentActivity?.length ? (
      dashboardData.recentActivity.map((activity, index) => (
        <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded">
          {/* Activity indicator dot */}
          <div className={`w-2 h-2 rounded-full mr-2 ${
            activity.type === 'reading' ? 'bg-green-500' : 
            activity.type === 'signup' ? 'bg-blue-500' : 'bg-purple-500'
          }`}></div>
          




































          {/* Activity message */}
          <div className="text-sm">
            {activity.type === 'reading' ? (
              <>User <span className="font-medium">{activity.username}</span> completed a {activity.hours}-hour reading session</>
            ) : activity.type === 'signup' ? (
              <>New user <span className="font-medium">{activity.username}</span> joined</>
            ) : (
              activity.message || 'System activity'
            )}
          </div>
          
          {/* Timestamp */}
          <div className="ml-auto text-xs text-gray-500">
            {formatTimeAgo(activity.timestamp)}
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-4">No recent activity</p>
    )}
  </div>
</div>


            </>
          )}
        </div>
      )}







      
    {/* User content */}
    {activeTab ==='users' &&(

<div>
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">User Management</h2>

</div>

{/* Search and Filter */}
<div className="flex flex-col md:flex-row gap-4 mb-4">
  <div className="flex-grow">
    <input 
      type="text" 
      placeholder="Search users..." 
      className="w-full p-2 border rounded"
      value={filters.search}
      onChange={handleSearchChange}
    />
  </div>
  <div className="flex gap-2">
    <select 
      className="p-2 border rounded"
      value={filters.status}
      onChange={handleStatusChange}
    >
      <option value="all">All Users</option>
      <option value="active">Active Users</option>
      <option value="inactive">Inactive Users</option>
    </select>
    <select 
      className="p-2 border rounded"
      value={filters.sortBy}
      onChange={handleSortChange}
    >
      <option value="newest">Sort by: Newest</option>
      <option value="oldest">Sort by: Oldest</option>
      <option value="reading_hours">Sort by: Reading Hours</option>
      <option value="last_active">Sort by: Last Active</option>
    </select>
  </div>
</div>









{/* User Table */}
{/* User Table */}
<div className="overflow-x-auto bg-white rounded-lg shadow">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {userList.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-4">No users found</td>
        </tr>
      ) : (
        userList.map((user) => (
          <tr key={user.id} className={`hover:bg-gray-50 ${!user.isActive ? 'text-gray-400' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 ${user.isAdmin ? 'bg-purple-200' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  {(user.username || user.name)?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{user.username || user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {user.isAdmin && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastActive}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                className="cursor-pointer text-blue-600 hover:text-blue-900 mr-3"
                onClick={() => setSelectedUser(user)}
              >
                Details
              </button>
             
              <button
                className="cursor-pointer text-red-600 hover:text-red-900"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

{/* Modal outside the table structure */}
{selectedUser && (
  <UserDetailsModal
    userId={selectedUser.id} // Using the id from your interface
    onClose={() => setSelectedUser(null)}
  />
)}



























{/* Pagination */}
{userList.length > 0 && (
  <div className="flex items-center justify-between p-4">
    <div className="text-sm text-gray-700">
      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
      <span className="font-medium">
        {Math.min(pagination.page * pagination.limit, pagination.total)}
      </span>{' '}
      of <span className="font-medium">{pagination.total}</span> users
    </div>
    <div className="flex space-x-2">
      <button 
        className={`px-3 py-1 border rounded text-sm ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      >
        Previous
      </button>
      
      {/* Show first page */}
      {pagination.page > 2 && (
        <button 
          className="px-3 py-1 border rounded text-sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      )}
      
      {/* Ellipsis */}
      {pagination.page > 3 && <span className="px-2 py-1">...</span>}
      
      {/* Page before current */}
      {pagination.page > 1 && (
        <button 
          className="px-3 py-1 border rounded text-sm"
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          {pagination.page - 1}
        </button>
      )}
      
      {/* Current page */}
      <button 
        className="px-3 py-1 bg-blue-50 border border-blue-500 rounded text-sm"
      >
        {pagination.page}
      </button>
      
      {/* Page after current */}
      {pagination.page < pagination.totalPages && (
        <button 
          className="px-3 py-1 border rounded text-sm"
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          {pagination.page + 1}
        </button>
      )}
      
      {/* Ellipsis */}
      {pagination.page < pagination.totalPages - 2 && <span className="px-2 py-1">...</span>}
      
      {/* Last page */}
      {pagination.page < pagination.totalPages - 1 && (
        <button 
          className="px-3 py-1 border rounded text-sm"
          onClick={() => handlePageChange(pagination.totalPages)}
        >
          {pagination.totalPages}
        </button>
      )}
      
      <button 
        className={`px-3 py-1 border rounded text-sm ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : ''}`}
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
      >
        Next
      </button>
    </div>
  </div>
)}
</div>
    )}

    

      {activeTab === 'system' && (



<div>
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">System Performance</h2>
  <button 
    onClick={fetchSystemStats}
    disabled={loadingStats}
    className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${
      loadingStats ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    {loadingStats ? 'Loading...' : 'Refresh Data'}
  </button>
</div>

{/* Server Stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Server CPU Usage</div>
    <div className="text-2xl font-bold">{serverStats.cpu}%</div>
    <div className="mt-2 h-2 w-full bg-gray-200 rounded">
      <div 
        className={`h-full ${getUsageColor(serverStats.cpu)} rounded`} 
        style={{ width: `${Math.min(serverStats.cpu, 100)}%` }}
      ></div>
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Memory Usage</div>
    <div className="text-2xl font-bold">{serverStats.memory}%</div>
    <div className="mt-2 h-2 w-full bg-gray-200 rounded">
      <div 
        className={`h-full ${getUsageColor(serverStats.memory)} rounded`} 
        style={{ width: `${Math.min(serverStats.memory, 100)}%` }}
      ></div>
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-500">Database Size</div>
    <div className="text-2xl font-bold">{formatFileSize(serverStats.dbSize)}</div>
    <div className="text-xs text-gray-500 mt-1">
      {formatFileSize(serverStats.dbAvailable)} available
    </div>
  </div>
</div>

{/* Performance Chart */}
<div className="bg-white p-4 rounded-lg shadow mb-6">
  <h3 className="font-medium mb-4">Real-time Server Metrics</h3>
  {systemStats.length === 0 ? (
    <div className="h-64 flex items-center justify-center text-gray-500">
      No metrics data available
    </div>
  ) : (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={systemStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu" stroke="#22c55e" name="CPU %" />
          <Line type="monotone" dataKey="memory" stroke="#eab308" name="Memory %" />
          <Line type="monotone" dataKey="requests" stroke="#3b82f6" name="Requests/min" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}
</div>

{/* Log Table */}
<div className="bg-white p-4 rounded-lg shadow">
  <h3 className="font-medium mb-4">System Logs</h3>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {systemLogs.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
              No logs available
            </td>
          </tr>
        ) : (
          systemLogs.map((log, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(log.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogLevelBadge(log.level)}`}>
                  {log.level}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{log.message}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
</div>








      )}






      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
        <p>Reading Tracker Admin Panel © {new Date().getFullYear()}</p>
        <p className="mt-1">Version 1.2.3</p>
      </div>
    </div>
  );
}

export default AdminDashboard;