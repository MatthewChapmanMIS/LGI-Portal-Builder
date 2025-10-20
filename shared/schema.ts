import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const themes = pgTable("themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  colors: jsonb("colors").notNull(),
  logoUrl: text("logo_url"),
});

export const subsites = pgTable("subsites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  url: text("url"),
  customDomain: text("custom_domain"),
  parentId: varchar("parent_id"),
  order: integer("order").notNull().default(0),
});

export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subsiteId: varchar("subsite_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  order: integer("order").notNull().default(0),
});

export const insertThemeSchema = createInsertSchema(themes).omit({ id: true }).extend({
  name: z.string().min(1, "Theme name is required"),
  logoUrl: z.string().optional().nullable(),
});

export const insertSubsiteSchema = createInsertSchema(subsites).omit({ id: true }).extend({
  name: z.string().min(1, "Subsite name is required"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
  description: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable(),
  customDomain: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(val),
      "Invalid domain format (e.g., example.com or subdomain.example.com)"
    ),
  parentId: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
});

export const insertLinkSchema = createInsertSchema(links).omit({ id: true }).extend({
  name: z.string().min(1, "Link name is required"),
  url: z.string().url("Invalid URL"),
  subsiteId: z.string().min(1, "Subsite selection is required"),
  description: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
});

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;
export type InsertSubsite = z.infer<typeof insertSubsiteSchema>;
export type Subsite = typeof subsites.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
}
