"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BrowserChrome from "./browser-chrome";
import BrowserView from "./browser-view";
import DpiPopup from "./dpi-popup";

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}


export default function DPIBrowser() {
  const [url, setUrl] = useState("https://www.wikipedia.org/");
  const [iframeSrc, setIframeSrc] = useState("about:blank");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pageContent, setPageContent] = useState('');
  const [pageVersion, setPageVersion] = useState(0); // Used to trigger summarization
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const extractContent = useCallback(async (fetchUrl: string) => {
    if (!fetchUrl || fetchUrl === "about:blank") {
        setIsLoading(false);
        setPageContent("");
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
      const { content, finalUrl } = await response.json();
      
      // Update URL in address bar to the final URL after redirects
      setUrl(finalUrl); 

      // Update history if the URL has changed
      if (history[historyIndex] !== finalUrl) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(finalUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      
      setPageContent(content);

    } catch (error) {
      console.error("Failed to extract content via proxy:", error);
      setPageContent("Could not load page content. The site may be blocking requests.");
    } finally {
        setPageVersion(v => v + 1);
        setIsLoading(false);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    // Navigate to the initial URL when the component mounts
    if(url) {
        handleNavigate(url, 'new');
    }
  }, []);


  const handleNavigate = (newUrl: string, type: 'new' | 'history' = 'new') => {
    if (!newUrl) return;

    if (type === 'new') {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }

    setUrl(newUrl);
    // Use the proxy for the iframe source as well
    setIframeSrc(`/api/proxy?url=${encodeURIComponent(newUrl)}`); 
    setIsLoading(true);
    extractContent(newUrl);
  };

  const handleRefresh = () => {
    if (url && url !== 'about:blank') {
        setIsLoading(true);
        extractContent(url);
        // Appending a timestamp to the URL to force a reload, passed to the proxy
        const reloader = url.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
        setIframeSrc(`/api/proxy?url=${encodeURIComponent(url + reloader)}`);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const backUrl = history[newIndex];
      setHistoryIndex(newIndex);
      handleNavigate(backUrl, 'history');
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const forwardUrl = history[newIndex];
      setHistoryIndex(newIndex);
      handleNavigate(forwardUrl, 'history');
    }
  };
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  }

  return (
    <div className="flex h-screen w-full flex-col bg-card font-sans">
      <BrowserChrome
        url={url}
        onNavigate={(newUrl) => handleNavigate(newUrl, 'new')}
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
          onLoad={handleIframeLoad}
          isLoading={isLoading}
        />
        <DpiPopup open={isPopupOpen} pageContent={pageContent} pageVersion={pageVersion} />
      </div>
    </div>
  );
}
