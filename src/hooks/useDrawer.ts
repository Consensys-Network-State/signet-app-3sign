import { useSearchParams } from 'react-router';

interface DrawerState {
  isOpen: boolean;
  blockId: string | null;
  blockType: string | null;
}

export const useDrawer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openDrawer = (blockId: string, blockType: string) => {
    setSearchParams(params => {
      params.set('drawer', 'true');
      params.set('blockId', blockId);
      params.set('blockType', blockType);
      return params;
    });
  };

  const closeDrawer = () => {
    setSearchParams({});
  };

  const drawerState: DrawerState = {
    isOpen: searchParams.get('drawer') === 'true',
    blockId: searchParams.get('blockId'),
    blockType: searchParams.get('blockType'),
  };

  return {
    openDrawer,
    closeDrawer,
    drawerState,
  };
}; 