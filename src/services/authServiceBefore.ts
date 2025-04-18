import axios from "axios";
import {RegisterData,LoginData,AuthResponse,UserData} from '../types/auth'
//const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//const API_URL ='http://localhost:5000/api'
const API_URL=import.meta.env.VITE_APP_API_URL;

  

//Set authentication for protected routes
const setAuthToken=(token:string | null)=>{
    if(token){
        axios.defaults.headers.common['x-auth-token']=token;
        localStorage.setItem('token',token);
    }else{
        delete axios.defaults.headers.common['x-auth-token'];
        localStorage.removeItem('token');
    }

}


//Register user
export const register=async (userData:RegisterData):Promise<AuthResponse>=>{
    try{

        const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/register`, userData);
        //Save token to localStorage and set axios headers
        if(response.data.token){
            setAuthToken(response.data.token);
        }
        return response.data
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || "Registration failed") 
        }
        throw new Error('Registration failed. Please try again');
    }
}


// Login users
export const login = async (userData: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/login`, userData);
     
      
      // Save token to localStorage and set axios headers
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Login failed. Please try again.');
    }
  };
  

//Logout user
export const logout=():void=>{
  localStorage.removeItem('token');
    setAuthToken(null);

}


// Other auth functions...

export const getCurrentUser = async (): Promise<UserData> => {
  try {
    // Get the auth token from localStorage or wherever you store it
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Make API request to get current user details
    const response = await axios.get(`${API_URL}/api/user`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};
  
  // Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return localStorage.getItem('token') !== null;
  };

  
export default {
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    setAuthToken
}