import * as React from "react";

interface SideMenuProps {
  children?: React.ReactNode;
}

const SideMenu: React.FC<SideMenuProps> = ({ children }) => {
  return (
    <div className="h-full">
      <div className="overflow-auto h-full p-4">
        {children}
      </div>
    </div>
  );
};

export default SideMenu; 