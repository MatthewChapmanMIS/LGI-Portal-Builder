import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import type { Subsite } from "@shared/schema";

interface BreadcrumbProps {
  subsite: Subsite;
}

export function Breadcrumb({ subsite }: BreadcrumbProps) {
  const { data: trail, isLoading } = useQuery<Subsite[]>({
    queryKey: ['/api/subsites', subsite.id, 'breadcrumb'],
    queryFn: async () => {
      const response = await fetch(`/api/subsites/${subsite.id}/breadcrumb`);
      if (!response.ok) {
        throw new Error('Failed to fetch breadcrumb trail');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <nav className="flex items-center gap-2" data-testid="breadcrumb-loading">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </nav>
    );
  }

  if (!trail || trail.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2" data-testid="breadcrumb">
      <Link href="/subsites">
        <a className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-breadcrumb-home">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </a>
      </Link>

      {trail.length > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}

      {trail.map((item, index) => {
        const isLast = index === trail.length - 1;
        
        if (isLast) {
          return (
            <span
              key={item.id}
              className="text-sm text-muted-foreground"
              data-testid="text-breadcrumb-current"
            >
              {item.name}
            </span>
          );
        }

        return (
          <div key={item.id} className="flex items-center gap-2">
            <Link href={`/subsites/${item.id}`}>
              <a
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid={`link-breadcrumb-subsite-${item.id}`}
              >
                {item.name}
              </a>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        );
      })}
    </nav>
  );
}
