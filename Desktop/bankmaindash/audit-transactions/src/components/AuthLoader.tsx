import React from 'react';

const AuthLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        
        {/* Loading spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        
        {/* Text */}
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Authenticating...
        </p>
      </div>
    </div>
  );
};

export default AuthLoader;
