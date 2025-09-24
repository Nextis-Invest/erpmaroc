"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Manager {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  position: string;
  department?: {
    _id: string;
    name: string;
  } | string;
}

interface ManagerSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeEmployeeId?: string; // Pour exclure l'employé actuel de la liste
}

export function ManagerSelector({
  value,
  onValueChange,
  placeholder = "Sélectionner un manager...",
  disabled = false,
  excludeEmployeeId
}: ManagerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Fetch managers from database
  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/hr/employees?active=true&managers=true&limit=100');
        if (response.ok) {
          const result = await response.json();
          const employeesData = result.data?.employees || result.employees || [];
          // Filter out current employee if provided
          const filteredManagers = excludeEmployeeId
            ? employeesData.filter((emp: Manager) => emp._id !== excludeEmployeeId)
            : employeesData;
          setManagers(filteredManagers);
        } else {
          console.error('Failed to fetch managers');
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, [excludeEmployeeId]);

  // Filter managers based on search
  const filteredManagers = useMemo(() => {
    if (!managers || !Array.isArray(managers)) return [];
    if (!searchValue) return managers;

    const searchLower = searchValue.toLowerCase();
    return managers.filter(manager => {
      const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
      const cin = manager.nationalId?.toLowerCase() || '';
      const employeeId = manager.employeeId.toLowerCase();

      return fullName.includes(searchLower) ||
             cin.includes(searchLower) ||
             employeeId.includes(searchLower);
    });
  }, [managers, searchValue]);

  // Find selected manager
  const selectedManager = managers?.find(manager => manager._id === value);

  const handleSelect = (managerId: string) => {
    onValueChange?.(managerId);
    setOpen(false);
  };

  const clearSelection = () => {
    onValueChange?.('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedManager && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-4 w-4 flex-shrink-0" />
            {selectedManager ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">
                  {selectedManager.firstName} {selectedManager.lastName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {selectedManager.employeeId}
                </Badge>
                {selectedManager.nationalId && (
                  <Badge variant="outline" className="text-xs">
                    CIN: {selectedManager.nationalId}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3">
          <div className="flex items-center border rounded-md px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Rechercher par nom ou CIN..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>
        </div>
        <ScrollArea className="max-h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : (
            <div className="p-1">
              {value && (
                <button
                  onClick={clearSelection}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-muted rounded-md"
                >
                  <X className="mr-2 h-4 w-4" />
                  Aucun manager
                </button>
              )}
              {filteredManagers.length === 0 && !loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucun manager trouvé.
                </div>
              ) : (
                filteredManagers.map((manager) => (
                  <button
                    key={manager._id}
                    onClick={() => handleSelect(manager._id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted rounded-md",
                      value === manager._id && "bg-muted"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === manager._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">
                          {manager.firstName} {manager.lastName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {manager.employeeId}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{manager.position}</span>
                        {manager.nationalId && (
                          <>
                            <span>•</span>
                            <span>CIN: {manager.nationalId}</span>
                          </>
                        )}
                      </div>
                      {manager.department && (
                        <div className="text-xs text-muted-foreground">
                          {typeof manager.department === 'string'
                            ? manager.department
                            : manager.department.name}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}