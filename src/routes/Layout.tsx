import React from "react";
import { View } from "react-native";
import { ModeToggle, Text } from "@ds3/react";
import Account from "../web3/Account.tsx";
import { H4 } from "@ds3/react/src/components/Heading.tsx";

interface LayoutProps {
  children?: React.ReactNode;
  rightHeader?: React.ReactNode;
  status?: {
    message: string;
    type?: 'warning' | 'info' | 'error';
  };
}

const Layout: React.FC<LayoutProps> = ({ children, rightHeader, status }) => {
  const getStatusBackgroundColor = (type?: 'warning' | 'info' | 'error') => {
    switch (type) {
      case 'warning':
        return 'bg-warning-3';
      case 'error':
        return 'bg-error-3';
      case 'info':
      default:
        return 'bg-primary-3';
    }
  };

  return (
    <View className="h-screen bg-neutral-1">
      <View className="flex flex-col h-full">

        {/* Navbar */}
        <View className="bg-neutral-1 shadow-md sticky top-0 z-20">
          {/* Status Message */}
          {status && (
            <View className={`w-full px-8 py-2 ${getStatusBackgroundColor(status.type)}`}>
              <Text>{status.message}</Text>
            </View>
          )}

          <View className="flex flex-row items-center justify-between px-8 py-6">
            <H4 className="text-primary-12">APOC</H4>

            <View className="flex flex-row items-center px-4 gap-2">
              {rightHeader}
              <Account />
              <ModeToggle />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          <View className="mx-auto w-full max-w-[1200px] p-8 m-12 rounded-4 shadow-lg">
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}

export default Layout;