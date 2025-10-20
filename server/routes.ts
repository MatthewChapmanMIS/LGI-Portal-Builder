import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThemeSchema, insertSubsiteSchema, insertLinkSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/themes", async (_req, res) => {
    try {
      const themes = await storage.getThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch themes" });
    }
  });

  app.get("/api/themes/:id", async (req, res) => {
    try {
      const theme = await storage.getTheme(req.params.id);
      if (!theme) {
        return res.status(404).json({ error: "Theme not found" });
      }
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  });

  app.post("/api/themes", async (req, res) => {
    try {
      const data = insertThemeSchema.parse(req.body);
      const theme = await storage.createTheme(data);
      res.status(201).json(theme);
    } catch (error) {
      res.status(400).json({ error: "Invalid theme data" });
    }
  });

  app.patch("/api/themes/:id", async (req, res) => {
    try {
      const theme = await storage.updateTheme(req.params.id, req.body);
      if (!theme) {
        return res.status(404).json({ error: "Theme not found" });
      }
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to update theme" });
    }
  });

  app.delete("/api/themes/:id", async (req, res) => {
    try {
      const success = await storage.deleteTheme(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Theme not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete theme" });
    }
  });

  app.get("/api/subsites", async (_req, res) => {
    try {
      const subsites = await storage.getSubsites();
      res.json(subsites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subsites" });
    }
  });

  app.get("/api/subsites/:id", async (req, res) => {
    try {
      const subsite = await storage.getSubsite(req.params.id);
      if (!subsite) {
        return res.status(404).json({ error: "Subsite not found" });
      }
      res.json(subsite);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subsite" });
    }
  });

  app.post("/api/subsites", async (req, res) => {
    try {
      const data = insertSubsiteSchema.parse(req.body);
      const subsite = await storage.createSubsite(data);
      res.status(201).json(subsite);
    } catch (error) {
      res.status(400).json({ error: "Invalid subsite data" });
    }
  });

  app.patch("/api/subsites/:id", async (req, res) => {
    try {
      const subsite = await storage.updateSubsite(req.params.id, req.body);
      if (!subsite) {
        return res.status(404).json({ error: "Subsite not found" });
      }
      res.json(subsite);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subsite" });
    }
  });

  app.delete("/api/subsites/:id", async (req, res) => {
    try {
      const success = await storage.deleteSubsite(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Subsite not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subsite" });
    }
  });

  app.get("/api/links", async (_req, res) => {
    try {
      const links = await storage.getLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.get("/api/subsites/:subsiteId/links", async (req, res) => {
    try {
      const links = await storage.getLinksBySubsite(req.params.subsiteId);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.get("/api/links/:id", async (req, res) => {
    try {
      const link = await storage.getLink(req.params.id);
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch link" });
    }
  });

  app.post("/api/links", async (req, res) => {
    try {
      const data = insertLinkSchema.parse(req.body);
      const link = await storage.createLink(data);
      res.status(201).json(link);
    } catch (error) {
      res.status(400).json({ error: "Invalid link data" });
    }
  });

  app.patch("/api/links/:id", async (req, res) => {
    try {
      const link = await storage.updateLink(req.params.id, req.body);
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to update link" });
    }
  });

  app.delete("/api/links/:id", async (req, res) => {
    try {
      const success = await storage.deleteLink(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Link not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  // Object storage routes for file uploads (public file uploading)
  // Reference: blueprint:javascript_object_storage
  
  // Get upload URL for new file
  app.post("/api/objects/upload", async (_req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded objects with ACL enforcement
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      
      // Check ACL permissions (no userId since no auth yet)
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: undefined, // No auth system yet
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Finalize uploaded image - validate and set ACL
  app.put("/api/images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(
        req.body.imageURL,
      );

      // Verify the uploaded file exists
      const objectFile = await objectStorageService.getObjectEntityFile(normalizedPath);
      
      // Get metadata to validate it's an image
      const [metadata] = await objectFile.getMetadata();
      const contentType = metadata.contentType || '';
      
      // Validate it's an image
      if (!contentType.startsWith('image/')) {
        // Delete invalid upload
        await objectFile.delete();
        return res.status(400).json({ error: "File must be an image" });
      }
      
      // Validate file size (10MB max)
      const sizeInBytes = parseInt(String(metadata.size || '0'));
      if (sizeInBytes > 10485760) {
        await objectFile.delete();
        return res.status(400).json({ error: "File too large (max 10MB)" });
      }

      // Set public ACL policy for the uploaded image
      await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "system", // No auth yet, use system as owner
          visibility: "public", // Portal logos/icons should be public
        }
      );

      res.status(200).json({
        objectPath: normalizedPath,
        contentType,
        size: sizeInBytes,
      });
    } catch (error) {
      console.error("Error processing image URL:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Uploaded file not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
