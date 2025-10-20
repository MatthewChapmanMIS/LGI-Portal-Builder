import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Layers, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubsiteCard } from "@/components/subsite-card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSubsiteSchema, type Subsite, type InsertSubsite } from "@shared/schema";
import { z } from "zod";

const subsiteFormSchema = insertSubsiteSchema;

interface SortableSubsiteItemProps {
  subsite: Subsite;
  childSubsites: Subsite[];
  onEdit: (subsite: Subsite) => void;
  onDelete: (id: string) => void;
}

function SortableSubsiteItem({ subsite, childSubsites, onEdit, onDelete }: SortableSubsiteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subsite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-4">
      <div className="relative">
        <div
          className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <SubsiteCard subsite={subsite} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {childSubsites.length > 0 && (
        <div className="ml-8 space-y-4">
          {childSubsites.map((child) => (
            <div key={child.id} className="flex items-start gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
              <div className="flex-1">
                <SubsiteCard subsite={child} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Subsites() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubsite, setEditingSubsite] = useState<Subsite | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof subsiteFormSchema>>({
    resolver: zodResolver(subsiteFormSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      customDomain: "",
      iconUrl: "",
      parentId: null,
      order: 0,
    },
  });

  const { data: subsites, isLoading } = useQuery<Subsite[]>({
    queryKey: ["/api/subsites"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSubsite) => apiRequest("POST", "/api/subsites", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subsites"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Subsite created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create subsite", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subsite> }) =>
      apiRequest("PATCH", `/api/subsites/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subsites"] });
      setIsDialogOpen(false);
      setEditingSubsite(null);
      form.reset();
      toast({ title: "Subsite updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update subsite", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/subsites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subsites"] });
      toast({ title: "Subsite deleted successfully" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      apiRequest("PATCH", `/api/subsites/${id}`, { order }),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subsites"] });
      toast({ title: "Failed to reorder subsites", variant: "destructive" });
    },
  });

  const handleSubmit = (data: z.infer<typeof subsiteFormSchema>) => {
    if (editingSubsite) {
      updateMutation.mutate({ id: editingSubsite.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (subsite: Subsite) => {
    setEditingSubsite(subsite);
    form.reset({
      name: subsite.name,
      description: subsite.description || "",
      url: subsite.url || "",
      customDomain: subsite.customDomain || "",
      iconUrl: subsite.iconUrl || "",
      parentId: subsite.parentId,
      order: subsite.order,
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingSubsite(null);
      form.reset();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !subsites) return;

    const activeIndex = subsites.findIndex(s => s.id === active.id);
    const overIndex = subsites.findIndex(s => s.id === over.id);

    const originalOrderById: Record<string, number> = {};
    subsites.forEach(s => {
      originalOrderById[s.id] = s.order;
    });

    const reordered = arrayMove(subsites, activeIndex, overIndex).map((s, index) => ({
      ...s,
      order: index,
    }));
    
    queryClient.setQueryData(["/api/subsites"], reordered);
    
    const itemsToUpdate = reordered.filter(s => originalOrderById[s.id] !== s.order);
    let completed = 0;
    
    itemsToUpdate.forEach((subsite) => {
      reorderMutation.mutate(
        { id: subsite.id, order: subsite.order },
        {
          onSettled: () => {
            completed++;
            if (completed === itemsToUpdate.length) {
              queryClient.invalidateQueries({ queryKey: ["/api/subsites"] });
            }
          },
        }
      );
    });
  };

  const parentSubsites = subsites?.filter(s => !s.parentId) || [];
  const childSubsites = (parentId: string) =>
    subsites?.filter(s => s.parentId === parentId) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold" data-testid="text-subsites-title">
            Subsites
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your portal subsites in a hierarchical structure
          </p>
        </div>
        <Button
          onClick={() => handleDialogChange(true)}
          data-testid="button-create-subsite"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Subsite
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      ) : subsites && subsites.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subsites.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parentSubsites.map((subsite) => (
                  <SortableSubsiteItem
                    key={subsite.id}
                    subsite={subsite}
                    childSubsites={childSubsites(subsite.id)}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="p-12 text-center">
          <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Subsites Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first subsite to organize your portal content
          </p>
          <Button
            onClick={() => handleDialogChange(true)}
            data-testid="button-create-first-subsite"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Subsite
          </Button>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubsite ? "Edit Subsite" : "Create New Subsite"}
            </DialogTitle>
            <DialogDescription>
              Add a new subsite to organize your portal structure
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsite Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Product Division"
                        data-testid="input-subsite-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this subsite..."
                        rows={3}
                        data-testid="input-subsite-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        data-testid="input-subsite-url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Domain (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="portal.example.com"
                        data-testid="input-subsite-custom-domain"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Subsite (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-parent-subsite">
                          <SelectValue placeholder="Select parent subsite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {parentSubsites.filter(s => s.id !== editingSubsite?.id).map((subsite) => (
                          <SelectItem key={subsite.id} value={subsite.id}>
                            {subsite.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon/Logo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Upload subsite icon"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  data-testid="button-cancel-subsite"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-subsite"
                >
                  {editingSubsite ? "Update Subsite" : "Create Subsite"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
