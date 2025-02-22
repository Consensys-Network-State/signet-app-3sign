import { IconButton } from '@ds3/react';
import { Pencil, X } from "lucide-react-native";
import { FC } from "react";
import type { SablierBlock } from './BlockNoteSchema';
import { useDrawer } from '../hooks/useDrawer';

interface ToggleDrawerProps {
  disabled?: boolean;
  block: SablierBlock;
  editor: any;
}

const ToggleDrawer: FC<ToggleDrawerProps> = (props) => {
  const { disabled = false, block } = props;
  const { openDrawer, closeDrawer, drawerState } = useDrawer();
  
  const isOpen = drawerState.blockId === block.id;

  const handleToggle = () => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer(block.id);
    }
  };

  return (
    <IconButton
      variant="ghost"
      icon={isOpen ? X : Pencil}
      disabled={disabled}
      onPress={handleToggle}
    />
  );
};

export default ToggleDrawer;