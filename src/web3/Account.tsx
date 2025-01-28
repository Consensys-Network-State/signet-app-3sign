import React from 'react';
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Text,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  Icons,
  utils,
} from "@ds3/react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { normalize } from 'viem/ens'
import truncateEthAddress from 'truncate-eth-address'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import makeBlockie from 'ethereum-blockies-base64';

const Account: React.FC = () => {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ? normalize(ensName as string) : "" })

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex flex-row">
          <Avatar alt="Zach Nugent's Avatar" className="mr-3 w-9 h-9">
            <AvatarImage source={{ uri: ensAvatar ? ensAvatar as string : makeBlockie(address!) }} />
            <AvatarFallback>
              <Text>ZN</Text>
            </AvatarFallback>
          </Avatar>
          <View>
            <Text>{ensName}</Text>
            { address && <Text>{truncateEthAddress(address as string)}</Text> }
          </View>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent insets={contentInsets} className='w-64 native:w-72'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icons.Copy className='text-foreground' size={14} />
            <Text>Copy address</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onPress={() => utils.openLink(`https://etherscan.io/address/${address}`)}>
            <Icons.SquareArrowOutUpLeft className='text-foreground' size={14} />
            <Text>View on explorer</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onPress={() => disconnect()}>
            <Icons.LogOut className='text-foreground' size={14} />
            <Text>Disconnect</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>


  )
}

export default Account;