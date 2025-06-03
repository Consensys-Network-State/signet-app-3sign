import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { MetaMaskLogin } from "@consensys/ds3-web3";
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
      <div className="mb-12 w-full">
        <MetaMaskLogin />
      </div>
      <p className="font-bold mb-0">Putting blockchain power into the 'Power Suit'*</p>
      <p className="text-neutral-11">*Suit and tie remain optional in crypto</p>
    </AuthenticationLayout>
  );
}

export default Login;