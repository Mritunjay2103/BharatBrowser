"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BrowserChrome from "./browser-chrome";
import BrowserView from "./browser-view";
import DpiPopup from "./dpi-popup";

export default function DPIBrowser() {
  const [url, setUrl] = useState("https://www.wikipedia.org/");
  const [iframeSrc, setIframeSrc] = useState("about:blank");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pageContent, setPageContent] = useState('');
  const [pageVersion, setPageVersion] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = useCallback((newUrl: string, type: 'new' | 'history' = 'new') => {
    if (!newUrl || newUrl === 'about:blank' || (type === 'new' && newUrl === url) ) return;
    
    setIsLoading(true);
    setPageContent('');
    setUrl(newUrl);
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(newUrl)}`;
    setIframeSrc(proxyUrl);

    if (type === 'new' && newUrl !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex, url]);

  useEffect(() => {
    handleNavigate(url, 'new');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIframeLoad = useCallback((data: { finalUrl?: string; content?: string; error?: string }) => {
    setIsLoading(false);
    if (data.error) {
        setPageContent(`Error loading page: ${data.error}`);
    } else {
        if (data.finalUrl && data.finalUrl !== url) {
            setUrl(data.finalUrl);
            const newHistory = [...history];
            if (newHistory[historyIndex] !== data.finalUrl) {
                newHistory[historyIndex] = data.finalUrl;
                setHistory(newHistory);
            }
        }
        setPageContent(data.content || '');
    }
    setPageVersion(v => v + 1);
  }, [url, history, historyIndex]);

  const handleRefresh = () => {
    if (iframeSrc && iframeSrc !== 'about:blank') {
        setIsLoading(true);
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
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
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
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#243b55] font-sans">
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
      <div className="relative flex-1 overflow-hidden">
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
