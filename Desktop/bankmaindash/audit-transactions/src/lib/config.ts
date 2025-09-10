// Configuration for the BankDash application

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api/proxy',
    timeout: 10000, // 10 seconds
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'authToken',
    cookieKey: 'isAuthenticated',
    cookieExpiration: 7, // days
  },
  
  // App Configuration
  app: {
    name: 'BankDash',
    version: '1.0.0',
  },
} as const;

export default config;
