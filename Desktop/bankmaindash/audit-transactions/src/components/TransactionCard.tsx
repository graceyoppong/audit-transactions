"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Globe } from "lucide-react";

interface TransactionCardProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  transactionCount: number;
  onClick: () => void;
  logoUrl?: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  title,
  icon,
  description,
  color,
  transactionCount,
  onClick,
  logoUrl,
}) => {
  console.log('TransactionCard:', title, 'received logoUrl:', logoUrl);
  
  // Fallback logo URLs for known banks
  const getFallbackLogoUrl = (serviceName: string): string | null => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('public bank')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Public_Bank_Berhad_logo.svg/1200px-Public_Bank_Berhad_logo.svg.png';
    }
    if (name.includes('maybank')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Maybank_Logo.svg/1200px-Maybank_Logo.svg.png';
    }
    if (name.includes('cimb')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/CIMB_Bank_Berhad_logo.svg/1200px-CIMB_Bank_Berhad_logo.svg.png';
    }
    
    return null;
  };
  
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(logoUrl);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load logo for ${title}:`, currentLogoUrl);
    
    if (!hasFailedOnce) {
      // Try fallback URL first
      const fallbackUrl = getFallbackLogoUrl(title);
      if (fallbackUrl && fallbackUrl !== currentLogoUrl) {
        console.log(`Trying fallback logo for ${title}:`, fallbackUrl);
        setCurrentLogoUrl(fallbackUrl);
        setHasFailedOnce(true);
        return;
      }
    }
    
    // If fallback also fails or no fallback available, show Globe icon
    setCurrentLogoUrl(undefined);
  };
  
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {currentLogoUrl ? (
            <img
              key={currentLogoUrl} // Force re-render when URL changes
              src={currentLogoUrl}
              alt={title}
              className="h-12 w-12 object-contain rounded-lg"
              onError={handleImageError}
              onLoad={() => {
                console.log(`Successfully loaded logo for ${title}:`, currentLogoUrl);
              }}
            />
          ) : (
            <Globe className="h-12 w-12 text-gray-600 dark:text-gray-400" />
          )}
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
