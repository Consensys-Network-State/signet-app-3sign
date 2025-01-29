import * as React from "react";
import { Button, Text, utils } from "@ds3/react";
import { useConnect, Connector } from "wagmi";
import MetaMaskLogo from "../assets/metamask.svg?react";

interface MetaMaskLoginProps {
  className?: string;
}

const MetaMaskLogin: React.FC<MetaMaskLoginProps> = ({ className }) => {
  const [isConnecting, setIsConnecting] = React.useState(false)

  const { connectors, connect } = useConnect({
    mutation: {
      onError() {
        setIsConnecting(false)
      },
      onSuccess() {
        setIsConnecting(false)
      }
    },
  })


  const metaMaskConnector = connectors.find(
    (connector) => connector.name === 'MetaMask'
  );

  const handleConnect = () => {
    setIsConnecting(true)
    connect({ connector: metaMaskConnector as Connector })
  }

  return (metaMaskConnector ?
    <Button
      className={utils.cn("w-full", className)}
      variant="soft"
      onPress={handleConnect}
      disabled={isConnecting}
      loading={isConnecting}
    >
      <Button.Spinner icon={MetaMaskLogo} />
      <Button.Text>Login with MetaMask</Button.Text>
    </Button> :
    <Text>You need metamask to connect to this application</Text>
  );
}

export default MetaMaskLogin;