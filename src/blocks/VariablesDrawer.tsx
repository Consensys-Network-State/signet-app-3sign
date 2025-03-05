import { FC } from "react";
import { View, ScrollView } from 'react-native';
import { Text, Card, CardContent } from '@ds3/react';
import { useVariablesStore } from '../store/variablesStore';
import AddressAvatar from "../web3/AddressAvatar";
import dayjs from 'dayjs';
import { isAddress } from 'viem';

const VariablesDrawer: FC = () => {
  const { variables } = useVariablesStore();

  const renderVariableValue = (type: string, value: any) => {
    switch (type) {
      case 'address':
        if (!value || !isAddress(value)) {
          return (
            <Text className="text-sm text-muted-foreground">
              Not set
            </Text>
          );
        }
        return (
          <View className="flex flex-row items-center mt-1">
            <AddressAvatar address={value} className="w-6 h-6 mr-2" />
            <Text className="text-sm text-muted-foreground">{value}</Text>
          </View>
        );
      case 'date':
        return (
          <Text className="text-sm text-muted-foreground">
            {value ? dayjs(value).format('MMM D, YYYY') : 'Not set'}
          </Text>
        );
      case 'boolean':
        return (
          <Text className="text-sm text-muted-foreground">
            {value ? 'Yes' : 'No'}
          </Text>
        );
      default:
        return (
          <Text className="text-sm text-muted-foreground">
            {value || 'Not set'}
          </Text>
        );
    }
  };

  return (
    <View className="flex flex-col h-full">
      <Text className="text-lg font-semibold mb-4">Variables</Text>
      
      <ScrollView className="flex-1">
        <Card className="mb-4">
          <CardContent>
            {Object.values(variables).map((variable) => (
              <View key={variable.name} className="mb-2 py-2 border-b border-neutral-6 last:border-0">
                <Text className="text-sm font-medium">{variable.name}</Text>
                {renderVariableValue(variable.type, variable.value)}
              </View>
            ))}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
};

export default VariablesDrawer; 