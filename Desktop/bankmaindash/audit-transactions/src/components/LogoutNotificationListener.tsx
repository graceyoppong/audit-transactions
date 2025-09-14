"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export const LogoutNotificationListener = () => {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleUserLoggedOut = (event: CustomEvent) => {
      const { reason } = event.detail;
      
      if (reason === 'Account deactivated') {
        toast({
          title: "Account Deactivated",
          description: "Your account has been deactivated. Please contact your administrator for assistance.",
          variant: "destructive",
          duration: 8000, // Show for 8 seconds
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    };

    // Listen for the custom logout event
    window.addEventListener('userLoggedOut', handleUserLoggedOut as EventListener);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('userLoggedOut', handleUserLoggedOut as EventListener);
    };
  }, [toast, router]);

  return null; // This component doesn't render anything
};

export default LogoutNotificationListener;
