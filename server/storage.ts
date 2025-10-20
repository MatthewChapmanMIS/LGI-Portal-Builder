import {
  type Theme,
  type InsertTheme,
  type Subsite,
  type InsertSubsite,
  type Link,
  type InsertLink,
  themes,
  subsites,
  links,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getThemes(): Promise<Theme[]>;
  getTheme(id: string): Promise<Theme | undefined>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(id: string, theme: Partial<Theme>): Promise<Theme | undefined>;
  deleteTheme(id: string): Promise<boolean>;

  getSubsites(): Promise<Subsite[]>;
  getSubsite(id: string): Promise<Subsite | undefined>;
  createSubsite(subsite: InsertSubsite): Promise<Subsite>;
  updateSubsite(id: string, subsite: Partial<Subsite>): Promise<Subsite | undefined>;
  deleteSubsite(id: string): Promise<boolean>;

  getLinks(): Promise<Link[]>;
  getLinksBySubsite(subsiteId: string): Promise<Link[]>;
  getLink(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, link: Partial<Link>): Promise<Link | undefined>;
  deleteLink(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private themes: Map<string, Theme>;
  private subsites: Map<string, Subsite>;
  private links: Map<string, Link>;

  constructor() {
    this.themes = new Map();
    this.subsites = new Map();
    this.links = new Map();
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
}

export const storage = new DatabaseStorage();
