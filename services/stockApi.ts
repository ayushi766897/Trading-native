// Mock API service for stock data
// In a real application, this would connect to a real financial API

import { storage } from '../utils/storage';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Added password field
  status: 'active' | 'inactive' | 'blocked';
  lastActive: string;
  totalInvested: number;
  stocksOwned: string[];
  loginCount: number;
  portfolio: PortfolioItem[];
  cashBalance: number;
}

export interface PortfolioItem {
  stockSymbol: string;
  shares: number;
  avgPurchasePrice: number;
  totalInvested: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  stockSymbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  timestamp: string;
  total: number;
}

// Mock stock data
const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.34, changePercent: 1.33, volume: '54.2M', marketCap: '2.8T', peRatio: 29.5, dividendYield: 0.5 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.67, change: -1.23, changePercent: -0.85, volume: '32.1M', marketCap: '1.7T', peRatio: 25.3, dividendYield: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.89, change: 5.67, changePercent: 1.39, volume: '28.5M', marketCap: '3.1T', peRatio: 35.2, dividendYield: 0.7 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.32, change: -3.45, changePercent: -1.37, volume: '92.3M', marketCap: '790B', peRatio: 68.1, dividendYield: 0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.91, change: 4.12, changePercent: 2.36, volume: '45.6M', marketCap: '1.8T', peRatio: 62.8, dividendYield: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 8.45, changePercent: 1.74, volume: '67.8M', marketCap: '1.2T', peRatio: 72.4, dividendYield: 0.05 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 512.15, change: -2.18, changePercent: -0.42, volume: '23.4M', marketCap: '1.3T', peRatio: 32.1, dividendYield: 0 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 623.41, change: 12.34, changePercent: 2.02, volume: '12.7M', marketCap: '270B', peRatio: 35.6, dividendYield: 0 },
];

// Mock users data - including admin user
// Load users from storage if available
let mockUsers: User[] = [];

// Initialize with admin user if not already present
let storedUsers: string | null = null;

// Mock transactions data
let mockTransactions: Transaction[] = [];

// Load transactions from storage if available
let storedTransactions: string | null = null;

// Initialize data when the module loads
const initializeData = async () => {
  try {
    storedUsers = await storage.getItem('mockUsers');
    if (storedUsers) {
      try {
        mockUsers = JSON.parse(storedUsers);
      } catch (e) {
        // If parsing fails, initialize with default admin user
        mockUsers = [
          {
            id: 'admin',
            email: 'demo@gmail.com',
            name: 'Admin',
            password: '123456', // Admin password
            status: 'active',
            lastActive: new Date().toISOString(),
            totalInvested: 0,
            stocksOwned: [],
            loginCount: 10,
            portfolio: [],
            cashBalance: 100000 // Starting balance of $100,000
          }
        ];
      }
    } else {
      mockUsers = [
        {
          id: 'admin',
          email: 'demo@gmail.com',
          name: 'Admin',
          password: '123456', // Admin password
          status: 'active',
          lastActive: new Date().toISOString(),
          totalInvested: 0,
          stocksOwned: [],
          loginCount: 10,
          portfolio: [],
          cashBalance: 100000 // Starting balance of $100,000
        }
      ];
    }

    storedTransactions = await storage.getItem('mockTransactions');
    if (storedTransactions) {
      try {
        mockTransactions = JSON.parse(storedTransactions);
      } catch (e) {
        mockTransactions = [];
      }
    } else {
      mockTransactions = [];
    }
  } catch (e) {
    console.error('Error initializing data:', e);
    // Fallback initialization
    mockUsers = [
      {
        id: 'admin',
        email: 'demo@gmail.com',
        name: 'Admin',
        password: '123456', // Admin password
        status: 'active',
        lastActive: new Date().toISOString(),
        totalInvested: 0,
        stocksOwned: [],
        loginCount: 10,
        portfolio: [],
        cashBalance: 100000 // Starting balance of $100,000
      }
    ];
    mockTransactions = [];
  }
};

// Initialize data
initializeData();

export const stockApi = {
  // Get all stocks
  async getStocks(): Promise<Stock[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockStocks];
  },

  // Get stock by symbol
  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStocks.find(stock => stock.symbol === symbol);
  },

  // Search stocks
  async searchStocks(query: string): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
    );
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockUsers];
  },

  // Create a new user (admin only)
  async createUser(userData: Omit<User, 'id' | 'lastActive' | 'totalInvested' | 'stocksOwned' | 'loginCount' | 'portfolio' | 'cashBalance'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if user with this email already exists
    const existingUser = mockUsers.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...userData,
      lastActive: new Date().toISOString(),
      totalInvested: 0,
      stocksOwned: [],
      loginCount: 0,
      portfolio: [],
      cashBalance: 100000 // Starting balance of $100,000
    };
    
    mockUsers.push(newUser);
    
    // Persist to storage
    await storage.setItem('mockUsers', JSON.stringify(mockUsers));
    
    return newUser;
  },

  // Update user status (admin only)
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'blocked'): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        status
      };
      
      // Persist to storage
      await storage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      return mockUsers[userIndex];
    }
    
    throw new Error('User not found');
  },

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(user => user.id !== userId);
    
    // Persist to storage
    await storage.setItem('mockUsers', JSON.stringify(mockUsers));
    
    return mockUsers.length < initialLength;
  },

  // Authenticate user login
  async authenticateUser(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find user by email
    const user = mockUsers.find(user => user.email === email);
    
    // Check if user exists and password matches
    if (user && user.password === password) {
      // Update last active time
      user.lastActive = new Date().toISOString();
      user.loginCount = user.loginCount + 1;
      
      // Persist to storage
      await storage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      return user;
    }
    
    return null;
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTransactions.filter(transaction => transaction.userId === userId);
  },

  // Get all transactions (admin only)
  async getAllTransactions(): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockTransactions];
  },

  // Execute a trade (buy/sell)
  async executeTrade(transaction: Omit<Transaction, 'id' | 'timestamp' | 'total'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stock = await this.getStockBySymbol(transaction.stockSymbol);
    if (!stock) {
      throw new Error('Stock not found');
    }
    
    const totalCost = transaction.shares * transaction.price;
    
    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      ...transaction,
      timestamp: new Date().toISOString(),
      total: totalCost
    };
    
    // Update user's portfolio and cash balance
    const userIndex = mockUsers.findIndex(user => user.id === transaction.userId);
    if (userIndex !== -1) {
      const user = mockUsers[userIndex];
      
      if (transaction.type === 'buy') {
        // Check if user has enough cash
        if (user.cashBalance < totalCost) {
          throw new Error('Insufficient funds');
        }
        
        // Deduct cash
        user.cashBalance -= totalCost;
        
        // Update portfolio
        const portfolioIndex = user.portfolio.findIndex(item => item.stockSymbol === transaction.stockSymbol);
        if (portfolioIndex !== -1) {
          // Update existing portfolio item
          const existingItem = user.portfolio[portfolioIndex];
          const newTotalShares = existingItem.shares + transaction.shares;
          const newTotalInvested = existingItem.totalInvested + totalCost;
          
          user.portfolio[portfolioIndex] = {
            stockSymbol: transaction.stockSymbol,
            shares: newTotalShares,
            avgPurchasePrice: newTotalInvested / newTotalShares,
            totalInvested: newTotalInvested
          };
        } else {
          // Add new portfolio item
          user.portfolio.push({
            stockSymbol: transaction.stockSymbol,
            shares: transaction.shares,
            avgPurchasePrice: transaction.price,
            totalInvested: totalCost
          });
          
          // Add to stocks owned list
          if (!user.stocksOwned.includes(transaction.stockSymbol)) {
            user.stocksOwned.push(transaction.stockSymbol);
          }
        }
        
        user.totalInvested += totalCost;
      } else {
        // Selling stocks
        const portfolioIndex = user.portfolio.findIndex(item => item.stockSymbol === transaction.stockSymbol);
        if (portfolioIndex === -1) {
          throw new Error('Stock not found in portfolio');
        }
        
        const portfolioItem = user.portfolio[portfolioIndex];
        if (portfolioItem.shares < transaction.shares) {
          throw new Error('Not enough shares to sell');
        }
        
        // Update portfolio
        const newShares = portfolioItem.shares - transaction.shares;
        if (newShares === 0) {
          // Remove from portfolio if no shares left
          user.portfolio.splice(portfolioIndex, 1);
          
          // Remove from stocks owned list
          user.stocksOwned = user.stocksOwned.filter(symbol => symbol !== transaction.stockSymbol);
        } else {
          // Update existing portfolio item
          user.portfolio[portfolioIndex] = {
            ...portfolioItem,
            shares: newShares,
            totalInvested: portfolioItem.avgPurchasePrice * newShares
          };
        }
        
        // Add cash from selling
        user.cashBalance += totalCost;
        
        // Adjust total invested based on original purchase cost
        const costBasis = transaction.shares * portfolioItem.avgPurchasePrice;
        user.totalInvested -= costBasis;
      }
      
      // Persist user changes to storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
    } else {
      throw new Error('User not found');
    }
    
    mockTransactions.push(newTransaction);
    
    // Persist transactions to storage
    await storage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    
    return newTransaction;
  },

  // Get admin dashboard stats
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalTransactions: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalUsers = mockUsers.length - 1; // Exclude admin user from count
    const activeUsers = mockUsers.filter(user => user.status === 'active' && user.email !== 'demo@gmail.com').length;
    const totalRevenue = mockUsers.reduce((sum, user) => sum + user.totalInvested, 0);
    const totalTransactions = mockTransactions.length;
    
    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalTransactions
    };
  },
  
  // Get user portfolio with current market values
  async getUserPortfolio(userId: string): Promise<PortfolioItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(user => user.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return [...user.portfolio];
  },
  
  // Get user balance information
  async getUserBalance(userId: string): Promise<{
    cashBalance: number;
    totalInvested: number;
    portfolioValue: number;
    totalValue: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(user => user.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Calculate current portfolio value
    let portfolioValue = 0;
    for (const item of user.portfolio) {
      const stock = await this.getStockBySymbol(item.stockSymbol);
      if (stock) {
        portfolioValue += item.shares * stock.price;
      }
    }
    
    const totalValue = user.cashBalance + portfolioValue;
    
    return {
      cashBalance: user.cashBalance,
      totalInvested: user.totalInvested,
      portfolioValue,
      totalValue
    };
  }
};