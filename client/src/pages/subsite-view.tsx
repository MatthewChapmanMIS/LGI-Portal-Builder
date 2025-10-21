import { useEffect } from "react";
import { useRoute, useLocation, Link as WouterLink } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Globe, ArrowLeft, Layers, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkCard } from "@/components/link-card";
import { SubsiteCard } from "@/components/subsite-card";
import { getIconByName } from "@/lib/iconLibrary";
import { trackEvent } from "@/lib/analytics";
import type { Subsite, Link as LinkType } from "@shared/schema";

export default function SubsiteView() {
  const [match, params] = useRoute("/subsites/:id");
  const [, setLocation] = useLocation();
  const subsiteId = params?.id;

  // Fetch subsite data
  const { data: subsite, isLoading: subsiteLoading, error: subsiteError } = useQuery<Subsite>({
    queryKey: ["/api/subsites", subsiteId],
    enabled: !!subsiteId,
  });

  // Fetch links
  const { data: links, isLoading: linksLoading } = useQuery<LinkType[]>({
    queryKey: ["/api/subsites", subsiteId, "links"],
    enabled: !!subsiteId,
  });

  // Fetch child subsites
  const { data: childSubsites, isLoading: childrenLoading } = useQuery<Subsite[]>({
    queryKey: ["/api/subsites", subsiteId, "children"],
    enabled: !!subsiteId,
  });

  // Track analytics view event when page loads
  useEffect(() => {
    if (subsite) {
      trackEvent({
        eventType: "view",
        resourceType: "subsite",
        resourceId: subsite.id,
      });
    }
  }, [subsite]);

  // Loading state
  if (subsiteLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Card className="h-12 w-32 animate-pulse" />
        </div>
        
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4 flex-1">
              <div className="h-10 w-64 bg-muted animate-pulse rounded" />
              <div className="h-6 w-96 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state - subsite not found
  if (subsiteError || !subsite) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" asChild data-testid="button-back">
          <WouterLink href="/subsites">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subsites
          </WouterLink>
        </Button>

        <Card className="p-12 text-center">
          <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Subsite Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The subsite you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild data-testid="button-go-home">
            <WouterLink href="/subsites">
              View All Subsites
            </WouterLink>
          </Button>
        </Card>
      </div>
    );
  }

  // Render icon
  const renderIcon = () => {
    const LibraryIcon = subsite.iconUrl ? getIconByName(subsite.iconUrl) : null;
    const isImageUrl = subsite.iconUrl && (subsite.iconUrl.startsWith('http') || subsite.iconUrl.startsWith('/objects'));
    
    if (LibraryIcon) {
      return (
        <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center" data-testid="icon-subsite-hero">
          <LibraryIcon className="h-12 w-12 text-primary" />
        </div>
      );
    } else if (isImageUrl && subsite.iconUrl) {
      return (
        <img
          src={subsite.iconUrl}
          alt={subsite.name}
          className="h-24 w-24 rounded-lg object-cover"
          data-testid="img-subsite-hero"
        />
      );
    } else {
      return (
        <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center">
          <Layers className="h-12 w-12 text-primary" />
        </div>
      );
    }
  };

  const hasLinks = links && links.length > 0;
  const hasChildren = childSubsites && childSubsites.length > 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb placeholder - will be implemented later */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild data-testid="button-back-to-subsites">
          <WouterLink href="/subsites">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subsites
          </WouterLink>
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start gap-6">
          {renderIcon()}
          
          <div className="flex-1 space-y-3">
            <h1 className="text-4xl font-display font-bold" data-testid="text-subsite-name">
              {subsite.name}
            </h1>
            
            {subsite.description && (
              <p className="text-lg text-muted-foreground" data-testid="text-subsite-description">
                {subsite.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 pt-2">
              {subsite.url && (
                <a
                  href={subsite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                  data-testid="link-subsite-url"
                >
                  <LinkIcon className="h-4 w-4" />
                  {(() => {
                    try {
                      return new URL(subsite.url).hostname;
                    } catch {
                      return subsite.url;
                    }
                  })()}
                </a>
              )}
              
              {subsite.customDomain && (
                <div className="flex items-center gap-2 text-sm text-primary" data-testid="text-custom-domain">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">{subsite.customDomain}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Applications & Links Section */}
      {linksLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        </div>
      ) : hasLinks ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-semibold" data-testid="text-links-title">
            Applications & Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No Links Yet</h3>
          <p className="text-sm text-muted-foreground">
            No applications or links have been added to this subsite.
          </p>
        </Card>
      )}

      {/* Child Subsites Section */}
      {childrenLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        </div>
      ) : hasChildren ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-semibold" data-testid="text-child-subsites-title">
            Subsites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {childSubsites.map((child) => (
              <SubsiteCard
                key={child.id}
                subsite={child}
                onClick={(s) => setLocation(`/subsites/${s.id}`)}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No Child Subsites</h3>
          <p className="text-sm text-muted-foreground">
            This subsite doesn't have any child subsites yet.
          </p>
        </Card>
      )}
    </div>
  );
}
