import * as React from "react";
import { Text } from "@ds3/ui";
import { useLocation, useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { View } from 'react-native';
import { MetaMaskLogin } from "@ds3/web3";
import AuthenticationLayout from "../layouts/AuthenticationLayout.tsx";

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  // Redirect to where you were trying to go
  React.useEffect(() => {
    if (isConnected) {
      navigate(location.state?.redirect || '/');
    }
  }, [isConnected, navigate, location]);

  return (
    <AuthenticationLayout>
      <View className="mb-12 w-full">
        <MetaMaskLogin />
      </View>
      <Text className="font-bold">Putting blockchain power into the 'Power Suit'*</Text>
      <Text className="text-neutral-11">*Suit and tie remain optional in crypto</Text>
    </AuthenticationLayout>
  );
}

export default Login;