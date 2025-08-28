"use client";

import { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    // Navigate to the initial URL when the component mounts
    if (url) {
      handleNavigate(url, 'new');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (newUrl: string, type: 'new' | 'history' = 'new') => {
    if (!newUrl || newUrl === 'about:blank' || (type === 'new' && newUrl === url)) return;
    
    setIsLoading(true);

    if (type === 'new' && newUrl !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }

    setUrl(newUrl);
    setIframeSrc(`/api/proxy?url=${encodeURIComponent(newUrl)}`);
  };

  const handleRefresh = () => {
    if (iframeSrc && iframeSrc !== 'about:blank') {
        setIsLoading(true);
        // Appending a timestamp to the URL to force a reload of the proxy
        const reloader = `&t=${Date.now()}`;
        setIframeSrc(iframeSrc.split('&t=')[0] + reloader);
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
    
    // The iframe has loaded content from our proxy.
    // We can now get the final URL and content from the response headers.
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      // Because the iframe content is served from our own domain via the proxy,
      // we can't just read iframe.contentWindow.location.href.
      // Instead, we fetch the headers from the proxy response.
      const src = iframe.src;
      if (src && src !== 'about:blank') {
          fetch(src)
            .then(res => res.json())
            .then(data => {
                const { finalUrl, content } = data;

                if (finalUrl) {
                    setUrl(finalUrl);
                    // Update history with the final URL
                    if (history[historyIndex] !== finalUrl) {
                        const newHistory = [...history];
                        newHistory[historyIndex] = finalUrl;
                        setHistory(newHistory);
                    }
                }
                
                if (content) {
                    setPageContent(content);
                } else {
                    setPageContent('');
                }
                setPageVersion(v => v + 1);
            })
            .catch(err => {
                console.error("Error fetching proxy data:", err)
                setPageContent('Could not load page content.');
                setPageVersion(v => v + 1);
            });
      }
    }
  };

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
