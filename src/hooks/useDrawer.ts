import { useSearchParams } from 'react-router';

interface DrawerState {
  blockId: string | null;
  showVariables: boolean;
}

export const useDrawer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openDrawer = (type: string | 'variables') => {
    setSearchParams(params => {
      if (type === 'variables') {
        params.set('variables', 'true');
        params.delete('blockId');
      } else {
        params.set('blockId', type);
        params.delete('variables');
      }
      return params;
    });
  };

  const closeDrawer = () => {
    setSearchParams(params => {
      params.delete('blockId');
      params.delete('variables');
      return params;
    });
  };

  const drawerState: DrawerState = {
    blockId: searchParams.get('blockId'),
    showVariables: searchParams.get('variables') === 'true',
  };

  return {
    openDrawer,
    closeDrawer,
    drawerState,
  };
}; 