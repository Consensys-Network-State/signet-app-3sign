import * as React from "react";
import { View } from "react-native";
import { useSearchParams } from 'react-router';
import { useDrawer } from "../hooks/useDrawer";

interface DrawerProps {
  children?: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const { closeDrawer } = useDrawer();
  const showDrawer = searchParams.get('drawer') === 'true';

  React.useEffect(() => {
    if (!showDrawer) {
      closeDrawer();
    }
  }, [showDrawer, closeDrawer]);

  if (!showDrawer) {
    return null;
  }

  return (
    <View className="w-[320px] bg-white shadow-lg p-4">
      <View className="text-lg">Hello World</View>
      {children}
    </View>
  );
};

export default Drawer;