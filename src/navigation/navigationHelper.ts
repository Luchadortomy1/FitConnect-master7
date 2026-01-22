// Navigation helper utilities
export const navigationHelper = {
  navigationRef: null as any,
  setNavigationRef: (ref: any) => {
    navigationHelper.navigationRef = ref;
  },
  navigate: (name: string, params?: any) => {
    if (navigationHelper.navigationRef?.isReady()) {
      navigationHelper.navigationRef.navigate(name, params);
    }
  },
};