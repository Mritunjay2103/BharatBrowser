"use client";

import { forwardRef, useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";

type BrowserViewProps = {
  src: string;
  onLoad: () => void;
  isLoading: boolean;
};

const BrowserView = forwardRef<HTMLIFrameElement, BrowserViewProps>(
  ({ src, onLoad, isLoading }, ref) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (src && src !== 'about:blank') {
            fetch(src)
                .then(res => res.json())
                .then(data => {
                    if(data.error) {
                        setError(`Error: ${data.details || data.error}`);
                        setHtmlContent('');
                    } else if (data.html) {
                        setHtmlContent(data.html);
                        setError('');
                    } else {
                        // Handle non-html content, maybe show a message or redirect
                         setHtmlContent(`<p>Cannot display this content type.</p>`);
                         setError('');
                    }
                    onLoad(); // Signal that loading (the fetch) is complete
                })
                .catch(err => {
                    console.error("Error fetching proxied content:", err);
                    setError('Failed to load content from proxy.');
                    setHtmlContent('');
                    onLoad();
                });
        }
    }, [src, onLoad]);

    return (
      <div className="relative h-full w-full bg-background">
        {(isLoading && !htmlContent) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background p-4">
                <div className="text-center text-destructive">
                    <h2 className="text-lg font-bold">Failed to load page</h2>
                    <p>{error}</p>
                </div>
            </div>
        )}
        <iframe
          ref={ref}
          srcDoc={htmlContent}
          className="h-full w-full border-0"
          title="Browser View"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    );
  }
);

BrowserView.displayName = 'BrowserView';

export default BrowserView;
