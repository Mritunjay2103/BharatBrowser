"use client";

import { useState } from "react";
import BrowserChrome from "./browser-chrome";
import BrowserView from "./browser-view";
import DpiPopup from "./dpi-popup";

export default function DPIBrowser() {
  const [url, setUrl] = useState("https://www.wikipedia.org/");
  const [iframeSrc, setIframeSrc] = useState("https://www.wikipedia.org/");
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(["https://www.wikipedia.org/"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigate = (newUrl: string) => {
    setIsLoading(true);
    setIframeSrc(newUrl);
    setUrl(newUrl);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleRefresh = () => {
    if (iframeSrc) {
      setIsLoading(true);
      // Appending a timestamp to the URL to force a reload
      const reloader = iframeSrc.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
      setIframeSrc(iframeSrc.split('?')[0].split('&')[0] + reloader);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const backUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setIsLoading(true);
      setIframeSrc(backUrl);
      setUrl(backUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const forwardUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setIsLoading(true);
      setIframeSrc(forwardUrl);
      setUrl(forwardUrl);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-card font-sans">
      <BrowserChrome
        url={url}
        onNavigate={handleNavigate}
        onTogglePopup={() => setIsPopupOpen(!isPopupOpen)}
        isPopupOpen={isPopupOpen}
        onRefresh={handleRefresh}
        onBack={handleBack}
        onForward={handleForward}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        isLoading={isLoading}
      />
      <div className="relative flex-1">
        <BrowserView
          src={iframeSrc}
          onLoad={() => setIsLoading(false)}
          isLoading={isLoading}
        />
        <DpiPopup open={isPopupOpen} />
      </div>
    </div>
  );
}
