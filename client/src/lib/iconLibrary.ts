import {
  Home, Building, Users, Settings, Mail, Phone, Calendar, Clock,
  FileText, Folder, Archive, Database, Server, Cloud, HardDrive,
  ShoppingCart, CreditCard, DollarSign, TrendingUp, BarChart,
  Briefcase, Target, Award, Trophy, Star,
  Heart, MessageCircle, Bell, AlertCircle, Info,
  Search, Filter, Download, Upload, Share,
  Code, Terminal, Cpu, Smartphone, Monitor,
  Globe, Map, MapPin, Navigation, Compass,
  Book, GraduationCap, Bookmark, Lightbulb, Zap,
  Camera, Image, Video, Music, Film,
  type LucideIcon
} from "lucide-react";

export interface IconInfo {
  name: string;
  icon: LucideIcon;
  keywords: string[];
}

export interface IconCategory {
  name: string;
  description: string;
  icons: IconInfo[];
}

export const iconLibrary: IconCategory[] = [
  {
    name: "Business & Office",
    description: "Icons for corporate and professional applications",
    icons: [
      { name: "Home", icon: Home, keywords: ["home", "house", "main", "dashboard"] },
      { name: "Building", icon: Building, keywords: ["office", "company", "building", "corporate"] },
      { name: "Briefcase", icon: Briefcase, keywords: ["business", "work", "briefcase", "professional"] },
      { name: "Users", icon: Users, keywords: ["team", "people", "group", "users"] },
      { name: "Target", icon: Target, keywords: ["goal", "objective", "target", "aim"] },
      { name: "Award", icon: Award, keywords: ["achievement", "success", "award", "medal"] },
      { name: "Trophy", icon: Trophy, keywords: ["winner", "champion", "trophy", "prize"] },
    ]
  },
  {
    name: "Communication",
    description: "Icons for messaging and contact",
    icons: [
      { name: "Mail", icon: Mail, keywords: ["email", "message", "mail", "contact"] },
      { name: "Phone", icon: Phone, keywords: ["call", "telephone", "phone", "contact"] },
      { name: "MessageCircle", icon: MessageCircle, keywords: ["chat", "message", "talk", "conversation"] },
      { name: "Bell", icon: Bell, keywords: ["notification", "alert", "bell", "reminder"] },
    ]
  },
  {
    name: "Files & Data",
    description: "Icons for documents and data management",
    icons: [
      { name: "FileText", icon: FileText, keywords: ["document", "file", "text", "paper"] },
      { name: "Folder", icon: Folder, keywords: ["directory", "folder", "files", "organize"] },
      { name: "Archive", icon: Archive, keywords: ["storage", "archive", "box", "save"] },
      { name: "Database", icon: Database, keywords: ["data", "database", "storage", "sql"] },
      { name: "Server", icon: Server, keywords: ["server", "hosting", "cloud", "infrastructure"] },
      { name: "Cloud", icon: Cloud, keywords: ["cloud", "storage", "online", "sync"] },
      { name: "HardDrive", icon: HardDrive, keywords: ["drive", "disk", "storage", "hardware"] },
    ]
  },
  {
    name: "Commerce",
    description: "Icons for e-commerce and finance",
    icons: [
      { name: "ShoppingCart", icon: ShoppingCart, keywords: ["cart", "shopping", "buy", "purchase"] },
      { name: "CreditCard", icon: CreditCard, keywords: ["payment", "card", "credit", "transaction"] },
      { name: "DollarSign", icon: DollarSign, keywords: ["money", "dollar", "currency", "price"] },
      { name: "TrendingUp", icon: TrendingUp, keywords: ["growth", "increase", "trending", "rise"] },
      { name: "BarChart", icon: BarChart, keywords: ["chart", "graph", "analytics", "stats"] },
    ]
  },
  {
    name: "Actions",
    description: "Icons for common actions and interactions",
    icons: [
      { name: "Search", icon: Search, keywords: ["find", "search", "look", "magnify"] },
      { name: "Filter", icon: Filter, keywords: ["filter", "sort", "organize", "select"] },
      { name: "Download", icon: Download, keywords: ["download", "save", "export", "get"] },
      { name: "Upload", icon: Upload, keywords: ["upload", "import", "send", "add"] },
      { name: "Share", icon: Share, keywords: ["share", "send", "forward", "distribute"] },
    ]
  },
  {
    name: "Technology",
    description: "Icons for tech and development",
    icons: [
      { name: "Code", icon: Code, keywords: ["code", "programming", "dev", "development"] },
      { name: "Terminal", icon: Terminal, keywords: ["console", "terminal", "command", "cli"] },
      { name: "Cpu", icon: Cpu, keywords: ["processor", "cpu", "hardware", "computing"] },
      { name: "Smartphone", icon: Smartphone, keywords: ["mobile", "phone", "smartphone", "device"] },
      { name: "Monitor", icon: Monitor, keywords: ["screen", "display", "monitor", "desktop"] },
    ]
  },
  {
    name: "Location",
    description: "Icons for maps and navigation",
    icons: [
      { name: "Globe", icon: Globe, keywords: ["world", "global", "internet", "web"] },
      { name: "Map", icon: Map, keywords: ["map", "location", "navigation", "directions"] },
      { name: "MapPin", icon: MapPin, keywords: ["location", "pin", "marker", "place"] },
      { name: "Navigation", icon: Navigation, keywords: ["navigate", "direction", "compass", "guide"] },
      { name: "Compass", icon: Compass, keywords: ["compass", "direction", "orientation", "navigate"] },
    ]
  },
  {
    name: "Education",
    description: "Icons for learning and knowledge",
    icons: [
      { name: "Book", icon: Book, keywords: ["book", "read", "library", "learn"] },
      { name: "GraduationCap", icon: GraduationCap, keywords: ["education", "graduate", "school", "university"] },
      { name: "Bookmark", icon: Bookmark, keywords: ["bookmark", "save", "favorite", "mark"] },
      { name: "Lightbulb", icon: Lightbulb, keywords: ["idea", "innovation", "light", "think"] },
      { name: "Zap", icon: Zap, keywords: ["energy", "power", "fast", "quick"] },
    ]
  },
  {
    name: "Media",
    description: "Icons for multimedia content",
    icons: [
      { name: "Camera", icon: Camera, keywords: ["photo", "camera", "picture", "snapshot"] },
      { name: "Image", icon: Image, keywords: ["image", "picture", "photo", "gallery"] },
      { name: "Video", icon: Video, keywords: ["video", "movie", "film", "play"] },
      { name: "Music", icon: Music, keywords: ["music", "audio", "sound", "song"] },
      { name: "Film", icon: Film, keywords: ["film", "movie", "cinema", "video"] },
    ]
  },
  {
    name: "Time & Scheduling",
    description: "Icons for time management",
    icons: [
      { name: "Calendar", icon: Calendar, keywords: ["calendar", "date", "schedule", "event"] },
      { name: "Clock", icon: Clock, keywords: ["time", "clock", "watch", "hour"] },
    ]
  },
  {
    name: "Status & Feedback",
    description: "Icons for alerts and status indicators",
    icons: [
      { name: "AlertCircle", icon: AlertCircle, keywords: ["alert", "warning", "error", "attention"] },
      { name: "Info", icon: Info, keywords: ["information", "info", "help", "details"] },
      { name: "Star", icon: Star, keywords: ["favorite", "star", "rating", "featured"] },
      { name: "Heart", icon: Heart, keywords: ["like", "love", "heart", "favorite"] },
    ]
  }
];

// Flat list of all icons for searching
export const allIcons: IconInfo[] = iconLibrary.flatMap(category => category.icons);

// Search icons by keyword
export function searchIcons(query: string): IconInfo[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return allIcons;
  
  return allIcons.filter(iconInfo =>
    iconInfo.name.toLowerCase().includes(lowerQuery) ||
    iconInfo.keywords.some(keyword => keyword.includes(lowerQuery))
  );
}

// Get icon component by name
export function getIconByName(name: string): LucideIcon | null {
  const iconInfo = allIcons.find(i => i.name === name);
  return iconInfo?.icon || null;
}
