import { FC } from "react";
import { View } from 'react-native';
import { Text } from '@ds3/react';

const VariablesDrawer: FC = () => {
  return (
    <View className="flex flex-col h-full">
      <Text className="text-lg font-semibold mb-4">Variables</Text>
      {/* Add your variables content here */}
    </View>
  );
};

export default VariablesDrawer; 