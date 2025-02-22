import * as React from "react";
import { View } from "react-native";

interface DrawerProps {
  children?: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ children }) => {
  return (
    <View className="w-80 bg-neutral-4 rounded-4 p-4">
      {children}
      Some test content
    </View>
  );
};

export default Drawer; 