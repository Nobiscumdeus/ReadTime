export interface Reading {
  _id: string;
  hours: number;
  date: string;
  title?: string;
  notes?: string;
  formattedDate?: string;
}

export interface UserDetails {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
  readings: Reading[];
  totalHours: number;
  averageHours: string;
  formattedJoinDate: string;
  formattedLastActive: string;
}