"use client";

import { Loader2 } from "lucide-react";

type BrowserViewProps = {
  src: string;
  onLoad: () => void;
  isLoading: boolean;
};

export default function BrowserView({
  src,
  onLoad,
  isLoading,
}: BrowserViewProps) {
  return (
    <div className="relative h-full w-full bg-background">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <iframe
        src={src}
        onLoad={onLoad}
        className="h-full w-full border-0"
        title="Browser View"
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}
