import { FC } from "react";
import { View, ScrollView } from 'react-native';
import { Text, Card, CardContent, CardHeader } from '@ds3/react';
import { useVariablesStore } from '../store/variablesStore';

const VariablesDrawer: FC = () => {
  const { variables } = useVariablesStore();

  // Group variables by blockId first
  const groupedByBlock = Object.values(variables).reduce((acc, variable) => {
    if (!acc[variable.blockId]) {
      acc[variable.blockId] = {
        blockType: variable.blockType,
        variables: [],
      };
    }
    acc[variable.blockId].variables.push(variable);
    return acc;
  }, {} as Record<string, { blockType: string; variables: typeof variables[keyof typeof variables][] }>);

  return (
    <View className="flex flex-col h-full">
      <Text className="text-lg font-semibold mb-4">Variables</Text>
      
      <ScrollView className="flex-1">
        {Object.entries(groupedByBlock).map(([blockId, { blockType, variables }]) => (
          <Card key={blockId} className="mb-4">
            <CardHeader>
              <Text className="text-sm font-medium text-muted-foreground capitalize">
                {blockType} Block
              </Text>
              <Text className="text-xs text-muted-foreground">
                ID: {blockId}
              </Text>
            </CardHeader>
            <CardContent>
              {variables.map((variable) => (
                <View key={variable.id} className="mb-2 py-2 border-b border-neutral-6 last:border-0">
                  <Text className="text-sm font-medium">{variable.propName}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {typeof variable.value === 'object' 
                      ? JSON.stringify(variable.value)
                      : String(variable.value)}
                  </Text>
                </View>
              ))}
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export default VariablesDrawer; 