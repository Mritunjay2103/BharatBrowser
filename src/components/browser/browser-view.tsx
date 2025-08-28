"use client";

import { forwardRef, useEffect } from 'react';
import { Loader2 } from "lucide-react";

type BrowserViewProps = {
  proxySrc: string;
  onContentLoaded: (data: { finalUrl?: string; content?: string, html?: string, error?: string }) => void;
  isLoading: boolean;
};

const BrowserView = forwardRef<HTMLIFrameElement, BrowserViewProps>(
  ({ proxySrc, onContentLoaded, isLoading }, ref) => {

    useEffect(() => {
        if (proxySrc && proxySrc !== 'about:blank') {
            const iframe = (ref as React.RefObject<HTMLIFrameElement>)?.current;
            if (!iframe) return;

            fetch(proxySrc)
                .then(res => {
                  if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  return res.json()
                })
                .then(data => {
                    if(data.error) {
                        onContentLoaded({ error: data.details || data.error });
                        iframe.srcdoc = data.html || `<p>Error: ${data.error}</p>`;
                    } else {
                        onContentLoaded({ finalUrl: data.finalUrl, content: data.content });
                        iframe.srcdoc = data.html + `
                          <script>
                            document.addEventListener('click', function(e) {
                              let target = e.target;
                              while (target && target.tagName !== 'A') {
                                target = target.parentElement;
                              }
                              if (target && target.tagName === 'A' && target.href) {
                                e.preventDefault();
                                const href = target.getAttribute('href');
                                const urlParams = new URLSearchParams(href.split('?')[1]);
                                const newUrl = urlParams.get('url');
                                if (newUrl) {
                                   window.parent.postMessage({ type: 'navigate', url: newUrl }, '*');
                                }
                              }
                            }, true);
                          <\/script>
                        `;
                    }
                })
                .catch(err => {
                    console.error("Error fetching proxied content:", err);
                    const errorMsg = 'Failed to load content from proxy.';
                    onContentLoaded({ error: errorMsg });
                    if (iframe) {
                        iframe.srcdoc = `<p>${errorMsg}</p>`;
                    }
                });
        } else if (proxySrc === 'about:blank' && ref && 'current' in ref && ref.current) {
           ref.current.srcdoc = ' '; // Clear the iframe
        }
    }, [proxySrc, onContentLoaded, ref]);

    return (
      <div className="relative h-full w-full bg-gray-800">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="mt-2 text-sm text-foreground">Loading Page...</p>
            </div>
          </div>
        )}
        <iframe
          ref={ref}
          className="h-full w-full border-0"
          title="Browser View"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
        />
      </div>
    );
  }
);

BrowserView.displayName = 'BrowserView';

export default BrowserView;
