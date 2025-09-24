"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Plus, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Department {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  manager?: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  parentDepartment?: {
    _id: string;
    name: string;
  };
}

interface DepartmentSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  label?: string;
  required?: boolean;
}

// Fallback departments when API is not available
const FALLBACK_DEPARTMENTS: Department[] = [
  {
    _id: 'fallback-rh',
    name: 'Ressources Humaines',
    code: 'RH',
    description: 'Gestion du personnel et des politiques RH'
  },
  {
    _id: 'fallback-dev',
    name: 'Développement',
    code: 'DEV',
    description: 'Développement logiciel et applications'
  },
  {
    _id: 'fallback-sales',
    name: 'Ventes et Marketing',
    code: 'VENTE',
    description: 'Équipe commerciale et marketing'
  },
  {
    _id: 'fallback-finance',
    name: 'Finance et Comptabilité',
    code: 'FINANCE',
    description: 'Gestion financière et comptable'
  },
  {
    _id: 'fallback-ops',
    name: 'Opérations',
    code: 'OPS',
    description: 'Opérations et logistique'
  },
  {
    _id: 'fallback-support',
    name: 'Support Client',
    code: 'SUPPORT',
    description: 'Service client et support technique'
  }
];

export function DepartmentSelector({
  value,
  onValueChange,
  placeholder = "Sélectionner un département...",
  disabled = false,
  allowCreate = true,
  label,
  required = false
}: DepartmentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // New department form state
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    description: ''
  });

  // Fetch departments from database
  useEffect(() => {
    const fetchDepartments = async () => {
      console.log('🔍 [DepartmentSelector] Starting department fetch...');
      setLoading(true);
      try {
        // Add bypass parameter for development
        const url = process.env.NODE_ENV === 'development'
          ? '/api/departments?bypass=true'
          : '/api/departments';

        console.log('📡 [DepartmentSelector] Fetching from:', url);
        const response = await fetch(url);

        console.log('📨 [DepartmentSelector] Response received:', {
          status: response.status,
          ok: response.ok
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ [DepartmentSelector] Data parsed:', {
            hasDepartments: !!result.data?.departments,
            departmentCount: result.data?.departments?.length || 0
          });

          const departmentsData = result.data?.departments || result.departments || [];
          setDepartments(departmentsData);

          if (departmentsData.length > 0) {
            console.log('📋 [DepartmentSelector] Departments loaded:', departmentsData.map(d => d.name));
          } else {
            console.log('⚠️ [DepartmentSelector] No departments found in database');
          }
        } else {
          console.error('❌ [DepartmentSelector] Failed to fetch departments:', response.status, response.statusText);
          console.log('🔄 [DepartmentSelector] Using fallback departments');
          setDepartments(FALLBACK_DEPARTMENTS);
          setUsingFallback(true);
        }
      } catch (error) {
        console.error('❌ [DepartmentSelector] Error fetching departments:', error);
        console.log('🔄 [DepartmentSelector] Using fallback departments due to error');
        setDepartments(FALLBACK_DEPARTMENTS);
        setUsingFallback(true);
      } finally {
        setLoading(false);
        console.log('🏁 [DepartmentSelector] Fetch completed');
      }
    };

    fetchDepartments();
  }, []);

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    if (!departments || !Array.isArray(departments)) return [];
    if (!searchValue) return departments;

    const searchLower = searchValue.toLowerCase();
    return departments.filter(department => {
      const name = department.name.toLowerCase();
      const code = department.code?.toLowerCase() || '';
      const parentName = department.parentDepartment?.name?.toLowerCase() || '';

      return name.includes(searchLower) ||
             code.includes(searchLower) ||
             parentName.includes(searchLower);
    });
  }, [departments, searchValue]);

  // Find selected department
  const selectedDepartment = departments?.find(department => department._id === value);

  const handleSelect = (departmentId: string) => {
    onValueChange?.(departmentId);
    setOpen(false);
  };

  const clearSelection = () => {
    onValueChange?.('');
    setOpen(false);
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim()) return;

    setCreateLoading(true);
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDepartment.name.trim(),
          code: newDepartment.code.trim() || undefined,
          description: newDepartment.description.trim() || undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const createdDepartment = result.data.department;

        // Add the new department to the list
        setDepartments(prev => [...prev, createdDepartment]);

        // Select the newly created department
        onValueChange?.(createdDepartment._id);

        // Reset form and close dialog
        setNewDepartment({ name: '', code: '', description: '' });
        setShowCreateDialog(false);
        setOpen(false);
      } else {
        const error = await response.json();
        console.error('Failed to create department:', error.error);
        // You could show a toast notification here
        alert(error.error || 'Erreur lors de la création du département');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Erreur lors de la création du département');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedDepartment && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              {selectedDepartment ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{selectedDepartment.name}</span>
                  {selectedDepartment.code && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedDepartment.code}
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="truncate">{placeholder}</span>
              )}
            </div>
            <Building2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3">
            {usingFallback && (
              <div className="mb-2 px-2 py-1 text-xs text-amber-600 bg-amber-50 rounded border">
                ⚠️ Mode hors ligne - données temporaires
              </div>
            )}
            <div className="flex items-center border rounded-md px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Rechercher par nom ou code..."
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
                {/* Create new department option - disabled when using fallback */}
                {allowCreate && searchValue && !usingFallback && (
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-blue-600 hover:bg-muted rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Créer "{searchValue}"
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un nouveau département</DialogTitle>
                        <DialogDescription>
                          Créer un nouveau département qui sera disponible immédiatement.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom du département *</Label>
                          <Input
                            id="name"
                            value={newDepartment.name}
                            onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Entrez le nom du département"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Code (optionnel)</Label>
                          <Input
                            id="code"
                            value={newDepartment.code}
                            onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="Ex: RH, IT, VENTE"
                            maxLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (optionnel)</Label>
                          <Input
                            id="description"
                            value={newDepartment.description}
                            onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description du département"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={handleCreateDepartment}
                          disabled={!newDepartment.name.trim() || createLoading}
                        >
                          {createLoading ? 'Création...' : 'Créer'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Clear selection option */}
                {value && (
                  <button
                    onClick={clearSelection}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-muted rounded-md"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Aucun département
                  </button>
                )}

                {/* Department list */}
                {filteredDepartments.length === 0 && !loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucun département trouvé.
                  </div>
                ) : (
                  filteredDepartments.map((department) => (
                    <button
                      key={department._id}
                      onClick={() => handleSelect(department._id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted rounded-md",
                        value === department._id && "bg-muted"
                      )}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate">{department.name}</span>
                          {department.code && (
                            <Badge variant="secondary" className="text-xs">
                              {department.code}
                            </Badge>
                          )}
                        </div>
                        {department.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {department.description}
                          </span>
                        )}
                        {department.parentDepartment && (
                          <span className="text-xs text-muted-foreground">
                            Sous-département de {department.parentDepartment.name}
                          </span>
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
    </div>
  );
}