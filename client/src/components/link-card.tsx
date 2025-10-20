import { ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Link as LinkType } from "@shared/schema";
import { getIconByName } from "@/lib/iconLibrary";
import { trackEvent } from "@/lib/analytics";

interface LinkCardProps {
  link: LinkType;
  onEdit?: (link: LinkType) => void;
  onDelete?: (id: string) => void;
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  const openLink = () => {
    trackEvent({
      eventType: "click",
      resourceType: "link",
      resourceId: link.id,
    });
    if (link.url) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      className="group relative hover-elevate active-elevate-2 cursor-pointer transition-all duration-300"
      onClick={openLink}
      data-testid={`card-link-${link.id}`}
    >
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid={`button-link-menu-${link.id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(link);
              }}
              data-testid={`button-edit-link-${link.id}`}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(link.id);
              }}
              className="text-destructive"
              data-testid={`button-delete-link-${link.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex items-start gap-4">
          {(() => {
            const LibraryIcon = link.iconUrl ? getIconByName(link.iconUrl) : null;
            const isImageUrl = link.iconUrl && (link.iconUrl.startsWith('http') || link.iconUrl.startsWith('/objects'));
            
            if (LibraryIcon) {
              return (
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0" data-testid={`icon-link-${link.id}`}>
                  <LibraryIcon className="h-6 w-6 text-primary" />
                </div>
              );
            } else if (isImageUrl && link.iconUrl) {
              return (
                <img
                  src={link.iconUrl}
                  alt={link.name}
                  className="h-12 w-12 rounded-md object-cover"
                  data-testid={`img-link-icon-${link.id}`}
                />
              );
            } else {
              return (
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
              );
            }
          })()}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate" data-testid={`text-link-name-${link.id}`}>
              {link.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">
                {(() => {
                  if (!link.url) return "";
                  try {
                    return new URL(link.url).hostname;
                  } catch {
                    return link.url;
                  }
                })()}
              </span>
            </div>
          </div>
        </div>

        {link.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-link-description-${link.id}`}>
            {link.description}
          </p>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}
