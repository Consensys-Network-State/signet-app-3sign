import * as React from 'react';
import { View } from 'react-native';
import AddressAvatar from "./AddressAvatar.tsx";
import Address from "./Address.tsx";

interface AddressDisplayProps {
  address: `0x${string}`,
}

const AddressCard: React.FC<AddressDisplayProps> = ({ address }) => {
  return (address ?
    <View className="h-12 items-center flex flex-row">
      <AddressAvatar address={address} className="mr-3" />
      <View>
        <Address address={address} />
        <Address address={address} ens={false} />
      </View>
    </View> : null
  )
}

export default AddressCard;
