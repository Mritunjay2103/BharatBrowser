"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiCopilotGenerate } from "@/ai/flows/ai-copilot-generate";

export default function AiCopilot() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse("");
    try {
      const result = await aiCopilotGenerate({ prompt });
      setResponse(result.response);
    } catch (error) {
      console.error("AI generation failed:", error);
      setResponse("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">AI Copilot</h3>
      <div className="grid w-full gap-2">
        <Textarea
          placeholder="Ask me anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-background"
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border bg-background p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && response && (
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Bot className="mr-2 h-5 w-5" /> AI Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">{response}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !response && (
         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Your AI-generated content will appear here.</p>
        </div>
      )}
    </div>
  );
}
