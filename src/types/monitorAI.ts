// Define our export interfaces for type safety
export interface ReadingData {
  date: string;
  hours: number;
}

export interface ChartDataItem {
  day: number;
  date: string;
  actualHours: number;
  predictedHours?: number;
  cumulativeActual?: number;
  cumulativePredicted?: number;
  targetLine?: number;
}

export interface MonthDataItem {
  id:string,
  date: string;
  //hours: string | number;
  hours:number;
}

export interface Insight {
  type: 'consistency' | 'trend' | 'pattern' | 'streak' | 'recommendation' | 'error';
  title: string;
  message: string;
  score: number;
  normalizedScore?: number;
}

export interface GoalPrediction {
  projected_total: number;
  current_hours: number;
  recommendation: string;
  timestamp?: number;
}

export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string | number;
}

export interface AIInsightsProps {
  month: number;
 
}

