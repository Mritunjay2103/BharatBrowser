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
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    );
  }
);

BrowserView.displayName = 'BrowserView';

export default BrowserView;
