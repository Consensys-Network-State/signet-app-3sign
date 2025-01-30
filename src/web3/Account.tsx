import * as React from 'react';
import {
  Button,
  Avatar,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import makeBlockie from 'ethereum-blockies-base64';
import { ChevronDown } from 'lucide-react-native';

interface AccountProps {
  className?: string;
}

const Account: React.FC<AccountProps> = ({ className }) => {
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
        <Button className={utils.cn("flex flex-row", className)} variant="soft" >
          <Avatar alt="Zach Nugent's Avatar" className="mr-3 w-6 h-6">
            <AvatarImage source={{ uri: ensAvatar ? ensAvatar as string : makeBlockie(address!) }} />
          </Avatar>
          { address && <Text>{truncateEthAddress(address as string)}</Text> }
          <Button.Icon icon={ChevronDown} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent insets={contentInsets} className='w-64 native:w-72'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onPress={() => navigator.clipboard.writeText(address) }>
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