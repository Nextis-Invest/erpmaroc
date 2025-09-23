'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WorkflowStatusIndicatorProps {
  status: 'pending' | 'active' | 'completed' | 'error' | 'skipped';
  progress?: number;
  error?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'detailed' | 'minimal';
  showProgress?: boolean;
  showText?: boolean;
  className?: string;
}

export const WorkflowStatusIndicator: React.FC<WorkflowStatusIndicatorProps> = ({
  status,
  progress = 0,
  error,
  size = 'default',
  variant = 'default',
  showProgress = false,
  showText = true,
  className
}) => {
  // Status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'secondary',
          icon: '⏳',
          text: 'En attente',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300'
        };
      case 'active':
        return {
          color: 'default',
          icon: '🔄',
          text: 'En cours',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300'
        };
      case 'completed':
        return {
          color: 'default',
          icon: '✅',
          text: 'Terminé',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300'
        };
      case 'error':
        return {
          color: 'destructive',
          icon: '❌',
          text: 'Erreur',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-300'
        };
      case 'skipped':
        return {
          color: 'outline',
          icon: '⏭️',
          text: 'Ignoré',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-300'
        };
      default:
        return {
          color: 'secondary',
          icon: '❓',
          text: 'Inconnu',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300'
        };
    }
  };

  const config = getStatusConfig();

  // Size configurations
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 'text-sm',
          textSize: 'text-xs',
          padding: 'px-2 py-1',
          progressHeight: 'h-1'
        };
      case 'lg':
        return {
          iconSize: 'text-lg',
          textSize: 'text-base',
          padding: 'px-4 py-2',
          progressHeight: 'h-3'
        };
      default:
        return {
          iconSize: 'text-base',
          textSize: 'text-sm',
          padding: 'px-3 py-1.5',
          progressHeight: 'h-2'
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className={cn(sizeConfig.iconSize)}>{config.icon}</span>
        {showText && (
          <span className={cn(sizeConfig.textSize, config.textColor)}>
            {config.text}
          </span>
        )}
      </div>
    );
  }

  // Render badge variant (default)
  if (variant === 'default') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge
          variant={config.color as any}
          className={cn(
            sizeConfig.padding,
            config.bgColor,
            config.textColor,
            config.borderColor
          )}
        >
          <span className={cn("mr-1", sizeConfig.iconSize)}>{config.icon}</span>
          {showText && (
            <span className={sizeConfig.textSize}>{config.text}</span>
          )}
        </Badge>

        {showProgress && status === 'active' && progress !== undefined && (
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Progress
              value={progress}
              className={cn("flex-1", sizeConfig.progressHeight)}
            />
            <span className={cn("text-xs text-gray-500 whitespace-nowrap")}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // Render detailed variant
  if (variant === 'detailed') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(sizeConfig.iconSize)}>{config.icon}</span>
            {showText && (
              <span className={cn(sizeConfig.textSize, config.textColor, "font-medium")}>
                {config.text}
              </span>
            )}
          </div>

          {status === 'active' && progress !== undefined && (
            <span className={cn("text-xs text-gray-500")}>
              {Math.round(progress)}%
            </span>
          )}
        </div>

        {status === 'active' && progress !== undefined && showProgress && (
          <Progress
            value={progress}
            className={cn("w-full", sizeConfig.progressHeight)}
          />
        )}

        {status === 'error' && error && (
          <p className={cn("text-xs text-red-600 mt-1")}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default WorkflowStatusIndicator;