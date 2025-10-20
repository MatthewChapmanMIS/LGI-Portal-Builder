import { useQuery } from "@tanstack/react-query";
import { Plus, Palette, Layers, Link as LinkIcon, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubsiteCard } from "@/components/subsite-card";
import type { Subsite, Theme, Link as LinkType } from "@shared/schema";

export default function Dashboard() {
  const { data: subsites, isLoading: isLoadingSubsites } = useQuery<Subsite[]>({
    queryKey: ["/api/subsites"],
  });

  const { data: themes, isLoading: isLoadingThemes } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
  });

  const { data: links, isLoading: isLoadingLinks } = useQuery<LinkType[]>({
    queryKey: ["/api/links"],
  });

  const isLoading = isLoadingSubsites || isLoadingThemes || isLoadingLinks;

  const stats = [
    {
      label: "Total Subsites",
      value: subsites?.length || 0,
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Themes",
      value: themes?.length || 0,
      icon: Palette,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total Links",
      value: links?.length || 0,
      icon: LinkIcon,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Activity",
      value: "100%",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your enterprise portal builder
          </p>
        </div>
        <Button asChild data-testid="button-create-subsite">
          <Link href="/subsites">
            <Plus className="h-4 w-4 mr-2" />
            Create Subsite
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold">Recent Subsites</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/subsites">View All</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        ) : subsites && subsites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subsites.slice(0, 6).map((subsite) => (
              <SubsiteCard key={subsite.id} subsite={subsite} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Subsites Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first subsite to get started with your portal
            </p>
            <Button asChild data-testid="button-create-first-subsite">
              <Link href="/subsites">
                <Plus className="h-4 w-4 mr-2" />
                Create Subsite
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
