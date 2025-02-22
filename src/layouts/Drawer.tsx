import * as React from "react";
import { View } from "react-native";

interface DrawerProps {
  children?: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ children }) => {
  return (
    <View className="w-[320px] bg-white shadow-lg p-4">
      {children}
      Some test content
    </View>
  );
};

export default Drawer; 