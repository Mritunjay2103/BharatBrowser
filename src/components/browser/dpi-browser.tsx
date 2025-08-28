"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BrowserChrome from "./browser-chrome";
import BrowserView from "./browser-view";
import DpiPopup from "./dpi-popup";

export default function DPIBrowser() {
  const [url, setUrl] = useState("https://www.wikipedia.org/");
  // This is the source for the iframe, which will always be our proxy
  const [iframeSrc, setIframeSrc] = useState("about:blank");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pageContent, setPageContent] = useState('');
  const [pageVersion, setPageVersion] = useState(0); // Used to trigger summary refresh
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Memoize handleNavigate to prevent re-creation on every render
  const handleNavigate = useCallback((newUrl: string, type: 'new' | 'history' = 'new') => {
    if (!newUrl || newUrl === 'about:blank') return;
    
    // Prevent re-navigating to the same URL from the address bar
    if (type === 'new' && newUrl === url) {
       handleRefresh();
       return;
    }

    setIsLoading(true);
    setPageContent(''); // Clear old content immediately
    setUrl(newUrl); // Update address bar immediately
    
    // All navigation goes through our proxy
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(newUrl)}`;
    setIframeSrc(proxyUrl);

    if (type === 'new' && newUrl !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex, url]); // Add dependencies

  useEffect(() => {
    // Initial load
    handleNavigate(url, 'new');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // This function is passed to the iframe, and the iframe calls it when its content has loaded
  const handleIframeLoad = useCallback((data: { finalUrl?: string; content?: string; error?: string }) => {
    setIsLoading(false);
    if (data.error) {
        setPageContent(`Error loading page: ${data.error}`);
    } else {
        // The proxy tells us the final URL and gives us the content
        if (data.finalUrl && data.finalUrl !== url) {
            setUrl(data.finalUrl);
            // Update history with the final redirected URL
            const newHistory = [...history];
            if (newHistory[historyIndex] !== data.finalUrl) {
                newHistory[historyIndex] = data.finalUrl;
                setHistory(newHistory);
            }
        }
        setPageContent(data.content || '');
    }
    // Increment version to trigger re-summarization in AiCopilot
    setPageVersion(v => v + 1);
  }, [url, history, historyIndex]);

  const handleRefresh = () => {
    if (iframeSrc && iframeSrc !== 'about:blank') {
        setIsLoading(true);
        // Re-request from the proxy, adding a timestamp to bypass cache
        const cacheBuster = `&t=${Date.now()}`;
        setIframeSrc(iframeSrc.split('&t=')[0] + cacheBuster);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      handleNavigate(history[newIndex], 'history');
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      handleNavigate(history[newIndex], 'history');
    }
  };
  
  // This useEffect will listen for navigation events from the iframe content
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check origin if you have a known domain
      // if (event.origin !== window.location.origin) return;

      const { type, url: newUrl } = event.data;
      if (type === 'navigate') {
        handleNavigate(newUrl, 'new');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleNavigate]);


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
          proxySrc={iframeSrc}
          onContentLoaded={handleIframeLoad}
          isLoading={isLoading}
        />
        <DpiPopup open={isPopupOpen} pageContent={pageContent} pageVersion={pageVersion} />
      </div>
    </div>
  );
}
