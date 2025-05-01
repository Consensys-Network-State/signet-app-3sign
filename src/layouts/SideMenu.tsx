import * as React from "react";
import { View } from "react-native";

interface SideMenuProps {
  children?: React.ReactNode;
}

const SideMenu: React.FC<SideMenuProps> = ({ children }) => {
  return (
    <View className="h-full bg-white">
      <View className="overflow-auto h-full p-4">
        {children}
      </View>
    </View>
  );
};

export default SideMenu; 