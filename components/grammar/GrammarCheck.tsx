"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import ModelSelect from "./ModelSelect";
import { useMemo } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import TextEditor from "@/components/grammar/TextEditor";
import { Correction } from "@/types/correction";
import { applyAcceptedCorrections } from "@/lib/applyCorrections";
import { useAuth } from "@/contexts/AuthContext";

const GrammarCheck = () => {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-120b");
  const [loading, setLoading] = useState(false);
  const [activeCorrections, setActiveCorrections] = useState<Correction[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const char_limit = 100;
  const { currentUser, refreshCredits } = useAuth();
  const derivedText = useMemo(
    () => applyAcceptedCorrections(text, activeCorrections),
    [text, activeCorrections]
  );

  const handleCheck = async () => {
    if (!text.trim()) return;
    if (text.length > char_limit) {
      toast.error(
        `Text is too long. Please enter text under ${char_limit} characters.`
      );
      return;
    }
    try {
      setLoading(true);

      const res = await fetch("/api/check-grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model: selectedModel }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.error || "Something went wrong");
      }

      setActiveCorrections(data.corrections as Correction[]);
      setSessionId(data.session_id);

      if (!data.corrections || data.corrections.length === 0) {
        return toast.success("No issues found! Your text looks great.");
      }
      toast.success(data.message || "Grammar check completed");
      console.log("activeCorrections", activeCorrections);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      await refreshCredits();
    }
  };

  const handleInputChange = (text: string) => {
    if (text.length > char_limit) {
      toast.error(
        `Text is too long. Please enter text under ${char_limit} characters.`,
        { id: "character-limit-exceeded" }
      );
      return;
    }
    setText(text);
    setActiveCorrections([]);
  };

  const handleAccept = (id: string) => {
    const correction = activeCorrections.find((c) => c.id === id);
    if (!correction) return;

    setActiveCorrections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted" } : c))
    );
    updateCorrectionInDB(id, "accepted");

    toast.success(
      `Accepted correction: ${correction.original_segment} → ${correction.corrected_segment}`
    );
  };

  const handleReject = (id: string) => {
    setActiveCorrections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c))
    );
    updateCorrectionInDB(id, "rejected");
    toast.error("Correction rejected");
  };

  const updateCorrectionInDB = async (
    correctionId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      const updatedCorrections = activeCorrections.map((c) =>
        c.id === correctionId ? { ...c, status } : c
      );

      const correctedText = applyAcceptedCorrections(text, updatedCorrections);

      const res = await fetch(`/api/update-grammar-history/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctionId,
          status,
          corrected_text: correctedText,
        }),
      });

      if (!res.ok) {
        console.error("Failed to update correction in DB");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-6 ">
      <div className="flex justify-center ">
        <p className="text-sm text-muted-foreground font-extrabold leading-relaxed tracking-wide py-4">
          Type in the text you want to check for grammar, spelling or
          punctuation mistakes and let the AI do the rest of the job for you✨
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grammar Check</CardTitle>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardDescription className="sm:max-w-[70%]">
              Paste your text below and let AI improve clarity, grammar, and
              tone.
            </CardDescription>

            <div className="w-full sm:w-auto">
              <ModelSelect
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                user={currentUser}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 max-width-4xl">
          {/* Input */}
          <Textarea
            placeholder="Paste or type your text here..."
            onChange={(e) => handleInputChange(e.target.value)}
            value={text}
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
            originalText={text}
            derivedText={derivedText}
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

// dummy data for testing
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
