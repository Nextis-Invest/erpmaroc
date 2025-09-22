"use client";

import React, { useEffect } from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import {
  SidebarProvider as ShadcnSidebarProvider,
} from "@/components/ui/sidebar";

export const SidebarProvider = ({ children, ...props }: React.ComponentProps<typeof ShadcnSidebarProvider>) => {
  const { isOpen, setOpen, setMobile } = useSidebarStore();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobile]);

  return (
    <ShadcnSidebarProvider
      open={isOpen}
      onOpenChange={setOpen}
      {...props}
    >
      {children}
    </ShadcnSidebarProvider>
  );
};