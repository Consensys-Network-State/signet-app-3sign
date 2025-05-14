import * as React from 'react';
import { useEnsName } from "wagmi";
import { Text } from '@ds3/ui';
import truncateEthAddress from 'truncate-eth-address';

interface AddressProps {
  address?: `0x${string}`,
  className?: string,
  ens?: boolean,
  truncate?: boolean
}

const Address: React.FC<AddressProps> = ({
  address,
  ens = true,
  truncate = true,
  ...otherProps
}) => {

  const { data: ensName } = useEnsName({ address });

  const addressText = truncate ? truncateEthAddress(address as string) : address;
  const ensText = ens && ensName ? ensName : addressText;

  return (<Text {...otherProps}>{ens ? ensText : addressText}</Text>);
}

export default Address;