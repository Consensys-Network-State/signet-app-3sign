import { useSearchParams } from 'react-router';

interface DrawerState {
  showDrawer: boolean;
}

export const useDrawer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openDrawer = () => {
    setSearchParams(params => {
      params.set('drawer', 'true');
      return params;
    });
  };

  const closeDrawer = () => {
    setSearchParams(params => {
      params.delete('drawer');
      return params;
    });
  };

  const drawerState: DrawerState = {
    showDrawer: searchParams.get('drawer') === 'true',
  };

  return {
    openDrawer,
    closeDrawer,
    drawerState,
  };
}; 