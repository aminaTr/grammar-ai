"use client";

import { useState, useEffect } from "react";
import { Correction } from "@/types/correction";
import CopyButton from "../CopyButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface TextEditorProps {
  activeText: string;
  corrections: Correction[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  activeText,
  corrections,
  onAccept,
  onReject,
}) => {
  const [textSegments, setTextSegments] = useState<
    (string | { correction: Correction; text: string })[]
  >([]);

  useEffect(() => {
    if (!corrections.length) {
      setTextSegments([activeText]);
      return;
    }

    const segments: (string | { correction: Correction; text: string })[] = [];
    let lastIndex = 0;

    // Sort corrections by startIndex to handle sequentially
    const sortedCorrections = [...corrections].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedCorrections.forEach((c) => {
      if (c.startIndex > lastIndex) {
        segments.push(activeText.slice(lastIndex, c.startIndex));
      }
      segments.push({
        correction: c,
        text: activeText.slice(c.startIndex, c.endIndex),
      });
      lastIndex = c.endIndex;
    });

    if (lastIndex < activeText.length) {
      segments.push(activeText.slice(lastIndex));
    }

    setTextSegments(segments);
  }, [activeText, corrections]);

  const getUnderlineColor = (type: string) => {
    switch (type) {
      case "spelling":
        return "underline decoration-red-500";
      case "punctuation":
        return "underline decoration-blue-500";
      case "grammar":
        return "underline decoration-yellow-500";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border bg-muted p-4 space-y-2">
      <p className="text-sm text-muted-foreground mb-4 justify-between flex">
        Hover over corrections to accept/reject:
        <CopyButton textToCopy={activeText} />
      </p>
      <div className="leading-relaxed">
        {textSegments.map((seg, idx) => {
          if (typeof seg === "string") return <span key={idx}>{seg}</span>;

          const { correction, text } = seg;
          return (
            <span
              key={correction.id}
              className={`relative cursor-pointer ${getUnderlineColor(
                correction.type
              )}`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{text}</span>
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
              </Tooltip>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TextEditor;
