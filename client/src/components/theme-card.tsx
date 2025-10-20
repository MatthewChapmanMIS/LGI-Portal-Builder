import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Theme } from "@shared/schema";

interface ThemeCardProps {
  theme: Theme;
  isActive?: boolean;
  onEdit?: (theme: Theme) => void;
  onDelete?: (id: string) => void;
  onActivate?: (theme: Theme) => void;
}

export function ThemeCard({ theme, isActive, onEdit, onDelete, onActivate }: ThemeCardProps) {
  const colors = theme.colors as any;

  return (
    <Card
      className={`group relative hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 ${
        isActive ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onActivate?.(theme)}
      data-testid={`card-theme-${theme.id}`}
    >
      {isActive && (
        <div className="absolute top-3 left-3 z-10">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid={`button-theme-menu-${theme.id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(theme);
              }}
              data-testid={`button-edit-theme-${theme.id}`}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(theme.id);
              }}
              className="text-destructive"
              data-testid={`button-delete-theme-${theme.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: colors.primary }}
              />
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: colors.accent }}
              />
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: colors.surface }}
              />
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: colors.background }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold truncate" data-testid={`text-theme-name-${theme.id}`}>
              {theme.name}
            </h3>
            <p className="text-xs text-muted-foreground">Custom Theme</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.entries(colors).slice(0, 4).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div
                className="h-8 rounded-md border"
                style={{ backgroundColor: value as string }}
              />
              <p className="text-xs text-muted-foreground capitalize truncate">
                {key}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}
