import { useAppStore } from '@/store/useAppStore';
import { useSidebarStore } from '@/store/useSidebarStore';

export const useStore = () => {
  const appStore = useAppStore();
  const sidebarStore = useSidebarStore();

  return {
    ...appStore,
    sidebar: {
      isOpen: sidebarStore.isOpen,
      isMobile: sidebarStore.isMobile,
      isCollapsed: sidebarStore.isCollapsed,
      toggleSidebar: sidebarStore.toggleSidebar,
      setOpen: sidebarStore.setOpen,
      setMobile: sidebarStore.setMobile,
      setCollapsed: sidebarStore.setCollapsed,
    }
  };
};