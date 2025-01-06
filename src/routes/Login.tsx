import React from "react";
import { ModeToggle } from "@ds3/react";
import { Connect } from "../web3/Connect.tsx";

const Login: React.FC = () => {
  return (
    <div className="h-screen">
      <div className="flex items-center justify-center h-full w-full">
        <div
          className="flex items-center justify-center bg-no-repeat w-full max-w-[612px] min-w-[300px] h-full"
          // style={{backgroundImage: 'url("./tie.png")'}}
        >
          <div className="bg-neutral-1 p-6 rounded shadow-md text-center">
            <div>
              <h1 className="color-neutral-12 text-heading-12">APOC</h1>
              <p className="color-neutral-12">An onchain agreements proof of concept</p>
              <Connect/>
              <p>Putting blockchain power into the 'Power Suit'*</p>
              <p>*Suit and tie remain optional in crypto</p>
            </div>
          </div>
        </div>
      </div>
      <ModeToggle className="absolute top-2 right-2 px-4 py-2">
        Click Me
      </ModeToggle>
    </div>
  );
}

export default Login;