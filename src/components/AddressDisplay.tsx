import * as React from 'react';
import { View } from 'react-native';
import { useEnsAvatar, useEnsName } from "wagmi";
import { normalize } from 'viem/ens'
import {Avatar, AvatarImage, Text} from "@ds3/react";
import makeBlockie from 'ethereum-blockies-base64';
import truncateEthAddress from 'truncate-eth-address';

interface AddressDisplayProps {
  address: `0x${string}` | null
}
const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {

  if (!address) return <></>

  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ? normalize(ensName as string) : "" })

  return (
    <View className="h-12 items-center flex flex-row">
      <Avatar className="mr-3" alt="wallet-avatar">
        <AvatarImage source={{ uri: ensAvatar ? ensAvatar as string : makeBlockie(address) }} />
      </Avatar>
      <View>
        { ensName && <Text>{ensName}</Text> }
        <Text>{truncateEthAddress(address as string)}</Text>
      </View>
    </View>
  )
}

export default AddressDisplay;
