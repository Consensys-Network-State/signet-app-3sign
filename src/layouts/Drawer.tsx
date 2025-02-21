import * as React from "react";
import { View } from "react-native";

interface DrawerProps {
  children?: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ children }) => {
  return (
    <View className="w-80 bg-neutral-2 rounded-4 p-4">
      {children}
    </View>
  );
};

export default Drawer; 