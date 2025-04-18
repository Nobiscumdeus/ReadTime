

export interface RegisterData{
    name:string,
    email:string,
    password:string
}

export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin:boolean;
    };
    message: string;
  }
  export interface UserData {
    id: string;
    name: string;
    email: string;
    isAdmin:boolean;
    // Add any other user properties you need
    username?:string;

    // Add any other user properties you need
    isActive: boolean;
    joinDate: string;
    lastActive: string;
    totalHours: number; // This will now exist
  }

  export interface VerificationError {
    isVerificationError: true;
    message: string;
    email: string;
  }