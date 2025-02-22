import { useSearchParams } from 'react-router';

interface DrawerState {
  blockId: string | null;
}

export const useDrawer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openDrawer = (blockId: string) => {
    setSearchParams(params => {
      params.set('blockId', blockId);
      return params;
    });
  };

  const closeDrawer = () => {
    setSearchParams(params => {
      params.delete('blockId');
      return params;
    });
  };

  const drawerState: DrawerState = {
    blockId: searchParams.get('blockId'),
  };

  return {
    openDrawer,
    closeDrawer,
    drawerState,
  };
}; 