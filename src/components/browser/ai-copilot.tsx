"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Loader2, Sparkles, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { summarizeAndChat } from "@/ai/flows/summarize-and-chat";
import type { Message } from "@/ai/flows/summarize-and-chat.types";


type AiCopilotProps = {
  pageContent: string;
  pageVersion: number;
};

export default function AiCopilot({ pageContent, pageVersion }: AiCopilotProps) {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageContent) {
      const getSummary = async () => {
        setIsSummarizing(true);
        setSummary('');
        setChatHistory([]); // Reset chat on new page
        try {
          const result = await summarizeAndChat({
            content: pageContent,
            question: "Summarize this content in bullet points.",
            history: [],
          });
          setSummary(result.answer);
        } catch (error) {
          console.error("AI summarization failed:", error);
          setSummary("Sorry, I couldn't summarize this page.");
        } finally {
          setIsSummarizing(false);
        }
      };
      getSummary();
    } else {
      setSummary('');
      setChatHistory([]);
    }
  }, [pageContent, pageVersion]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const newHistory: Message[] = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newHistory);
    setIsLoading(true);
    setQuestion('');

    try {
      const result = await summarizeAndChat({
        content: pageContent,
        question: question,
        history: newHistory.slice(0, -1), // Send history before the new question
      });
      setChatHistory([...newHistory, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      console.error("AI chat failed:", error);
      setChatHistory([...newHistory, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <h3 className="flex-shrink-0 font-semibold text-foreground">AI Copilot</h3>
      
      {isSummarizing && (
        <div className="flex items-center justify-center rounded-lg border bg-background p-4 text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
        </div>
      )}

      {summary && !isSummarizing && (
        <Card className="bg-background/50 flex-shrink-0">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> Page Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-xs text-foreground/80">
            {summary}
          </CardContent>
        </Card>
      )}

      {!pageContent && !isSummarizing && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center">
           <Bot className="h-8 w-8 text-muted-foreground" />
           <p className="mt-2 text-sm text-muted-foreground">Page summary and chat will appear here once a page is loaded.</p>
       </div>
      )}
      
      {pageContent && (
        <>
          <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-background/30 p-4">
            {chatHistory.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && <Bot className="h-5 w-5 flex-shrink-0 text-primary" />}
                <div className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content}
                </div>
                {message.role === 'user' && <User className="h-5 w-5 flex-shrink-0" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="rounded-lg bg-muted p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <Input
              placeholder="Ask a follow-up..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAskQuestion()}
              disabled={isLoading || isSummarizing}
              className="bg-background"
            />
            <Button onClick={handleAskQuestion} disabled={isLoading || isSummarizing || !question.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
