import * as React from "react";
import { View } from "react-native";
import {Icon, ModeToggle, Text} from "@ds3/react";
import Account from "../web3/Account.tsx";
import { H4 } from "@ds3/react/src/components/Heading.tsx";
import { Info } from 'lucide-react-native';
import { useSearchParams } from "react-router";
import Drawer from "./Drawer.tsx";

interface LayoutProps {
  children?: React.ReactNode;
  rightHeader?: React.ReactNode;
  status?: {
    message: string;
    type?: 'warning' | 'info' | 'error';
    actions?: React.ReactNode;
  };
  rightMenu?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, rightHeader, status, rightMenu = true }) => {
  const [searchParams] = useSearchParams();
  const showDrawer = searchParams.get("drawer") === "true";

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
            <View className={`w-full flex flex-row h-14 items-center justify-between px-8 py-2 ${getStatusBackgroundColor(status.type)}`}>
              <View className="flex flex-row items-center">
                <Icon className="mr-2" icon={Info} />
                <Text>{status.message}</Text>
              </View>
              { status.actions &&
                <View className="flex flex-row items-center px-4 gap-2">
                  {status.actions}
                </View>
              }
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
        <View className="flex-1 flex-grow overflow-y-auto">
          <View className={`mx-auto w-full ${showDrawer ? 'max-w-[1520px]' : 'max-w-[1200px]'} p-8 m-12 rounded-4`}>
            <View className="flex flex-row gap-8">
              <View className="flex-1">
                {children}
              </View>
              {showDrawer && rightMenu && (
                <Drawer>
                  {rightMenu}
                </Drawer>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default Layout;