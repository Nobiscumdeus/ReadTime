
export interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    // Add any other user properties you need
  }
  
  // Individual reading item
  export interface ReadingItem {
    id: string;
    date: string;
    hours: number;
    
  }
  
  
  // Define types for our data structures
  export interface ReadingData {
    id: string;
    date: string;
    hours: number;
    success?: boolean;
    data: ReadingItem[]
  }
  
  export interface ReadingResponse{
    success:boolean;
    data:ReadingItem[];
  }
  
  export interface ChartDataPoint {
    name: string;
    hours: number;
    average?: string;
  }
  
  export interface WeeklyData {
    totalHours: number;
    count: number;
  }
  
  
  export interface Insight {
    type: 'consistency' | 'trend' | 'recommendation';
    message: string;
    score: number | null;  // null for recommendations which don't need scores
    severity?: 'low' | 'medium' | 'high'; // Optional severity level
    dateGenerated?: Date;  // When the insight was created
  }