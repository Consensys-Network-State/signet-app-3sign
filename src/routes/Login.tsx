import * as React from "react";
import { ModeToggle, Text, Theme, H1, H3 } from "@ds3/react";
import { useLocation, useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { View } from 'react-native';
import MetaMaskLogin from "../web3/MetaMaskLogin.tsx";

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
    <View className="h-screen bg-neutral-1">
      <View className="flex items-center justify-center h-full w-full">
        <View
          className="flex items-center justify-center bg-no-repeat w-full max-w-[612px] min-w-[300px] h-full"
          style={{ backgroundImage: 'url("./tie.png")' }}
        >
          <Theme className="flex items-center w-[440px]" mode="dark">
            <H1 className="text-primary-12">APOC</H1>
            <H3 className="color-neutral-12 text-h3 mb-12 text-center">An onchain agreements proof of concept</H3>

            <View className="mb-12 w-full">
              <MetaMaskLogin />
            </View>
            <Text className="font-bold">Putting blockchain power into the 'Power Suit'*</Text>
            <Text className="text-neutral-11">*Suit and tie remain optional in crypto</Text>
          </Theme>
        </View>
      </View>
      <ModeToggle className="absolute top-2 right-2 px-4 py-2" />
    </View>
  );
}

export default Login;