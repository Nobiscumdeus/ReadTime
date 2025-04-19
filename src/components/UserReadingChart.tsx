import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { Reading,Props } from '../types/userReadingChart';


const API_URL=import.meta.env.VITE_APP_API_URL || 'https://readtime.onrender.com';

const UserReadingChart = ({ userId }: Props) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'daily' | 'weekly'>('daily');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Fetch data when userId, month, or year changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/admin/users/${userId}/charts`, {
          headers: { 'x-auth-token': token },
          params: { month, year }
        });
        setReadings(res.data.data || []);
      } catch (error) {
        console.error("Error fetching user readings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, month, year]);

  const prepareChartData = () => {
    if (chartType === 'daily') {
      return readings.map(r => ({
        name: new Date(r.date).toLocaleDateString(),
        hours: r.hours
      }));
    } else {
      const weekly: Record<string, { total: number; count: number }> = {};
      readings.forEach(r => {
        const week = `W${Math.ceil(new Date(r.date).getDate() / 7)}`;
        if (!weekly[week]) weekly[week] = { total: 0, count: 0 };
        weekly[week].total += r.hours;
        weekly[week].count++;
      });

      return Object.entries(weekly).map(([week, val]) => ({
        name: week,
        hours: val.total,
        average: (val.total / val.count).toFixed(1),
      }));
    }
  };

  const chartData = prepareChartData();

  if (loading) return <p className="text-center mt-2">Loading chart...</p>;

  return (
    <div className="mt-4">
      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex gap-2">
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

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>

        {/* Chart type switcher */}
        <div className="flex gap-2">
          <button
            className={`px-2 py-1 rounded ${chartType === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setChartType('daily')}
          >
            Daily
          </button>
          <button
            className={`px-2 py-1 rounded ${chartType === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setChartType('weekly')}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hours" stroke="#2563eb" name="Reading Hours" />
            {chartType === 'weekly' && (
              <Line type="monotone" dataKey="average" stroke="#10b981" name="Avg Hours/Day" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserReadingChart;
