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

export default function Themes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
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
      form.reset({
        name: "",
        colors: defaultColors,
        logoUrl: "",
      });
    }
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
