import * as React from 'react';
import { useEnsAvatar, useEnsName } from "wagmi";
import { normalize } from 'viem/ens'
import { Avatar, AvatarImage, cn } from "@ds3/ui";
import makeBlockie from 'ethereum-blockies-base64';

// todo: add fallback if there is nothing

interface AddressAvatarProps {
  address?: `0x${string}`,
  className?: string,
  ens?: boolean
}

const AddressAvatar: React.FC<AddressAvatarProps> = ({
 address,
 className,
 ens = true,
 ...otherProps
}) => {

  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({
    name: ens && ensName ? normalize(ensName as string) : ""
  });

  const avatarSource = ens && ensAvatar ?
    ensAvatar as string :
    makeBlockie(address as string);

  return (
    <Avatar alt={ensName || address as string} className={cn("w-8 h-8", className)} {...otherProps}>
      <AvatarImage source={{ uri: avatarSource }} />
    </Avatar>
  );
}

export default AddressAvatar;