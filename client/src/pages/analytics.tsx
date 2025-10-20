import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, MousePointer, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsSummary {
  subsiteViews: number;
  linkClicks: number;
  totalEvents: number;
}

interface TopItem {
  id: string;
  name: string;
  views?: number;
  clicks?: number;
}

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: topSubsites, isLoading: subsitesLoading } = useQuery<TopItem[]>({
    queryKey: ['/api/analytics/top-subsites'],
  });

  const { data: topLinks, isLoading: linksLoading } = useQuery<TopItem[]>({
    queryKey: ['/api/analytics/top-links'],
  });

  const subsitesChartData = topSubsites?.map(item => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    views: item.views || 0,
  })) || [];

  const linksChartData = topLinks?.map(item => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    clicks: item.clicks || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track engagement and performance across your portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="card-total-events">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-events">
                  {summary?.totalEvents || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                All tracked interactions
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-subsite-views">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subsite Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-subsite-views">
                  {summary?.subsiteViews || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Total subsite visits
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-link-clicks">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-link-clicks">
                  {summary?.linkClicks || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                External link clicks
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-top-subsites-chart">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Subsites
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subsitesLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : subsitesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subsitesChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="views" 
                      fill="hsl(var(--primary))" 
                      name="Views"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No subsite view data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-top-links-chart">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Top Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linksLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : linksChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={linksChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="clicks" 
                      fill="hsl(var(--primary))" 
                      name="Clicks"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No link click data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
