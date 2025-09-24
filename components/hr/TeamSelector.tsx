"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, X, Search } from 'lucide-react';
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

interface Team {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  department: {
    _id: string;
    name: string;
    code?: string;
  };
  manager?: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  leadId?: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

interface TeamSelectorProps {
  value?: string;
  departmentId?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  label?: string;
  required?: boolean;
}

export function TeamSelector({
  value,
  departmentId,
  onValueChange,
  placeholder = "Sélectionner une équipe...",
  disabled = false,
  allowCreate = true,
  label,
  required = false
}: TeamSelectorProps) {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // New team form state
  const [newTeam, setNewTeam] = useState({
    name: '',
    code: '',
    description: '',
    maxMembers: ''
  });

  // Fetch teams when department changes
  useEffect(() => {
    if (!departmentId) {
      setTeams([]);
      return;
    }

    const fetchTeams = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/teams?departmentId=${departmentId}`);
        if (response.ok) {
          const result = await response.json();
          const teamsData = result.data?.teams || result.teams || [];
          setTeams(teamsData);
        } else {
          console.error('Failed to fetch teams');
          setTeams([]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [departmentId]);

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    if (!teams || !Array.isArray(teams)) return [];
    if (!searchValue) return teams;

    const searchLower = searchValue.toLowerCase();
    return teams.filter(team => {
      const name = team.name.toLowerCase();
      const code = team.code?.toLowerCase() || '';
      const departmentName = team.department?.name?.toLowerCase() || '';

      return name.includes(searchLower) ||
             code.includes(searchLower) ||
             departmentName.includes(searchLower);
    });
  }, [teams, searchValue]);

  // Find selected team
  const selectedTeam = teams?.find(team => team._id === value);

  const handleSelect = (teamId: string) => {
    onValueChange?.(teamId);
    setOpen(false);
  };

  const clearSelection = () => {
    onValueChange?.('');
    setOpen(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim() || !departmentId) return;

    setCreateLoading(true);
    try {
      const teamData: any = {
        name: newTeam.name.trim(),
        department: departmentId,
      };

      if (newTeam.code.trim()) teamData.code = newTeam.code.trim();
      if (newTeam.description.trim()) teamData.description = newTeam.description.trim();
      if (newTeam.maxMembers) teamData.maxMembers = parseInt(newTeam.maxMembers);

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      if (response.ok) {
        const result = await response.json();
        const createdTeam = result.data.team;

        // Add the new team to the list
        setTeams(prev => [...prev, createdTeam]);

        // Select the newly created team
        onValueChange?.(createdTeam._id);

        // Reset form and close dialog
        setNewTeam({ name: '', code: '', description: '', maxMembers: '' });
        setShowCreateDialog(false);
        setOpen(false);
      } else {
        const error = await response.json();
        console.error('Failed to create team:', error.error);
        alert(error.error || 'Erreur lors de la création de l\'équipe');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Erreur lors de la création de l\'équipe');
    } finally {
      setCreateLoading(false);
    }
  };

  if (!departmentId) {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className="p-3 border rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
          Veuillez d'abord sélectionner un département
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1">
          <Users className="h-3 w-3" />
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
              !selectedTeam && "text-muted-foreground"
            )}
            disabled={disabled || loading || teams.length === 0}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Users className="h-4 w-4 flex-shrink-0" />
              {selectedTeam ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{selectedTeam.name}</span>
                  {selectedTeam.code && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedTeam.code}
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="truncate">
                  {loading ? "Chargement..." :
                   teams.length === 0 ? "Aucune équipe disponible" :
                   placeholder}
                </span>
              )}
            </div>
            <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3">
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
                {/* Create new team option */}
                {allowCreate && searchValue && (
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-blue-600 hover:bg-muted rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Créer "{searchValue}"
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle équipe</DialogTitle>
                        <DialogDescription>
                          Créer une nouvelle équipe qui sera disponible immédiatement.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom de l'équipe *</Label>
                          <Input
                            id="name"
                            value={newTeam.name}
                            onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Entrez le nom de l'équipe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Code (optionnel)</Label>
                          <Input
                            id="code"
                            value={newTeam.code}
                            onChange={(e) => setNewTeam(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="Ex: DEV, QA, DESIGN"
                            maxLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (optionnel)</Label>
                          <Input
                            id="description"
                            value={newTeam.description}
                            onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description de l'équipe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxMembers">Nombre max de membres (optionnel)</Label>
                          <Input
                            id="maxMembers"
                            type="number"
                            min="1"
                            max="100"
                            value={newTeam.maxMembers}
                            onChange={(e) => setNewTeam(prev => ({ ...prev, maxMembers: e.target.value }))}
                            placeholder="Ex: 10"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={handleCreateTeam}
                          disabled={!newTeam.name.trim() || createLoading}
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
                    Aucune équipe
                  </button>
                )}

                {/* Team list */}
                {filteredTeams.length === 0 && !loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucune équipe trouvée pour ce département.
                  </div>
                ) : (
                  filteredTeams.map((team) => (
                    <button
                      key={team._id}
                      onClick={() => handleSelect(team._id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted rounded-md",
                        value === team._id && "bg-muted"
                      )}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate">{team.name}</span>
                          {team.code && (
                            <Badge variant="secondary" className="text-xs">
                              {team.code}
                            </Badge>
                          )}
                        </div>
                        {team.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {team.description}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Département: {team.department.name}
                        </span>
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