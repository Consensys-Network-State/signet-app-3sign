import React from "react";
import BlockNote from "../components/BlockNote.tsx";
import { Button, ModeToggle, Text, useTheme } from "@ds3/react";
import Account from "../web3/Account.tsx";

const Home: React.FC = () => {
  const { mode } = useTheme();

  return (
    <div className="h-screen">
      <div className="flex flex-col h-full">
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between m-3 rounded-3">
          <h1 className="text-lg font-bold">APOC</h1>
          <div className="flex space-x-4">
            <Button><Text>Agreement Editor</Text></Button>
            <Button><Text>Signing Simulation</Text></Button>
            <Button><Text>Signing Data Log</Text></Button>
          </div>

          <div className="flex space-x-4">
            <Account />
            <ModeToggle />
          </div>

        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] p-4">
            <BlockNote theme={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;