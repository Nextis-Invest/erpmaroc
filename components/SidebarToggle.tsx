"use client";

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ className }) => {
  const { toggleSidebar } = useSidebarStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      onClick={toggleSidebar}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
};