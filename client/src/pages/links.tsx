import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Link as LinkIcon, GripVertical } from "lucide-react";
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
import { LinkCard } from "@/components/link-card";
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
import { insertLinkSchema, type Link as LinkType, type InsertLink, type Subsite } from "@shared/schema";
import { z } from "zod";

const linkFormSchema = insertLinkSchema;

interface SortableLinkItemProps {
  link: LinkType;
  onEdit: (link: LinkType) => void;
  onDelete: (id: string) => void;
}

function SortableLinkItem({ link, onEdit, onDelete }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <LinkCard link={link} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export default function Links() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof linkFormSchema>>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      subsiteId: "",
      name: "",
      url: "",
      description: "",
      iconUrl: "",
      order: 0,
    },
  });

  const { data: links, isLoading } = useQuery<LinkType[]>({
    queryKey: ["/api/links"],
  });

  const { data: subsites } = useQuery<Subsite[]>({
    queryKey: ["/api/subsites"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertLink) => apiRequest("POST", "/api/links", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Link created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create link", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LinkType> }) =>
      apiRequest("PATCH", `/api/links/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setIsDialogOpen(false);
      setEditingLink(null);
      form.reset();
      toast({ title: "Link updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update link", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link deleted successfully" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      apiRequest("PATCH", `/api/links/${id}`, { order }),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Failed to reorder links", variant: "destructive" });
    },
  });

  const handleSubmit = (data: z.infer<typeof linkFormSchema>) => {
    if (editingLink) {
      updateMutation.mutate({ id: editingLink.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (link: LinkType) => {
    setEditingLink(link);
    form.reset({
      subsiteId: link.subsiteId,
      name: link.name,
      url: link.url,
      description: link.description || "",
      iconUrl: link.iconUrl || "",
      order: link.order,
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingLink(null);
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
    
    if (!over || active.id === over.id || !links) return;

    const activeIndex = links.findIndex(l => l.id === active.id);
    const overIndex = links.findIndex(l => l.id === over.id);

    const originalOrderById: Record<string, number> = {};
    links.forEach(l => {
      originalOrderById[l.id] = l.order;
    });

    const reordered = arrayMove(links, activeIndex, overIndex).map((l, index) => ({
      ...l,
      order: index,
    }));
    
    queryClient.setQueryData(["/api/links"], reordered);
    
    const itemsToUpdate = reordered.filter(l => originalOrderById[l.id] !== l.order);
    let completed = 0;
    
    itemsToUpdate.forEach((link) => {
      reorderMutation.mutate(
        { id: link.id, order: link.order },
        {
          onSettled: () => {
            completed++;
            if (completed === itemsToUpdate.length) {
              queryClient.invalidateQueries({ queryKey: ["/api/links"] });
            },
          },
        }
      );
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold" data-testid="text-links-title">
            Links
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage external links and integrations
          </p>
        </div>
        <Button
          onClick={() => handleDialogChange(true)}
          data-testid="button-create-link"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse" />
          ))}
        </div>
      ) : links && links.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="p-12 text-center">
          <LinkIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Links Yet</h3>
          <p className="text-muted-foreground mb-6">
            Add external links to connect your portal to other applications
          </p>
          <Button
            onClick={() => handleDialogChange(true)}
            data-testid="button-create-first-link"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Edit Link" : "Add New Link"}
            </DialogTitle>
            <DialogDescription>
              Connect external applications or websites to your portal
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subsiteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Subsite</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-subsite">
                          <SelectValue placeholder="Select a subsite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subsites?.map((subsite) => (
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Customer Portal"
                        data-testid="input-link-name"
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
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        data-testid="input-link-url"
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
                        placeholder="Brief description of this link..."
                        rows={3}
                        data-testid="input-link-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Upload link icon"
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
                  data-testid="button-cancel-link"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-link"
                >
                  {editingLink ? "Update Link" : "Add Link"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
