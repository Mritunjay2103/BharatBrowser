"use client";

import { forwardRef } from 'react';
import { Loader2 } from "lucide-react";

type BrowserViewProps = {
  src: string;
  onLoad: () => void;
  isLoading: boolean;
};

const BrowserView = forwardRef<HTMLIFrameElement, BrowserViewProps>(
  ({ src, onLoad, isLoading }, ref) => {
    return (
      <div className="relative h-full w-full bg-background">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          ref={ref}
          src={src}
          onLoad={onLoad}
          className="h-full w-full border-0"
          title="Browser View"
          // By sandboxing and only allowing scripts, we can somewhat prevent iframe navigation
          // and try to handle it ourselves. This is not foolproof.
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }
);

BrowserView.displayName = 'BrowserView';

export default BrowserView;
