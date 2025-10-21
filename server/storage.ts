import {
  type Theme,
  type InsertTheme,
  type Subsite,
  type InsertSubsite,
  type Link,
  type InsertLink,
  type Analytics,
  type InsertAnalytics,
  themes,
  subsites,
  links,
  analytics,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  getThemes(): Promise<Theme[]>;
  getTheme(id: string): Promise<Theme | undefined>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(id: string, theme: Partial<Theme>): Promise<Theme | undefined>;
  deleteTheme(id: string): Promise<boolean>;

  getSubsites(): Promise<Subsite[]>;
  getSubsite(id: string): Promise<Subsite | undefined>;
  getChildSubsites(parentId: string): Promise<Subsite[]>;
  getBreadcrumbTrail(subsiteId: string): Promise<Subsite[]>;
  createSubsite(subsite: InsertSubsite): Promise<Subsite>;
  updateSubsite(id: string, subsite: Partial<Subsite>): Promise<Subsite | undefined>;
  deleteSubsite(id: string): Promise<boolean>;

  getLinks(): Promise<Link[]>;
  getLinksBySubsite(subsiteId: string): Promise<Link[]>;
  getLink(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, link: Partial<Link>): Promise<Link | undefined>;
  deleteLink(id: string): Promise<boolean>;

  trackEvent(event: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(): Promise<{ subsiteViews: number; linkClicks: number; totalEvents: number }>;
  getTopSubsites(limit?: number): Promise<Array<{ id: string; name: string; views: number }>>;
  getTopLinks(limit?: number): Promise<Array<{ id: string; name: string; clicks: number }>>;
  getRecentActivity(limit?: number): Promise<Analytics[]>;
}

export class MemStorage implements IStorage {
  private themes: Map<string, Theme>;
  private subsites: Map<string, Subsite>;
  private links: Map<string, Link>;
  private analyticsEvents: Analytics[];

  constructor() {
    this.themes = new Map();
    this.subsites = new Map();
    this.links = new Map();
    this.analyticsEvents = [];
  }

  async getThemes(): Promise<Theme[]> {
    return Array.from(this.themes.values());
  }

  async getTheme(id: string): Promise<Theme | undefined> {
    return this.themes.get(id);
  }

  async createTheme(insertTheme: InsertTheme): Promise<Theme> {
    const id = randomUUID();
    const theme: Theme = { ...insertTheme, id };
    this.themes.set(id, theme);
    return theme;
  }

  async updateTheme(id: string, themeData: Partial<Theme>): Promise<Theme | undefined> {
    const theme = this.themes.get(id);
    if (!theme) return undefined;
    
    const updated = { ...theme, ...themeData, id };
    this.themes.set(id, updated);
    return updated;
  }

  async deleteTheme(id: string): Promise<boolean> {
    return this.themes.delete(id);
  }

  async getSubsites(): Promise<Subsite[]> {
    return Array.from(this.subsites.values()).sort((a, b) => a.order - b.order);
  }

  async getSubsite(id: string): Promise<Subsite | undefined> {
    return this.subsites.get(id);
  }

  async getChildSubsites(parentId: string): Promise<Subsite[]> {
    return Array.from(this.subsites.values())
      .filter(subsite => subsite.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }

  async getBreadcrumbTrail(subsiteId: string): Promise<Subsite[]> {
    const trail: Subsite[] = [];
    let currentId: string | null = subsiteId;

    while (currentId) {
      const subsite = this.subsites.get(currentId);
      if (!subsite) break;
      
      trail.unshift(subsite);
      currentId = subsite.parentId;
    }

    return trail;
  }

  async createSubsite(insertSubsite: InsertSubsite): Promise<Subsite> {
    const id = randomUUID();
    const subsite: Subsite = { ...insertSubsite, id };
    this.subsites.set(id, subsite);
    return subsite;
  }

  async updateSubsite(id: string, subsiteData: Partial<Subsite>): Promise<Subsite | undefined> {
    const subsite = this.subsites.get(id);
    if (!subsite) return undefined;
    
    const updated = { ...subsite, ...subsiteData, id };
    this.subsites.set(id, updated);
    return updated;
  }

  async deleteSubsite(id: string): Promise<boolean> {
    const linksToDelete = Array.from(this.links.values())
      .filter(link => link.subsiteId === id)
      .map(link => link.id);
    
    linksToDelete.forEach(linkId => this.links.delete(linkId));
    return this.subsites.delete(id);
  }

  async getLinks(): Promise<Link[]> {
    return Array.from(this.links.values()).sort((a, b) => a.order - b.order);
  }

  async getLinksBySubsite(subsiteId: string): Promise<Link[]> {
    return Array.from(this.links.values())
      .filter(link => link.subsiteId === subsiteId)
      .sort((a, b) => a.order - b.order);
  }

  async getLink(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = randomUUID();
    const link: Link = { ...insertLink, id };
    this.links.set(id, link);
    return link;
  }

  async updateLink(id: string, linkData: Partial<Link>): Promise<Link | undefined> {
    const link = this.links.get(id);
    if (!link) return undefined;
    
    const updated = { ...link, ...linkData, id };
    this.links.set(id, updated);
    return updated;
  }

  async deleteLink(id: string): Promise<boolean> {
    return this.links.delete(id);
  }

  async trackEvent(event: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analyticsEvent: Analytics = { ...event, id, timestamp: new Date() };
    this.analyticsEvents.push(analyticsEvent);
    return analyticsEvent;
  }

  async getAnalyticsSummary(): Promise<{ subsiteViews: number; linkClicks: number; totalEvents: number }> {
    const subsiteViews = this.analyticsEvents.filter(e => e.eventType === 'view' && e.resourceType === 'subsite').length;
    const linkClicks = this.analyticsEvents.filter(e => e.eventType === 'click' && e.resourceType === 'link').length;
    return {
      subsiteViews,
      linkClicks,
      totalEvents: this.analyticsEvents.length,
    };
  }

  async getTopSubsites(limit: number = 5): Promise<Array<{ id: string; name: string; views: number }>> {
    const counts = new Map<string, number>();
    this.analyticsEvents
      .filter(e => e.eventType === 'view' && e.resourceType === 'subsite')
      .forEach(e => counts.set(e.resourceId, (counts.get(e.resourceId) || 0) + 1));
    
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    return sorted.map(([id, views]) => ({
      id,
      name: this.subsites.get(id)?.name || 'Unknown',
      views,
    }));
  }

  async getTopLinks(limit: number = 5): Promise<Array<{ id: string; name: string; clicks: number }>> {
    const counts = new Map<string, number>();
    this.analyticsEvents
      .filter(e => e.eventType === 'click' && e.resourceType === 'link')
      .forEach(e => counts.set(e.resourceId, (counts.get(e.resourceId) || 0) + 1));
    
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    return sorted.map(([id, clicks]) => ({
      id,
      name: this.links.get(id)?.name || 'Unknown',
      clicks,
    }));
  }

  async getRecentActivity(limit: number = 10): Promise<Analytics[]> {
    return this.analyticsEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export class DatabaseStorage implements IStorage {
  async getThemes(): Promise<Theme[]> {
    return await db.select().from(themes);
  }

  async getTheme(id: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme || undefined;
  }

  async createTheme(insertTheme: InsertTheme): Promise<Theme> {
    const [theme] = await db.insert(themes).values(insertTheme).returning();
    return theme;
  }

  async updateTheme(id: string, themeData: Partial<Theme>): Promise<Theme | undefined> {
    const [theme] = await db
      .update(themes)
      .set(themeData)
      .where(eq(themes.id, id))
      .returning();
    return theme || undefined;
  }

  async deleteTheme(id: string): Promise<boolean> {
    const result = await db.delete(themes).where(eq(themes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSubsites(): Promise<Subsite[]> {
    const results = await db.select().from(subsites).orderBy(subsites.order);
    return results;
  }

  async getSubsite(id: string): Promise<Subsite | undefined> {
    const [subsite] = await db.select().from(subsites).where(eq(subsites.id, id));
    return subsite || undefined;
  }

  async getChildSubsites(parentId: string): Promise<Subsite[]> {
    const results = await db
      .select()
      .from(subsites)
      .where(eq(subsites.parentId, parentId))
      .orderBy(subsites.order);
    return results;
  }

  async getBreadcrumbTrail(subsiteId: string): Promise<Subsite[]> {
    const trail: Subsite[] = [];
    let currentId: string | null = subsiteId;

    while (currentId) {
      const subsite = await this.getSubsite(currentId);
      if (!subsite) break;
      
      trail.unshift(subsite);
      currentId = subsite.parentId;
    }

    return trail;
  }

  async createSubsite(insertSubsite: InsertSubsite): Promise<Subsite> {
    const [subsite] = await db.insert(subsites).values(insertSubsite).returning();
    return subsite;
  }

  async updateSubsite(id: string, subsiteData: Partial<Subsite>): Promise<Subsite | undefined> {
    const [subsite] = await db
      .update(subsites)
      .set(subsiteData)
      .where(eq(subsites.id, id))
      .returning();
    return subsite || undefined;
  }

  async deleteSubsite(id: string): Promise<boolean> {
    await db.delete(links).where(eq(links.subsiteId, id));
    const result = await db.delete(subsites).where(eq(subsites.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getLinks(): Promise<Link[]> {
    const results = await db.select().from(links).orderBy(links.order);
    return results;
  }

  async getLinksBySubsite(subsiteId: string): Promise<Link[]> {
    const results = await db
      .select()
      .from(links)
      .where(eq(links.subsiteId, subsiteId))
      .orderBy(links.order);
    return results;
  }

  async getLink(id: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.id, id));
    return link || undefined;
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const [link] = await db.insert(links).values(insertLink).returning();
    return link;
  }

  async updateLink(id: string, linkData: Partial<Link>): Promise<Link | undefined> {
    const [link] = await db
      .update(links)
      .set(linkData)
      .where(eq(links.id, id))
      .returning();
    return link || undefined;
  }

  async deleteLink(id: string): Promise<boolean> {
    const result = await db.delete(links).where(eq(links.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async trackEvent(event: InsertAnalytics): Promise<Analytics> {
    const [analyticsEvent] = await db.insert(analytics).values(event).returning();
    return analyticsEvent;
  }

  async getAnalyticsSummary(): Promise<{ subsiteViews: number; linkClicks: number; totalEvents: number }> {
    const subsiteViews = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analytics)
      .where(and(eq(analytics.eventType, 'view'), eq(analytics.resourceType, 'subsite')));

    const linkClicks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analytics)
      .where(and(eq(analytics.eventType, 'click'), eq(analytics.resourceType, 'link')));

    const totalEvents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analytics);

    return {
      subsiteViews: subsiteViews[0]?.count || 0,
      linkClicks: linkClicks[0]?.count || 0,
      totalEvents: totalEvents[0]?.count || 0,
    };
  }

  async getTopSubsites(limit: number = 5): Promise<Array<{ id: string; name: string; views: number }>> {
    const topSubsiteIds = await db
      .select({ 
        resourceId: analytics.resourceId, 
        count: sql<number>`count(*)::int`.as('count')
      })
      .from(analytics)
      .where(and(eq(analytics.eventType, 'view'), eq(analytics.resourceType, 'subsite')))
      .groupBy(analytics.resourceId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const results = await Promise.all(
      topSubsiteIds.map(async ({ resourceId, count }) => {
        const subsite = await this.getSubsite(resourceId);
        return {
          id: resourceId,
          name: subsite?.name || 'Unknown',
          views: count,
        };
      })
    );

    return results;
  }

  async getTopLinks(limit: number = 5): Promise<Array<{ id: string; name: string; clicks: number }>> {
    const topLinkIds = await db
      .select({ 
        resourceId: analytics.resourceId, 
        count: sql<number>`count(*)::int`.as('count')
      })
      .from(analytics)
      .where(and(eq(analytics.eventType, 'click'), eq(analytics.resourceType, 'link')))
      .groupBy(analytics.resourceId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const results = await Promise.all(
      topLinkIds.map(async ({ resourceId, count }) => {
        const link = await this.getLink(resourceId);
        return {
          id: resourceId,
          name: link?.name || 'Unknown',
          clicks: count,
        };
      })
    );

    return results;
  }

  async getRecentActivity(limit: number = 10): Promise<Analytics[]> {
    const results = await db
      .select()
      .from(analytics)
      .orderBy(desc(analytics.timestamp))
      .limit(limit);
    return results;
  }
}

export const storage = new DatabaseStorage();
