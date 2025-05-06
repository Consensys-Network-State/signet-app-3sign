import * as React from 'react';
import { View } from 'react-native';
import AddressAvatar from "./AddressAvatar.tsx";
import Address from "./Address.tsx";
import { useEnsName } from "wagmi";
import { cn, Button, Icons, copyToClipboard } from "@ds3/react";

interface AddressDisplayProps {
  address: `0x${string}`,
  className?: string;
  avatarClassName?: string;
  showCopyButton?: boolean;
}

const AddressCard: React.FC<AddressDisplayProps> = ({ 
  address, 
  className, 
  avatarClassName,
  showCopyButton = true 
}) => {
  const { data: ensName } = useEnsName({ address });
  return (address ?
    <View className={cn("h-12 items-center flex flex-row", showCopyButton && "justify-between", className)}>
      <View className="flex flex-row items-center">
        <AddressAvatar address={address} className={cn("w-8 h-8 mr-3", avatarClassName)} />
        <View>
          { !!ensName &&
            <Address address={address} />
          }
          <Address address={address} ens={false} />
        </View>
      </View>
      {showCopyButton && (
        <Button 
          variant="ghost" 
          size="sm"
          onPress={() => copyToClipboard(address)}
        >
          <Button.Icon icon={Icons.Copy} className="text-neutral-11" />
        </Button>
      )}
    </View> : null
  )
}

export default AddressCard;
