import { FC } from 'react';
import { Text, Button } from "@ds3/react";
import { View } from 'react-native';
import { Edit2 as EditIcon } from 'lucide-react-native';

interface DocumentSignatureProps {
  name?: string;
  signature?: string;
  onEdit?: () => void;
  disabled?: boolean;
}

const DocumentSignature: FC<DocumentSignatureProps> = (props) => {
  const {
    signature,
    onEdit,
    disabled
  } = props;

  return (
    <View className="flex flex-col">
      <Text className="block color-neutral-11">Signed By:</Text>
      <View className="mt-4">
        <View className="flex-row items-center w-fit">
          <View className="border-l-4 border-secondary-9 pl-2 flex-1">
            <Text className="text-h2 font-cursive font-normal text-neutral-12">{signature}</Text>
          </View>
          {onEdit && !disabled && (
            <View className="flex items-center justify-center ml-3">
              <Button variant="ghost" size="sm" onPress={onEdit}>
                <Button.Icon icon={EditIcon} />
              </Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DocumentSignature; 