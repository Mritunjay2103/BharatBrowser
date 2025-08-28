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
  const [isLoading, setIsLoading] = useState(true);
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

  const debouncedExtractContent = useCallback(debounce(extractContent, 2000), [extractContent]);

  useEffect(() => {
    // Navigate to the initial URL when the component mounts
    handleNavigate(url);
  }, []);


  const handleNavigate = (newUrl: string) => {
    if (!newUrl) return;
    setIframeSrc(newUrl);
    setUrl(newUrl);
    // The content extraction will be triggered by the iframe's onLoad event
    // to correctly handle redirects and get the final URL.
    setIsLoading(true);
  };

  const handleRefresh = () => {
    if (iframeSrc && iframeSrc !== 'about:blank') {
        const currentSrc = iframeRef.current?.src;
        if (currentSrc) {
            setIsLoading(true);
            extractContent(currentSrc);
            // Appending a timestamp to the URL to force a reload
            const reloader = currentSrc.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
            setIframeSrc(currentSrc.split('?')[0].split('&')[0] + reloader);
        }
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const backUrl = history[newIndex];
      setHistoryIndex(newIndex);
      handleNavigate(backUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const forwardUrl = history[newIndex];
      setHistoryIndex(newIndex);
      handleNavigate(forwardUrl);
    }
  };
  
  const handleIframeLoad = () => {
    setIsLoading(false);
    const iframeUrl = iframeRef.current?.src;
    if (iframeUrl && iframeUrl !== 'about:blank' && url !== iframeUrl) {
      // The actual URL loaded in the iframe might be different from what we set,
      // especially after initial load or redirects. We use the proxy to get the final URL.
      debouncedExtractContent(iframeUrl);
    } else if (iframeUrl) {
      // If the URL is the same, just ensure content is loaded.
      debouncedExtractContent(iframeUrl);
    }
  }

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
          onLoad={handleIframeLoad}
          isLoading={isLoading}
        />
        <DpiPopup open={isPopupOpen} pageContent={pageContent} pageVersion={pageVersion} />
      </div>
    </div>
  );
}
