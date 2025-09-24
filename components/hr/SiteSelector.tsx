"use client";

import React, { useState, useEffect } from 'react';
import { Building2, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface Site {
  _id: string;
  name: string;
  code?: string;
  address?: string;
  region: string;
}

interface SiteSelectorProps {
  regionId?: string;
  value?: string[];
  primarySite?: string;
  onValueChange?: (sites: string[], primarySite?: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
}

export function SiteSelector({
  regionId,
  value = [],
  primarySite,
  onValueChange,
  label = "Sites",
  placeholder = "Sélectionner des sites...",
  disabled = false,
  required = false,
  multiple = true
}: SiteSelectorProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch sites when region changes
  useEffect(() => {
    if (!regionId) {
      setSites([]);
      return;
    }

    const fetchSites = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sites?regionId=${regionId}`);
        if (response.ok) {
          const result = await response.json();
          const sitesData = result.data?.sites || result.sites || [];
          setSites(sitesData);
        } else {
          console.error('Failed to fetch sites');
          setSites([]);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [regionId]);

  const handleSiteAdd = (siteId: string) => {
    // Ignore special placeholder values
    if (siteId === "no-sites" || !siteId) {
      return;
    }

    if (!multiple) {
      onValueChange?.([siteId], siteId);
      return;
    }

    const newSites = [...value];
    if (!newSites.includes(siteId)) {
      newSites.push(siteId);
      // If it's the first site, make it primary
      const newPrimary = primarySite || (newSites.length === 1 ? siteId : primarySite);
      onValueChange?.(newSites, newPrimary);
    }
  };

  const handleSiteRemove = (siteId: string) => {
    const newSites = value.filter(id => id !== siteId);
    let newPrimary = primarySite;

    // If removing primary site, set first remaining site as primary
    if (primarySite === siteId && newSites.length > 0) {
      newPrimary = newSites[0];
    } else if (newSites.length === 0) {
      newPrimary = undefined;
    }

    onValueChange?.(newSites, newPrimary);
  };

  const handlePrimaryChange = (siteId: string) => {
    onValueChange?.(value, siteId);
  };

  const selectedSites = sites.filter(site => value.includes(site._id));

  if (!regionId) {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="flex items-center gap-1 text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className="p-3 border rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
          Veuillez d'abord sélectionner une région
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Select onValueChange={handleSiteAdd} disabled={disabled || loading || sites.length === 0}>
        <SelectTrigger className={cn("w-full")}>
          <SelectValue placeholder={
            loading ? "Chargement..." :
            sites.length === 0 ? "Aucun site disponible" :
            placeholder
          } />
        </SelectTrigger>
        <SelectContent>
          {sites.length === 0 && !loading ? (
            <SelectItem value="no-sites" disabled>
              Aucun site trouvé pour cette région
            </SelectItem>
          ) : (
            sites
              .filter(site => !value.includes(site._id))
              .map((site) => (
                <SelectItem key={site._id} value={site._id}>
                  <div className="flex items-center gap-2">
                    <span>{site.name}</span>
                    {site.code && (
                      <span className="text-xs text-muted-foreground">({site.code})</span>
                    )}
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>

      {/* Selected sites */}
      {selectedSites.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {selectedSites.map((site) => (
              <Badge
                key={site._id}
                variant={site._id === primarySite ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {site.name}
                {site._id === primarySite && (
                  <span className="text-xs">(Principal)</span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleSiteRemove(site._id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          {/* Primary site selector */}
          {multiple && selectedSites.length > 1 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Site principal :</Label>
              <Select value={primarySite} onValueChange={handlePrimaryChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Sélectionner le site principal" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSites.map((site) => (
                    <SelectItem key={site._id} value={site._id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}