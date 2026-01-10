import { stockApi } from '../services/stockApi';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if it's the admin user
    if (credentials.email === 'demo@gmail.com' && credentials.password === '123456') {
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: 'admin',
          email: credentials.email,
          name: 'Admin User'
        }
      };
    }
    
    // Check if it's a regular user with proper password validation
    try {
      const user = await stockApi.authenticateUser(credentials.email, credentials.password);
      
      if (user) {
        if (user.status === 'blocked') {
          return {
            success: false,
            message: 'Your account has been blocked by the administrator.'
          };
        }
        
        return {
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid credentials. Only registered users can access this application.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Authentication service is temporarily unavailable.'
      };
    }
  }
};