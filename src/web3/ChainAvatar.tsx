import React from 'react';
import { polygon, optimism, arbitrum, linea } from 'viem/chains';
import { Avatar, AvatarImage, cn } from "@ds3/react";

interface ChainAvatarProps {
  chainId: number;
  className?: string
}

const ChainAvatar: React.FC<ChainAvatarProps> = ({ chainId, className }) => {
  const uri = React.useMemo(() => {
    switch(chainId) {
      case polygon.id: return 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=040';
      case optimism.id: return 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=040';
      case arbitrum.id: return 'https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=040';
      case linea.id: return 'https://cdn.bitkeep.vip/operation/u_b_fbe21d90-83a0-11ee-bed6-2b8bafc3726e.png';
      default: return 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040';
    }
  }, [chainId])
  return (
    <Avatar
      alt="chain-logo"
      className={cn("w-5 h-5", className)}
    >
      <AvatarImage source={{ uri }}/>
    </Avatar>
  );
}

export default ChainAvatar;
