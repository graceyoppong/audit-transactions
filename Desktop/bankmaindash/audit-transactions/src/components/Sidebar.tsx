"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  CreditCard,
  BarChart3,
  Users,
  UserPlus,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: CreditCard, label: "Transactions", path: "/transactions" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: UserPlus, label: "User Creation", path: "/user-creation" },
    { icon: Users, label: "User Management", path: "/user-management" },
    { icon: Globe, label: "Services", path: "/services" },
    { icon: Plus, label: "Service Creation", path: "/service-creation" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (path === "/transactions") {
      return pathname.startsWith("/transactions");
    }
    if (path === "/analytics") {
      return pathname === "/analytics";
    }
    if (path === "/user-creation") {
      return pathname === "/user-creation";
    }
    if (path === "/user-management") {
      return pathname === "/user-management";
    }
    if (path === "/service-creation") {
      return pathname === "/service-creation";
    }
    if (path === "/services") {
      return pathname.startsWith("/services");
    }
    return pathname === path;
  };

  const handleNavigation = (path: string) => {
    if (path === "/transactions") {
      // Don't navigate to /transactions directly, stay on current page
      return;
    }
    router.push(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out overflow-hidden
        ${
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full w-0 lg:translate-x-0 lg:w-16"
        }
        ${!isOpen && "hidden lg:block"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center ${
              isOpen ? "justify-between" : "justify-center lg:justify-center"
            } p-4 border-b border-gray-200 dark:border-gray-700 h-16`}
          >
            <div
              className={`flex items-center space-x-3 ${
                !isOpen && "lg:justify-center"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              {isOpen && (
                <span className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">
                  BankDash
                </span>
              )}
            </div>

            {/* Desktop toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className={`hidden lg:flex ${!isOpen && "lg:hidden"}`}
            >
              {isOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full transition-all duration-200
                      ${
                        isOpen
                          ? "justify-start"
                          : "justify-center lg:justify-center"
                      }
                      ${isOpen ? "px-3" : "px-0 lg:px-2"}
                      ${
                        isActive(item.path)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {isOpen && (
                      <span className="ml-3 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop collapse button when sidebar is collapsed */}
          {!isOpen && (
            <div className="hidden lg:block p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                onClick={onToggle}
                className="w-full justify-center p-2"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
