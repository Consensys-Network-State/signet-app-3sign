import { useSearchParams } from 'react-router';
import { IconButton } from '@ds3/react';
import { Pencil, X } from "lucide-react-native";
import { FC } from "react";
import type { SablierBlock } from './BlockNoteSchema';

interface ToggleDrawerProps {
  disabled?: boolean
  block: SablierBlock;
  editor: any;
}

const ToggleDrawer: FC<ToggleDrawerProps> = (props) => {
  const { disabled = false, block } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isOpen = searchParams.get('blockId') === block.id;

  const handleEdit = () => {
    if (isOpen) {
      setSearchParams({});
    } else {
      setSearchParams(params => {
        params.set('drawer', 'true');
        params.set('blockId', block.id);
        params.set('blockType', block.type);
        return params;
      });
    }
  };

  return (
    <IconButton
      variant="ghost"
      icon={isOpen ? X : Pencil}
      disabled={disabled}
      onPress={handleEdit}
    />
  );
};

export default ToggleDrawer;