import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeCard } from "@/components/theme-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertThemeSchema, type Theme, type InsertTheme } from "@shared/schema";
import { z } from "zod";

const themeFormSchema = insertThemeSchema.extend({
  colors: z.object({
    primary: z.string(),
    background: z.string(),
    surface: z.string(),
    accent: z.string(),
    text: z.string(),
    textSecondary: z.string(),
    border: z.string(),
  }),
});

const defaultColors = {
  primary: "#3b82f6",
  background: "#0f172a",
  surface: "#1e293b",
  accent: "#8b5cf6",
  text: "#f8fafc",
  textSecondary: "#cbd5e1",
  border: "#334155",
};

const themeTemplates = [
  {
    name: "Corporate Blue",
    description: "Professional and trustworthy",
    colors: {
      primary: "#1e40af",
      background: "#0f172a",
      surface: "#1e293b",
      accent: "#3b82f6",
      text: "#f8fafc",
      textSecondary: "#cbd5e1",
      border: "#334155",
    },
  },
  {
    name: "Tech Purple",
    description: "Modern and innovative",
    colors: {
      primary: "#7c3aed",
      background: "#18181b",
      surface: "#27272a",
      accent: "#a78bfa",
      text: "#fafafa",
      textSecondary: "#d4d4d8",
      border: "#3f3f46",
    },
  },
  {
    name: "Creative Orange",
    description: "Bold and energetic",
    colors: {
      primary: "#ea580c",
      background: "#1c1917",
      surface: "#292524",
      accent: "#fb923c",
      text: "#fafaf9",
      textSecondary: "#d6d3d1",
      border: "#44403c",
    },
  },
  {
    name: "Minimal Gray",
    description: "Clean and sophisticated",
    colors: {
      primary: "#0f172a",
      background: "#ffffff",
      surface: "#f8fafc",
      accent: "#475569",
      text: "#0f172a",
      textSecondary: "#64748b",
      border: "#e2e8f0",
    },
  },
  {
    name: "Forest Green",
    description: "Natural and calming",
    colors: {
      primary: "#059669",
      background: "#0c1713",
      surface: "#1a2e25",
      accent: "#10b981",
      text: "#f0fdf4",
      textSecondary: "#d1fae5",
      border: "#2d4a3e",
    },
  },
  {
    name: "Sunset Red",
    description: "Passionate and dynamic",
    colors: {
      primary: "#dc2626",
      background: "#1f0c0c",
      surface: "#2d1414",
      accent: "#ef4444",
      text: "#fef2f2",
      textSecondary: "#fecaca",
      border: "#451a1a",
    },
  },
];

export default function Themes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof themeFormSchema>>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      name: "",
      colors: defaultColors,
      logoUrl: "",
    },
  });

  const { data: themes, isLoading } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTheme) => apiRequest("POST", "/api/themes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themes"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Theme created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create theme", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Theme> }) =>
      apiRequest("PATCH", `/api/themes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themes"] });
      setIsDialogOpen(false);
      setEditingTheme(null);
      form.reset();
      toast({ title: "Theme updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update theme", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/themes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themes"] });
      toast({ title: "Theme deleted successfully" });
    },
  });

  const handleSubmit = (data: z.infer<typeof themeFormSchema>) => {
    if (editingTheme) {
      updateMutation.mutate({ id: editingTheme.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    form.reset({
      name: theme.name,
      colors: theme.colors as any,
      logoUrl: theme.logoUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTheme(null);
      setSelectedTemplate(null);
      form.reset({
        name: "",
        colors: defaultColors,
        logoUrl: "",
      });
    }
  };

  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index);
    const template = themeTemplates[index];
    form.setValue("name", template.name);
    Object.entries(template.colors).forEach(([key, value]) => {
      form.setValue(`colors.${key as keyof typeof defaultColors}`, value);
    });
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    form.setValue("name", "");
    Object.entries(defaultColors).forEach(([key, value]) => {
      form.setValue(`colors.${key as keyof typeof defaultColors}`, value);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold" data-testid="text-themes-title">
            Themes
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your portal's appearance with themes
          </p>
        </div>
        <Button
          onClick={() => handleDialogChange(true)}
          data-testid="button-create-theme"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Theme
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse" />
          ))}
        </div>
      ) : themes && themes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={false}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              onActivate={() => toast({ title: "Theme activated" })}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Themes Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first custom theme to personalize your portal
          </p>
          <Button
            onClick={() => handleDialogChange(true)}
            data-testid="button-create-first-theme"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Theme
          </Button>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? "Edit Theme" : "Create New Theme"}
            </DialogTitle>
            <DialogDescription>
              Customize your portal's color scheme and branding
            </DialogDescription>
          </DialogHeader>

          {!editingTheme && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Start from Template</FormLabel>
                {selectedTemplate !== null && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearTemplate}
                    data-testid="button-clear-template"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {themeTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTemplateSelect(index)}
                    data-testid={`button-template-${index}`}
                    className={`p-3 rounded-md border-2 text-left transition-all hover-elevate ${
                      selectedTemplate === index
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{template.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {template.description}
                    </div>
                    <div className="flex gap-1">
                      {Object.values(template.colors).slice(0, 5).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Dark Professional"
                        data-testid="input-theme-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Color Palette</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(defaultColors).map((key) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`colors.${key as keyof typeof defaultColors}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize text-sm">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                type="color"
                                className="w-16 h-10 p-1 cursor-pointer"
                                data-testid={`input-color-${key}`}
                                {...field}
                              />
                            </FormControl>
                            <Input
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1 font-mono text-sm"
                              pattern="^#[0-9A-Fa-f]{6}$"
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  data-testid="button-cancel-theme"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-theme"
                >
                  {editingTheme ? "Update Theme" : "Create Theme"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
