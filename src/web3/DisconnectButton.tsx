import { Button, ButtonRootProps } from "@ds3/ui";
import { useDisconnect } from 'wagmi';

const DisconnectButton: React.FC<ButtonRootProps> = ({ children, ...otherProps }) => {
  const { disconnect } = useDisconnect();

  return (
    <Button variant="soft" {...otherProps} onPress={disconnect}>
      {children || <Button.Text>Disconnect</Button.Text>}
    </Button>
  )
}

export default DisconnectButton;