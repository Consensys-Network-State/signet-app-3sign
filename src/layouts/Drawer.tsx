import * as React from "react";
import { View } from "react-native";
import { useSearchParams } from 'react-router';
import SablierDrawer from "../blocks/SablierDrawer";
import type { schema } from "../blocks/BlockNoteSchema";
import { useDrawer } from "../hooks/useDrawer";

interface DrawerProps {
  children?: React.ReactNode;
  editor?: typeof schema.BlockNoteEditor;
}

const Drawer: React.FC<DrawerProps> = ({ children, editor }) => {
  const [searchParams] = useSearchParams();
  const { closeDrawer } = useDrawer();
  const blockId = searchParams.get('blockId');

  React.useEffect(() => {
    if (blockId && editor) {
      const block = editor.getBlock(blockId);
      if (!block) {
        closeDrawer();
      } else {
        // Scroll to block when drawer opens
        const blockElement = document.querySelector(`[data-id="${blockId}"]`);
        if (blockElement) {
          blockElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    }
  }, [blockId, editor, closeDrawer]);

  const block = blockId && editor ? editor.getBlock(blockId) : null;

  return (
    <View className="w-[320px] bg-white shadow-lg p-4">
      {block?.type === 'sablier' && blockId && editor ? (
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