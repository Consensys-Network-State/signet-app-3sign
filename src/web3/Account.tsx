import * as React from 'react';
import {
  Button,
  Text,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  Icons,
  cn,
  openLink,
  copyToClipboard
} from "@ds3/react";
import { useAccount, useDisconnect } from "wagmi";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';
import AddressAvatar from "./AddressAvatar.tsx";
import Address from "./Address.tsx";

interface AccountProps {
  className?: string;
}

const Account: React.FC<AccountProps> = ({ className }) => {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

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
        <Button className={cn("flex flex-row", className)} variant="soft" >
          <AddressAvatar address={address} className="mr-1 w-6 h-6" />
          <Address address={address} />
          <Button.Icon icon={ChevronDown} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent insets={contentInsets} className='w-64 native:w-72'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onPress={() => copyToClipboard(address as string) }>
            <Icons.Copy className='text-foreground' size={14} />
            <Text>Copy address</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onPress={() => openLink(`https://etherscan.io/address/${address}`)}>
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