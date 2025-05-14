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
  Icon,
  cn,
  openLink,
  copyToClipboard
} from "@ds3/ui";
import { useAccount, useDisconnect } from "wagmi";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Copy, SquareArrowOutUpLeft, LogOut } from 'lucide-react-native';
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
            <Icon icon={Copy} />
            <Text>Copy address</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onPress={() => openLink(`https://etherscan.io/address/${address}`)}>
            <Icon icon={SquareArrowOutUpLeft} />
            <Text>View on explorer</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onPress={() => disconnect()}>
            <Icon icon={LogOut} />
            <Text>Disconnect</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Account;