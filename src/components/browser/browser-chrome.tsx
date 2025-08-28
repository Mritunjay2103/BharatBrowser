"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Loader2,
  AppWindow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { POPULAR_SITES } from "@/lib/constants";

type BrowserChromeProps = {
  url: string;
  onNavigate: (url: string) => void;
  onTogglePopup: () => void;
  isPopupOpen: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
};

export default function BrowserChrome({
  url,
  onNavigate,
  onTogglePopup,
  isPopupOpen,
  onRefresh,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  isLoading,
}: BrowserChromeProps) {
  const [inputValue, setInputValue] = useState(url);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleSearchOrNavigate = (value: string) => {
    const term = value.trim();
    if (term) {
      try {
        // Check if it's a valid URL, if not, could be a partial one
        new URL(term);
        onNavigate(term);
      } catch (_) {
        // Not a full URL, check for common patterns
        if (term.includes(".") && !term.includes(" ")) {
          onNavigate(`https://${term}`);
        } else {
          onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(term)}`);
        }
      }
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };
  
  const filteredSites = POPULAR_SITES.filter(site => 
    site.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background/50 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
      </div>
      <div className="ml-4 flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={!canGoBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onForward} disabled={!canGoForward}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
        <PopoverAnchor asChild>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchOrNavigate(inputValue);
                }
              }}
              placeholder="Search or type a URL"
              className="pl-9"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1">
            {filteredSites.map((site) => (
              <button
                key={site.name}
                onClick={() => handleSearchOrNavigate(site.url)}
                className="flex items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <site.icon className="h-4 w-4 text-muted-foreground" />
                <span>{site.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{site.url}</span>
              </button>
            ))}
            {filteredSites.length === 0 && inputValue && (
              <button
                onClick={() => handleSearchOrNavigate(inputValue)}
                className="flex items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Search for "{inputValue}"</span>
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePopup}
        className={cn("ml-2", isPopupOpen && "bg-accent text-accent-foreground")}
      >
        {isPopupOpen ? <X className="h-5 w-5"/> : <AppWindow className="h-5 w-5" />}
      </Button>
    </header>
  );
}
