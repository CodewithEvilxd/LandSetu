import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  minHeight?: string | number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading platform data...", 
  minHeight = "240px" 
}) => {
  return (
    <div 
      className="loading-container" 
      style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
    >
      <div className="loading-spinner-wrapper">
        <Loader2 className="loading-spinner" size={28} />
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
};
