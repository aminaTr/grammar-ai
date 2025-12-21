"use client";

import { useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Text copied to clipboard ✅");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="ml-2 p-1 rounded hover:text-muted-foreground transition-colors"
          aria-label="Copy text"
        >
          {copied ? (
            <ClipboardCheck className="w-4 h-4" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-muted text-muted-foreground border border-border rounded-lg p-2 shadow-lg">
        {copied ? "Copied!" : "Copy to clipboard"}
      </TooltipContent>
    </Tooltip>
  );
};

export default CopyButton;
