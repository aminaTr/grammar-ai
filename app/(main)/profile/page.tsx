"use client";

import { useEffect, useState } from "react";
import { getGrammarHistory } from "@/lib/grammar/history";
import GrammarHistory from "@/components/grammar/GrammarHistory";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getGrammarHistory().then(setHistory);
  }, []);

  return (
    <div className="min-h-screen bg-background py-24">
      <GrammarHistory history={history} />
    </div>
  );
}
