// src/types/user.types.ts

export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: Date;
    lastActive: Date;
    totalReadingHours?: number;
  }
  
  export interface UserListItem {
    id: string;
    username: string;
    name:string;
    email: string;
    joinDate: string;
    totalHours: number;
    lastActive: string;
    isActive: boolean;
    isAdmin: boolean;
    daysSinceLastActive:number|string;
  }
  
  export interface UsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    sortBy?: 'newest' | 'oldest' | 'reading_hours' | 'last_active';
  }
  
  export interface UsersPaginatedResponse {
    users: UserListItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }