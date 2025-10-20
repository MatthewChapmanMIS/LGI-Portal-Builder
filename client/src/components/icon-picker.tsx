import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { iconLibrary, searchIcons, getIconByName, type IconInfo } from "@/lib/iconLibrary";

interface IconPickerProps {
  value?: string | null;
  onChange: (iconName: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label = "Select Icon" }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const SelectedIcon = value ? getIconByName(value) : null;
  const filteredIcons = searchQuery ? searchIcons(searchQuery) : null;

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onChange("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 justify-start"
          onClick={() => setIsOpen(true)}
          data-testid="button-open-icon-picker"
        >
          {SelectedIcon ? (
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4" />
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            data-testid="button-clear-icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Choose an Icon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-icons"
              />
            </div>

            {filteredIcons ? (
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-6 gap-2 p-1">
                  {filteredIcons.map((iconInfo) => {
                    const IconComponent = iconInfo.icon;
                    return (
                      <button
                        key={iconInfo.name}
                        type="button"
                        onClick={() => handleSelect(iconInfo.name)}
                        className="group flex flex-col items-center gap-2 p-4 rounded-lg hover-elevate active-elevate-2 transition-all"
                        data-testid={`button-select-icon-${iconInfo.name}`}
                      >
                        <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                          {iconInfo.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No icons found matching "{searchQuery}"
                  </div>
                )}
              </ScrollArea>
            ) : (
              <Tabs defaultValue={iconLibrary[0]?.name} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto flex-wrap gap-1">
                  {iconLibrary.slice(0, 4).map((category) => (
                    <TabsTrigger key={category.name} value={category.name} className="text-xs">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid w-full grid-cols-4 h-auto flex-wrap gap-1 mt-1">
                  {iconLibrary.slice(4, 8).map((category) => (
                    <TabsTrigger key={category.name} value={category.name} className="text-xs">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid w-full grid-cols-3 h-auto flex-wrap gap-1 mt-1">
                  {iconLibrary.slice(8).map((category) => (
                    <TabsTrigger key={category.name} value={category.name} className="text-xs">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {iconLibrary.map((category) => (
                  <TabsContent key={category.name} value={category.name} className="mt-4">
                    <ScrollArea className="h-[300px]">
                      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                      <div className="grid grid-cols-6 gap-2 p-1">
                        {category.icons.map((iconInfo) => {
                          const IconComponent = iconInfo.icon;
                          return (
                            <button
                              key={iconInfo.name}
                              type="button"
                              onClick={() => handleSelect(iconInfo.name)}
                              className="group flex flex-col items-center gap-2 p-4 rounded-lg hover-elevate active-elevate-2 transition-all"
                              data-testid={`button-select-icon-${iconInfo.name}`}
                            >
                              <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-full text-center">
                                {iconInfo.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  ))}
                </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
