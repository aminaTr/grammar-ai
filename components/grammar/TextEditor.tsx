"use client";

import { useState, useEffect } from "react";
import { Correction } from "@/types/correction";
import CopyButton from "../CopyButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

interface TextEditorProps {
  originalText: string;
  derivedText: string;
  corrections: Correction[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}
type TextSegment =
  | string
  | {
      correction: Correction;
    };

const TextEditor: React.FC<TextEditorProps> = ({
  originalText,
  derivedText,
  corrections,
  onAccept,
  onReject,
}) => {
  const [textSegments, setTextSegments] = useState<TextSegment[]>([]);

  useEffect(() => {
    if (!corrections.length) return;

    const segments: TextSegment[] = [];
    let lastIndex = 0;

    const sorted = [...corrections].sort((a, b) => a.startIndex - b.startIndex);

    sorted.forEach((c) => {
      if (c.startIndex > lastIndex) {
        segments.push(originalText.slice(lastIndex, c.startIndex));
      }

      if (
        c.startIndex === originalText.length &&
        lastIndex === originalText.length &&
        c.startIndex === c.endIndex
      ) {
        c.original_segment = " ";
      }
      segments.push({ correction: c });
      lastIndex = c.endIndex;
    });
    console.log("segments", segments);
    if (lastIndex < originalText.length) {
      segments.push(originalText.slice(lastIndex));
    }

    setTextSegments(segments);
  }, [originalText, corrections]);

  const getUnderlineColor = (type: string) => {
    switch (type) {
      case "spelling":
        return "underline decoration-red-500 underline-offset-4 decoration-wavy";
      case "punctuation":
        return "underline decoration-2 underline-offset-4 decoration-blue-500";
      case "grammar":
        return "underline decoration-dotted decoration-2 underline-offset-4 decoration-yellow-500";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border bg-muted p-4 space-y-2">
      <p className="text-sm text-muted-foreground mb-4 justify-between flex">
        Hover over corrections to accept/reject:
        <CopyButton textToCopy={derivedText} />
      </p>
      <div className="leading-relaxed">
        {textSegments.map((seg, idx) => {
          if (typeof seg === "string") return <span key={idx}>{seg}</span>;

          const { correction } = seg;
          const displayText =
            correction.status === "accepted"
              ? correction.corrected_segment
              : correction.original_segment ||
                (correction.status !== "rejected"
                  ? correction.corrected_segment
                  : "");

          if (correction.status !== "pending") {
            return <span key={correction.id}>{displayText}</span>;
          }
          function CorrectionContent() {
            return (
              <>
                <div className="text-xs font-semibold">
                  {correction.type.toUpperCase()}
                </div>
                <div className="text-sm">{correction.explanation}</div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAccept(correction.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(correction.id)}
                  >
                    Reject
                  </Button>
                </div>
              </>
            );
          }

          return (
            <span
              key={correction.id}
              className={`relative cursor-pointer ${getUnderlineColor(
                correction.type
              )}`}
            >
              {/* <Tooltip>
                <TooltipTrigger asChild>
                  <span>{displayText}</span>
                </TooltipTrigger>
                <TooltipContent className="w-60 bg-muted text-muted-foreground border border-border rounded-lg p-2 shadow-lg">
                  <div className="text-xs font-semibold">
                    {correction.type.toUpperCase()}
                  </div>
                  <div className="text-sm">{correction.explanation}</div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      className="btn btn-xs btn-outline btn-success"
                      onClick={() => onAccept(correction.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-xs btn-outline btn-error"
                      onClick={() => onReject(correction.id)}
                    >
                      Reject
                    </button>
                  </div>
                </TooltipContent>
              </Tooltip> */}
              {/* Desktop – hover */}
              <div className="hidden md:inline">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{displayText}</span>
                  </TooltipTrigger>
                  <TooltipContent className="w-60 bg-muted text-muted-foreground border border-border rounded-lg p-2 shadow-lg">
                    <CorrectionContent />
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Mobile – tap */}
              <div className="md:hidden inline">
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="underline decoration-dotted cursor-pointer">
                      {displayText}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <CorrectionContent />
                  </PopoverContent>
                </Popover>
              </div>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TextEditor;
