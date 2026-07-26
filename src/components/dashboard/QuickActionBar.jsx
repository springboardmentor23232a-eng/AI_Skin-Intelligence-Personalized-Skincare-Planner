import React from 'react';
import { Button } from '@/components/ui/Button';

export function QuickActionBar({ actions = [] }) {
  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((act, index) => {
        const IconComponent = act.icon;
        return (
          <Button
            key={index}
            variant={act.variant || (index === 0 ? 'primary' : 'outline')}
            size="sm"
            onClick={act.onClick}
            className={act.className}
          >
            {IconComponent && <IconComponent className="w-4 h-4 mr-1.5" />}
            {act.label}
          </Button>
        );
      })}
    </div>
  );
}
