"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import TextEditor from "@/components/grammar/TextEditor";
import { Correction } from "@/types/correction";

const GrammarCheck = () => {
  const [text, setText] = useState("");
  const [activeText, setActiveText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCorrections, setActiveCorrections] = useState<Correction[]>([]);

  const handleCheck = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setActiveText("");

      const res = await fetch("/api/grammar-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to check grammar");
      }

      const data = await res.json();

      //   const data = {
      //     original_text: "Lets eat grandma",
      //     corrections: [
      //       {
      //         id: "4a1d36b2-d004-47a0-a85a-59c85b706956",
      //         type: "spelling",
      //         original_segment: "Lets",
      //         corrected_segment: "Let's",
      //         explanation: "missing apostrophe in contraction",
      //         startIndex: 0,
      //         endIndex: 4,
      //         status: "pending",
      //       },
      //       {
      //         id: "cd188f89-315f-4215-865a-f82503a33348",
      //         type: "punctuation",
      //         original_segment: "",
      //         corrected_segment: ".",
      //         explanation: "missing sentence-ending punctuation",
      //         startIndex: 16,
      //         endIndex: 16,
      //         status: "pending",
      //       },
      //       {
      //         id: "ea1baff0-4e83-4cd7-9c29-db429518457c",
      //         status: "pending",
      //         type: "punctuation",
      //         original_segment: " ",
      //         corrected_segment: ", ",
      //         startIndex: 8,
      //         endIndex: 9,
      //         explanation: "Missing comma after 'eat'",
      //       },
      //     ],
      //   };

      setActiveCorrections(data.corrections as Correction[]);
      setActiveText(data.original_text);
      toast.success("Grammar check completed");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (id: string) => {
    const correction = activeCorrections.find((c) => c.id === id);
    if (!correction) return;

    // Apply correction to activeText
    setActiveText((prev) => {
      return (
        prev.slice(0, correction.startIndex) +
        correction.corrected_segment +
        prev.slice(correction.endIndex)
      );
    });

    // Remove accepted correction from list
    setActiveCorrections((prev) => prev.filter((c) => c.id !== id));

    toast.success(
      `Accepted correction: ${correction.original_segment} → ${correction.corrected_segment}`
    );
  };

  const handleReject = (id: string) => {
    // Remove correction from list
    setActiveCorrections((prev) => prev.filter((c) => c.id !== id));

    toast.error("Correction rejected");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-6 ">
      <Card>
        <CardHeader>
          <CardTitle>Grammar Check</CardTitle>
          <CardDescription>
            Paste your text below and let AI improve clarity, grammar, and tone.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 max-width-4xl">
          {/* Input */}
          <Textarea
            placeholder="Paste or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-40"
          />

          {/* Action */}
          <div className="flex justify-end">
            <Button onClick={handleCheck} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Grammar
            </Button>
          </div>

          <TextEditor
            activeText={activeText}
            corrections={activeCorrections}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarCheck;
