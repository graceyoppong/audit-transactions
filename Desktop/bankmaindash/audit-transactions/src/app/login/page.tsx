"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username });
      const result = await login(username, password);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, redirecting to dashboard...');
        router.push("/dashboard");
      } else {
        console.log('Login failed:', result.error);
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Left Side - Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
          <div className="text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm mx-auto">
              <span className="text-4xl font-bold">B</span>
            </div>
            <h1 className="text-6xl font-bold mb-6">BankDash</h1>
            <p className="text-xl text-center text-blue-100 max-w-md leading-relaxed">
              Monitor and analyze your banking transactions with powerful
              insights and real-time financial analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              BankDash
            </h1>
          </div>

          <Card
            className={`shadow-xl ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border-0"
            }`}
          >
            <CardHeader className="space-y-1 pb-6">
              <CardTitle
                className={`text-2xl font-bold text-center ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Welcome back
              </CardTitle>
              <CardDescription
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert
                    className={`${
                      isDark
                        ? "border-red-600 bg-red-900/20"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <AlertDescription
                      className={`${isDark ? "text-red-400" : "text-red-700"}`}
                    >
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className={`h-4 w-4 ${
                            isDark ? "text-gray-400" : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <Eye
                          className={`h-4 w-4 ${
                            isDark ? "text-gray-400" : "text-gray-400"
                          }`}
                        />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Enter your credentials to access the dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
