import { FC } from 'react';
import { Text } from "@ds3/react";
import { View } from 'react-native';

interface SignatureProps {
  name?: string;
  address?: string;
}

const Signature: FC<SignatureProps> = (props) => {
  const {
    name,
    address
  } = props;

  return (
    <>
      <View className="mb-4 color-neutral-11">Signed By:</View>
      <View className="border-l-4 border-secondary-9 pl-2">
        <Text className="text-h2 font-cursive font-normal text-neutral-12">{name}</Text>
        <Text className="text-neutral-a11">{address}</Text>
      </View>
    </>
  );
};

export default Signature;
