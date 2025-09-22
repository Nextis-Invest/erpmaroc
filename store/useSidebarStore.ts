import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  isMobile: boolean
  isCollapsed: boolean
  toggleSidebar: () => void
  setOpen: (open: boolean) => void
  setMobile: (mobile: boolean) => void
  setCollapsed: (collapsed: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      isMobile: false,
      isCollapsed: false,

      toggleSidebar: () => set((state) => ({
        isOpen: !state.isOpen,
        isCollapsed: !state.isCollapsed
      })),

      setOpen: (open) => set({ isOpen: open }),

      setMobile: (mobile) => set({ isMobile: mobile }),

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isOpen: state.isOpen,
        isCollapsed: state.isCollapsed
      }),
    }
  )
)