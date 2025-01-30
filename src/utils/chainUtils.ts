import { mainnet, sepolia, polygon, optimism, arbitrum, linea } from 'viem/chains';

export const supportedChains = [mainnet, sepolia, polygon, optimism, arbitrum, linea];
export const getChainById = (chainId: number) => {
  const chain = supportedChains.find((c) => c.id === chainId);
  if (chain) {
    return chain;
  }
  return null;
}
