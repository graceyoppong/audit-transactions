"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Bell,
  Lock,
  Camera,
  Edit3,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.username?.split(' ')[0] || 'John',
    lastName: user?.username?.split(' ')[1] || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Banking Street',
    city: 'New York',
    country: 'United States',
    dateOfBirth: '1990-01-15',
    accountType: 'Premium',
    memberSince: '2020-03-15'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset data if needed
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Profile Settings
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/api/placeholder/96/96" alt="Profile" />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {profileData.email}
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Shield className="w-3 h-3 mr-1" />
                    {profileData.accountType} Account
                  </Badge>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Member since {new Date(profileData.memberSince).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="security">Security & Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Details
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button
                    variant={securitySettings.twoFactorEnabled ? "default" : "outline"}
                    onClick={() => handleSecurityChange('twoFactorEnabled', !securitySettings.twoFactorEnabled)}
                  >
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login Alerts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Button
                    variant={securitySettings.loginAlerts ? "default" : "outline"}
                    onClick={() => handleSecurityChange('loginAlerts', !securitySettings.loginAlerts)}
                  >
                    {securitySettings.loginAlerts ? 'On' : 'Off'}
                  </Button>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Change Password</h4>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                    <Button>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive transaction and account updates via email
                    </p>
                  </div>
                  <Button
                    variant={securitySettings.emailNotifications ? "default" : "outline"}
                    onClick={() => handleSecurityChange('emailNotifications', !securitySettings.emailNotifications)}
                  >
                    {securitySettings.emailNotifications ? 'On' : 'Off'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive important alerts via text message
                    </p>
                  </div>
                  <Button
                    variant={securitySettings.smsNotifications ? "default" : "outline"}
                    onClick={() => handleSecurityChange('smsNotifications', !securitySettings.smsNotifications)}
                  >
                    {securitySettings.smsNotifications ? 'On' : 'Off'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400">Account Type</h3>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{profileData.accountType}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="font-semibold text-green-600 dark:text-green-400">Member Since</h3>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {new Date(profileData.memberSince).getFullYear()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="font-semibold text-purple-600 dark:text-purple-400">Security Score</h3>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {securitySettings.twoFactorEnabled ? '95%' : '75%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
