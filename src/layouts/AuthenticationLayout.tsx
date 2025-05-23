import { H1, H3, ModeToggle, Theme } from "@consensys/ui";
import { Platform } from 'react-native';
import * as React from "react";

interface AuthenticationLayoutProps {
  children?: React.ReactNode;
}
const AuthenticationLayout: React.FC<AuthenticationLayoutProps> = ({ children }) => (
  <div className="h-screen bg-neutral-1">
    <div className="flex items-center justify-center h-full w-full">
      <div
        className="flex items-center justify-center bg-no-repeat w-full max-w-[612px] min-w-[300px] h-full"
        style={Platform.OS === 'web' ? { backgroundImage: 'url("./tie.png")' } as any : {}}
      >
        <Theme className="flex items-center w-[440px]" mode="dark">
          <H1 className="text-primary-12">APOC</H1>
          <H3 className="color-neutral-12 text-h3 mb-12 text-center">An onchain agreements proof of concept</H3>
          {!!children && children}
        </Theme>
      </div>
    </div>
    <ModeToggle className="absolute top-2 right-2" />
  </div>
)

export default AuthenticationLayout;