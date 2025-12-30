"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Correction } from "@/types/correction";

interface HistoryItem {
  id: string;
  input_text: string;
  corrected_text: string;
  corrections: Correction[];
  created_at: string;
}

interface GrammarHistoryProps {
  history: HistoryItem[];
}

const ITEMS_PER_PAGE = 5;

export default function GrammarHistory({ history }: GrammarHistoryProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const paginatedHistory = history.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background py-2 px-4 sm:px-6 lg:px-12">
      <p className="py-4 text-center text-2xl font-bold">Grammar History</p>
      <div className=" w-full">
        <div className="grid gap-2">
          {paginatedHistory.map((item) => (
            <Card key={item.id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm sm:text-base">
                <p>
                  <strong>Input:</strong> {item.input_text}
                </p>

                {item.corrections && item.corrections.length > 0 && (
                  <div className="mt-2">
                    <strong>Suggested Corrections:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {item.corrections.map((c) => (
                        <li key={c.id} className="text-xs sm:text-sm">
                          <span className="font-semibold">
                            {c.original_segment}
                          </span>{" "}
                          →{" "}
                          <span className="text-green-600">
                            {c.corrected_segment}
                          </span>
                          {c.explanation && (
                            <span className="text-muted-foreground ml-1">
                              ({c.explanation})
                            </span>
                          )}
                          {c.status &&
                            (c.status === "accepted" ? (
                              <span className="ml-2 text-green-500 font-medium">
                                [{c.status}]
                              </span>
                            ) : c.status === "rejected" ? (
                              <span className="ml-2 text-red-500 font-medium">
                                [{c.status}]
                              </span>
                            ) : (
                              <span className="ml-2 text-blue-500 font-medium">
                                [{c.status}]
                              </span>
                            ))}
                        </li>
                      ))}
                      <p>
                        <strong>Final Text:</strong>{" "}
                        {(item.corrected_text || "").trim() ||
                          "No corrections accepted."}
                      </p>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
