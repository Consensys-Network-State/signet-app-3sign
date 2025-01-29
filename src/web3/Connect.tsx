import { useConnect } from 'wagmi'
import { Button, Text } from "@ds3/react";

export function Connect() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <Button
      className="w-full"
      variant="soft"
      key={connector.uid}
      onPress={() => connect({ connector })}
    >
      <Text>{connector.name}</Text>
    </Button>
  ))
}