"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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
    if (!term) return;

    let navUrl;
    try {
      // Check if it's already a valid URL
      new URL(term);
      navUrl = term;
    } catch (_) {
      // If not a full URL, check if it's a domain-like string
      if (term.includes(".") && !term.includes(" ")) {
        navUrl = `https://${term}`;
      } else {
        // Otherwise, treat as a search query
        navUrl = `https://duckduckgo.com/?q=${encodeURIComponent(term)}`;
      }
    }
    onNavigate(navUrl);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };
  
  const filteredSites = POPULAR_SITES.filter(site => 
    site.name.toLowerCase().includes(inputValue.toLowerCase()) || 
    site.url.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 5); // Limit suggestions

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-gradient-to-b from-black/20 to-transparent px-4 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-3.5 rounded-full bg-red-500"></div>
        <div className="h-3.5 w-3.5 rounded-full bg-yellow-500"></div>
        <div className="h-3.5 w-3.5 rounded-full bg-green-500"></div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={!canGoBack} className="h-8 w-8 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onForward} disabled={!canGoForward} className="h-8 w-8 rounded-full">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading} className="h-8 w-8 rounded-full">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              className="h-10 rounded-full bg-black/30 pl-10 text-base shadow-inner backdrop-blur-sm transition-all focus:bg-black/50 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-1 border-white/20 bg-background/80 backdrop-blur-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1">
            {filteredSites.map((site) => (
              <button
                key={site.name}
                onClick={() => handleSearchOrNavigate(site.url)}
                className="flex items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-white/10"
              >
                <site.icon className="h-4 w-4 text-muted-foreground" />
                <span>{site.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{site.url}</span>
              </button>
            ))}
            {inputValue && (
              <button
                onClick={() => handleSearchOrNavigate(inputValue)}
                className="flex items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-white/10"
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
        className={cn("ml-2 h-9 w-9 rounded-full transition-all duration-300 hover:bg-primary/20", isPopupOpen && "bg-primary/80 text-white rotate-90")}
      >
        {isPopupOpen ? <X className="h-5 w-5"/> : <Sparkles className="h-5 w-5" />}
      </Button>
    </header>
  );
}