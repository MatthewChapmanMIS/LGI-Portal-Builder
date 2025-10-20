import { ExternalLink, MoreVertical, Pencil, Trash2, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subsite } from "@shared/schema";
import { getIconByName } from "@/lib/iconLibrary";

interface SubsiteCardProps {
  subsite: Subsite;
  onEdit?: (subsite: Subsite) => void;
  onDelete?: (id: string) => void;
  onClick?: (subsite: Subsite) => void;
}

export function SubsiteCard({ subsite, onEdit, onDelete, onClick }: SubsiteCardProps) {
  return (
    <Card
      className="group relative overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300"
      onClick={() => onClick?.(subsite)}
      data-testid={`card-subsite-${subsite.id}`}
    >
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid={`button-subsite-menu-${subsite.id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(subsite);
              }}
              data-testid={`button-edit-subsite-${subsite.id}`}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(subsite.id);
              }}
              className="text-destructive"
              data-testid={`button-delete-subsite-${subsite.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          {(() => {
            const LibraryIcon = subsite.iconUrl ? getIconByName(subsite.iconUrl) : null;
            const isImageUrl = subsite.iconUrl && (subsite.iconUrl.startsWith('http') || subsite.iconUrl.startsWith('/objects'));
            
            if (LibraryIcon) {
              return (
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center" data-testid={`icon-subsite-${subsite.id}`}>
                  <LibraryIcon className="h-8 w-8 text-primary" />
                </div>
              );
            } else if (isImageUrl) {
              return (
                <img
                  src={subsite.iconUrl}
                  alt={subsite.name}
                  className="h-16 w-16 rounded-lg object-cover"
                  data-testid={`img-subsite-icon-${subsite.id}`}
                />
              );
            } else {
              return (
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
              );
            }
          })()}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg truncate" data-testid={`text-subsite-name-${subsite.id}`}>
              {subsite.name}
            </h3>
            {subsite.url && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">
                  {(() => {
                    try {
                      return new URL(subsite.url).hostname;
                    } catch {
                      return subsite.url;
                    }
                  })()}
                </span>
              </div>
            )}
            {subsite.customDomain && (
              <div className="flex items-center gap-1 text-sm text-primary mt-1">
                <Globe className="h-3 w-3" />
                <span className="truncate" data-testid={`text-subsite-custom-domain-${subsite.id}`}>
                  {subsite.customDomain}
                </span>
              </div>
            )}
          </div>
        </div>

        {subsite.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-subsite-description-${subsite.id}`}>
            {subsite.description}
          </p>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}

function Layers({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
