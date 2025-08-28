"use client";

import { useState, useRef, useEffect } from "react";
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
  const [pageContent, setPageContent] = useState('');
  const [pageVersion, setPageVersion] = useState(0); // Used to trigger summarization
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const extractContent = async (fetchUrl: string) => {
    // Ensure we don't try to fetch an empty URL
    if (!fetchUrl) {
        setIsLoading(false);
        setPageContent("No URL to load content from.");
        setPageVersion(v => v + 1);
        return;
    }
    
    setIsLoading(true);
    setPageContent('');
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(fetchUrl)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      const { content } = await response.json();
      setPageContent(content);
    } catch (error) {
      console.error("Failed to extract content via proxy:", error);
      setPageContent("Could not load page content. The site may be blocking requests.");
    } finally {
        setPageVersion(v => v + 1);
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (iframeSrc) {
      extractContent(iframeSrc);
    }
  }, []);


  const handleNavigate = (newUrl: string) => {
    setIframeSrc(newUrl);
    setUrl(newUrl);
    extractContent(newUrl);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleRefresh = () => {
    if (iframeSrc) {
        extractContent(iframeSrc);
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
      setIframeSrc(backUrl);
      setUrl(backUrl);
      extractContent(backUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const forwardUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setIframeSrc(forwardUrl);
      setUrl(forwardUrl);
      extractContent(forwardUrl);
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
          ref={iframeRef}
          src={iframeSrc}
          onLoad={() => {
            // When the iframe finishes loading, we don't need to do anything here
            // because content extraction is handled via our proxy.
            // We just set loading to false for the visual indicator.
            if(iframeRef.current?.src === iframeSrc) {
               setIsLoading(false);
            }
          }}
          isLoading={isLoading}
        />
        <DpiPopup open={isPopupOpen} pageContent={pageContent} pageVersion={pageVersion} />
      </div>
    </div>
  );
}
