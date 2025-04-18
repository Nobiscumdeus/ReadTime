
export interface Stats {
  userCount: number;
  userGrowthPercent: number;
  userTrend: 'up' | 'down'; // Add this
  totalReadings: number;
  readingsGrowthPercent: number;
  readingsTrend: 'up' | 'down'; // Add this
  activeUsersCount: number;
  activeUsersGrowthPercent: number;
  activeUsersTrend: 'up' | 'down'; // Add this
  averageReadingHours: number;
  avgHoursGrowthPercent: number;
  avgHoursTrend: 'up' | 'down'; // Add this
}

export interface ActivityItem {
  type: 'reading' | 'signup';
  username?: string;
  name:string;
  hours?: number;
  timestamp: string | Date;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface MonthlyTrend {
  month: string;
  readings: number;
  users: number;
}

export interface DashboardData {
  stats: Stats;
  userActivityData: ChartData[];
  monthlyTrendData: MonthlyTrend[];
  recentActivity: ActivityItem[];
}

export interface UserStats {
    total: number;
    new: number;
    growth: number;
    active: number;
    activeGrowth: number;
  }
  
  export interface ReadingStats {
    total: number;
    recent: number;
    growth: number;
    avgHours: number;
    avgHoursGrowth: number;
  }
  
  export interface ReadingDistribution {
    duration: string;
    count: number;
  }
  
  export interface MonthlyTrend {
    month: string;
    users: number;
    readings: number;
  }
  
  export interface ActivityItem {
    type: 'reading' | 'signup';
    user: string;
    hours?: number; // Only for 'reading' type
    date: string;
    name:string; //name of the user
    message?:string;
  }
  

  export interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    username?:string;

    // Add any other user properties you need
    isActive: boolean;
    joinDate: string;
    lastActive: string;
    totalHours: number; // This will now exist
  //  daysSinceLastActive:number | string;
  }
  
  export interface SystemMetric {
    timestamp: string| Date;
    cpu: number;         // CPU usage percentage (0-100)
    memory: number;      // Memory usage percentage (0-100)
    requests: number;    // Number of requests
  }
  
  export interface SystemStats {
    cpu: number;         // Current CPU usage
    memory: number;      // Current memory usage
    dbSize: number;      // Database size in MB
    dbAvailable: number; // Available database space in MB
  }

  export interface SystemLog {
    timestamp: Date;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'; // Common log levels
    message: string;
  }