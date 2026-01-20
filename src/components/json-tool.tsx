"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function JsonTool() {
  const [rawJson, setRawJson] = React.useState("");
  const [formattedJson, setFormattedJson] = React.useState("");

  const handleFormatJson = () => {
    if (!rawJson.trim()) {
      setFormattedJson("");
      return;
    }

    try {
      const parsedJson = JSON.parse(rawJson);
      setFormattedJson(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setFormattedJson(`Invalid JSON input: ${(error as Error).message}`);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-1 gap-4">
        <textarea
          className="flex-1 resize-none rounded-md border p-2 min-h-[400px]"
          placeholder="Enter raw JSON here..."
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
        />
        <textarea
          className="flex-1 resize-none rounded-md border p-2 bg-gray-50 min-h-[400px]"
          placeholder="Formatted JSON will appear here..."
          value={formattedJson}
          readOnly
        />
      </div>
      <Button onClick={handleFormatJson} className="w-full">
        Format JSON
      </Button>
    </div>
  );
}
