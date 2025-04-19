import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCurrentUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import ErrorPage from './ErrorPage';
import Loading from './Loading';
import LogoutButton from './Logout';
import AIInsights from './MonitorAI';
import {User,ReadingItem,ReadingResponse,Insight,WeeklyData,ChartDataPoint} from '../types/monitor'

const API_URL=import.meta.env.VITE_APP_API_URL || 'https://readtime.onrender.com';

function Monitor() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // Default to current month
  const [data, setData] = useState<ReadingItem[]>([]);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'daily' | 'weekly'>('daily');
  const navigate = useNavigate();




  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        console.log(userData)
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user data', err);
        setError('Failed to load user data, please refresh or log in again ')

      } finally {
        setLoading(false)
      }
    }
    fetchUserData();

  }, [navigate])






  // Fetch data for the selected month
  useEffect(() => {
    axios.get<ReadingResponse>(`${API_URL}/api/data/${month}`,
      { headers: { 'x-auth-token': localStorage.getItem('token') } }
    )
      .then(response => setData(response.data.data))
      .catch(error => console.error(error));
  }, [month]);



  // Handle box click to log hours
  const handleBoxClick = async (date: string, hours: number): Promise<void> => {
    try {
      // Delete any existing entry for the selected day
      await axios.delete(`${API_URL}/api/data/${date}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });

      // Save the new entry
      const response = await axios.post('${API_URL}/api/data/save', { date, hours },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      console.log(response.data);

      // Refresh data
      const updatedData = await axios.get(`${API_URL}/api/data/${month}`,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }

      );
      setData(updatedData.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Generate days of the month
  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);




  // Prepare data for charts
  const prepareChartData = (): ChartDataPoint[] => {
    if (chartType === 'daily') {
      // Daily chart - show reading hours for each day
      const chartData = days.map(day => {
        const date = `${new Date().getFullYear()}-${month}-${day}`;
        console.log(date);
        const entry = data.find(d => new Date(d.date).getDate() === day);
        return {
          name: day.toString(),
          hours: entry ? entry.hours : 0
        };
      });
      return chartData;
    } else {
      // Weekly chart - aggregate data by week
      const weeks: Record<string, WeeklyData> = {};
      data.forEach(entry => {
        const day = new Date(entry.date).getDate();
        const weekNum = Math.ceil(day / 7);
        if (!weeks[weekNum]) {
          weeks[weekNum] = { totalHours: 0, count: 0 };
        }
        weeks[weekNum].totalHours += entry.hours;
        weeks[weekNum].count += 1;
      });

      return Object.keys(weeks).map(week => ({
        name: `Week ${week}`,
        hours: weeks[week].totalHours,
        average: (weeks[week].totalHours / weeks[week].count).toFixed(1)
      }));
    }
  };

  const generateInsights = (): Insight[] | null => {

    if (data.length < 3) return null; //Not enough data 
    const insights: Insight[] = [];

    //Check for consistency

    const daysWithReading = new Set(data.map(d => new Date(d.date).getDate()));
    const consistencyScore = daysWithReading.size / daysInMonth;


    if (consistencyScore < 0.3) {
      insights.push({
        type: 'consistency',
        message: 'Try to read consistently throughout the month for better retention',
        score: consistencyScore
      })
    } else if (consistencyScore > 0.7) {
      insights.push({
        type: 'consistency',
        message: 'Great job maintaining a consistent reading schedule !',
        score: consistencyScore
      })
    }
    //Check for trends 
    //const sortedData= [...data].sort((a,b)=>new Date(a.date) - new Date(b.date));
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date).getTime(); // Convert to timestamp
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Explicit number subtraction
    });

    if (sortedData.length >= 5) {

      const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
      const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.hours, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.hours, 0) / secondHalf.length;

      const trend = secondHalfAvg - firstHalfAvg;


      if (trend > 1) {
        insights.push({
          type: 'trend',
          message: 'Your reading time is increasing this month. Keep up the good work!',
          score: trend
        })
      } else if (trend < -1) {
        insights.push({
          type: 'trend',
          message: 'Your reading time has decreased recently. Try setting a reminder to get back on track.',
          score: trend
        });

      }

    }

    // Recommend optimal reading time 
    const entriesByHour: Record<number, number> = {};
    data.forEach(entry => {
      if (!entriesByHour[entry.hours]) entriesByHour[entry.hours] = 0;
      entriesByHour[entry.hours]++;
    });




    let mostFrequentHour = "1"; // Default value
    if (Object.keys(entriesByHour).length > 0) {
      mostFrequentHour = Object.entries(entriesByHour)
        .sort((a, b) => b[1] - a[1])[0][0];
    }


    insights.push({
      type: 'recommendation',
      message: `You seem to prefer reading for ${mostFrequentHour} hours at a time. Consider scheduling dedicated ${mostFrequentHour}-hour blocks for reading.`,
      score: null
    });

    return insights;


  }

  //Activate the insights 
  const insights = generateInsights();


  const chartData = prepareChartData();




  if (loading) {
    return (
      <Loading />
    );
  }



  if (error) {
    return (


      <ErrorPage error={error} />

    );
  }




  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Monthly Reading Tracker </h1>
      <div className='text-center '> <LogoutButton /> </div>
      <div className="text-center mb-4">
        <h2 className="mx-auto text-xl md:text-2xl font-semibold text-gray-700 mt-4 relative inline-block">
          Welcome , <span className="text-blue-600">{user?.name || 'Guest '}</span>

          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-200 animate-underline"></span>
        </h2>

      </div>

      <div className="flex justify-center mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Graph Container with Horizontal Scroll for Small Screens */}
      <div className="flex justify-center w-full">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Graph-like Grid */}
            <div className="flex flex-col">
              {/* Horizontal Axis Labels (Days of the Month) */}
              <div className="flex items-center mb-1">
                {/* Empty cell for alignment with vertical axis */}
                <div className="w-10 flex-shrink-0"></div>

                {days.map(day => (
                  <div key={day} className="w-8 text-center text-xs font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Rows (Hours and Boxes) */}
              {Array.from({ length: 10 }, (_, hourIndex) => {
                const hour = 10 - hourIndex; // Display hours from 10 to 1
                return (
                  <div key={hour} className="flex items-center mb-1">
                    {/* Vertical Axis Label (Hour) */}
                    <div className="w-10 text-right pr-2 font-medium text-sm">{hour}</div>

                    {/* Boxes for Each Day */}
                    <div className="flex">
                      {days.map(day => {
                        const entry = data.find(d => new Date(d.date).getDate() === day && d.hours === hour);
                        return (
                          <div
                            key={day}
                            className={`w-8 h-8 border border-gray-300 ${entry ? 'bg-blue-500' : 'hover:bg-blue-200'
                              } cursor-pointer transition-colors duration-150`}
                            onClick={() => handleBoxClick(`${new Date().getFullYear()}-${month}-${day}`, hour)}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>


      <div className="mt-6 mb-2 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Click on a box to log your reading hours for that day
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowChart(!showChart)}
            className=" cursor-pointer mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>
      </div>

      {/* Trends Chart Section */}
      {showChart && (
        <div className="mt-8 border rounded-lg p-4 bg-white shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reading Trends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('daily')}
                className={`cursor-pointer px-3 py-1 rounded ${chartType === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setChartType('weekly')}
                className={`cursor-pointer px-3 py-1 rounded ${chartType === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  name="Reading Hours"
                />
                {chartType === 'weekly' && (
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#10b981"
                    name="Average Hours/Day"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Total Hours</div>
              <div className="text-xl font-bold">
                {data.reduce((sum, entry) => sum + entry.hours, 0)}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Average Per Day</div>
              <div className="text-xl font-bold">
                {data.length ? (data.reduce((sum, entry) => sum + entry.hours, 0) / data.length).toFixed(1) : '0'}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Days Tracked</div>
              <div className="text-xl font-bold">{data.length}</div>
            </div>

          </div>





          {/* charts will be displayed here */}
          {showChart && insights && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-lg mb-2">Reading Insights</h3>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex">
                    <span className="mr-2">
                      {insight.type === 'consistency' ? '📊' :
                        insight.type === 'trend' ? '📈' : '💡'}
                    </span>
                    {insight.message}
                  </li>
                ))}
              </ul>


            </div>


          )}


        </div>
      )}

      <AIInsights month={month} />

    </div>


  );
}

export default Monitor;


