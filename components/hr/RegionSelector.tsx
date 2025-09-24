"use client";

import React, { useState, useEffect } from 'react';
import { ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Region {
  _id: string;
  name: string;
  code?: string;
  description?: string;
}

interface RegionSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function RegionSelector({
  value,
  onValueChange,
  label = "Région",
  placeholder = "Sélectionner une région...",
  disabled = false,
  required = false
}: RegionSelectorProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch regions from database
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/regions');
        if (response.ok) {
          const result = await response.json();
          const regionsData = result.data?.regions || result.regions || [];
          setRegions(regionsData);
        } else {
          console.error('Failed to fetch regions');
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
        <SelectTrigger className={cn("w-full", !value && "text-muted-foreground")}>
          <SelectValue placeholder={loading ? "Chargement..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {regions.length === 0 && !loading ? (
            <SelectItem value="" disabled>
              Aucune région trouvée
            </SelectItem>
          ) : (
            regions.map((region) => (
              <SelectItem key={region._id} value={region._id}>
                <div className="flex items-center gap-2">
                  <span>{region.name}</span>
                  {region.code && (
                    <span className="text-xs text-muted-foreground">({region.code})</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}