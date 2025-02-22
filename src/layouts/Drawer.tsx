import * as React from "react";
import { View } from "react-native";
import { useSearchParams } from 'react-router';
import SablierDrawer from "../blocks/SablierDrawer";
import type { schema } from "../blocks/BlockNoteSchema";

interface DrawerProps {
  children?: React.ReactNode;
  editor?: typeof schema.BlockNoteEditor;
}

const Drawer: React.FC<DrawerProps> = ({ children, editor }) => {
  const [searchParams] = useSearchParams();
  const blockType = searchParams.get('blockType');
  const blockId = searchParams.get('blockId');
  const block = blockId && editor ? editor.getBlock(blockId) : null;

  return (
    <View className="w-[320px] bg-white shadow-lg p-4">
      {blockType === 'sablier' && blockId && editor ? (
        <SablierDrawer
          block={block as any}
          editor={editor}
        />
      ) : (
        children
      )}
    </View>
  );
};

export default Drawer;