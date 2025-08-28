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
                        // Pass the final URL and content up to the parent
                        onContentLoaded({ finalUrl: data.finalUrl, content: data.content });
                        
                        // Set the iframe content. We add a script to handle navigation.
                        iframe.srcdoc = data.html + `
                          <script>
                            document.addEventListener('click', function(e) {
                              let target = e.target;
                              while (target && target.tagName !== 'A') {
                                target = target.parentElement;
                              }
                              if (target && target.tagName === 'A' && target.href) {
                                // Prevent default navigation
                                e.preventDefault();
                                
                                // Send message to parent window to handle navigation
                                const href = target.getAttribute('href');
                                const urlParams = new URLSearchParams(href.split('?')[1]);
                                const newUrl = urlParams.get('url');
                                if (newUrl) {
                                   window.parent.postMessage({ type: 'navigate', url: newUrl }, '*');
                                }
                              }
                            }, true); // Use capture phase to catch clicks early
                          <\/script>
                        `;
                    }
                })
                .catch(err => {
                    console.error("Error fetching proxied content:", err);
                    const errorMsg = 'Failed to load content from proxy.';
                    onContentLoaded({ error: errorMsg });
                    iframe.srcdoc = `<p>${errorMsg}</p>`;
                });
        } else if (proxySrc === 'about:blank' && ref && 'current' in ref && ref.current) {
           ref.current.srcdoc = ' '; // Clear the iframe
        }
    }, [proxySrc, onContentLoaded, ref]);

    return (
      <div className="relative h-full w-full bg-background">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          ref={ref}
          className="h-full w-full border-0"
          title="Browser View"
          // Sandbox is crucial for security, but allow-forms and allow-scripts are needed for interactivity.
          // allow-top-navigation-by-user-activation is important
          // allow-popups for things like OAuth
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
        />
      </div>
    );
  }
);

BrowserView.displayName = 'BrowserView';

export default BrowserView;
