import { useSearchParams } from 'react-router';

interface DrawerState {
  isOpen: boolean;
  blockId: string | null;
}

export const useDrawer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openDrawer = (blockId: string) => {
    setSearchParams(params => {
      params.set('drawer', 'true');
      params.set('blockId', blockId);
      return params;
    });
  };

  const closeDrawer = () => {
    setSearchParams(params => {
      params.delete('drawer');
      params.delete('blockId');
      return params;
    });
  };

  const drawerState: DrawerState = {
    isOpen: searchParams.get('drawer') === 'true',
    blockId: searchParams.get('blockId'),
  };

  return {
    openDrawer,
    closeDrawer,
    drawerState,
  };
}; 