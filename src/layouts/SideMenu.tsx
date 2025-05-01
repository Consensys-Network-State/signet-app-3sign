import * as React from "react";
import { View } from "react-native";

interface SideMenuProps {
  children?: React.ReactNode;
}

const SideMenu: React.FC<SideMenuProps> = ({ children }) => {
  return (
    <View className="w-[320px] bg-white p-4">
      {children}
    </View>
  );
};

export default SideMenu; 