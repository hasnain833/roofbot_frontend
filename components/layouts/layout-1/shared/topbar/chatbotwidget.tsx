"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  companyName?: string;
  botToken?: string;
  isPublic?: boolean;
};

export default function ChatbotWidget({ companyName, botToken }: Props) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: `Hi 👋 I'm ${companyName || "your"} assistant. How can I help you today?` },
  ]);
  const [input, setInput] = useState("");
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [displayCompanyName, setDisplayCompanyName] = useState(companyName || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIframeUrl(`${window.location.origin}/yourchatbot/${botToken}`);
    }
  }, [botToken]);

  const isIframe =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/yourchatbot/");

  const tokenFromUrl = isIframe
    ? window.location.pathname.split("/yourchatbot/")[1]
    : botToken;

  const fetchSessionUrl = isIframe
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/session-info-iframe?token=${tokenFromUrl}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/session-info`;

  useEffect(() => {
    const fetchSession = async () => {
      // Don't fetch if we're in the dashboard and token isn't ready yet
      if (!isIframe && !token) return;

      try {
        const res = await fetch(fetchSessionUrl, {
          headers: isIframe ? {} : { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        if (!res.ok) {
          console.error("Session info fetch failed:", res.status);
          return;
        }

        const data = await res.json();
        setAgentId(data.agent_id);
        setSessionId(data.session_id);
        setIpAddress(data.ip_address);
        if (data.company) {
          setDisplayCompanyName(data.company);
        }

        setMessages([
          {
            sender: "bot",
            text: `Hi 👋 I'm ${data.company || displayCompanyName || "your"} assistant. How can I help you today?`,
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch session info:", err);
      }
    };

    fetchSession();
  }, [token, isIframe, fetchSessionUrl]);

  const sendMessageUrl = isIframe
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/message-public`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/message`;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    if (!agentId || !sessionId) {
      console.warn("Cannot send message: agentId or sessionId missing.");
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Chatbot is still initializing. Please wait a moment... 🤖" },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(sendMessageUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(isIframe ? {} : { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          agent_id: agentId,
          session_id: sessionId,
          message: input,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || data.message || data.error || "No response received 🤖" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to chatbot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border rounded-2xl overflow-hidden">
      <CardHeader className="bg-black text-white text-center font-semibold py-3 relative">
        {displayCompanyName ? `${displayCompanyName} Chatbot` : "Company Chatbot"}
      </CardHeader>

      <CardContent className="flex flex-col h-[500px] justify-between p-0 relative">
        {/* Initialization Overlay */}
        {(!agentId || !sessionId) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[2px] transition-all duration-500">
            <div className="p-4 rounded-xl animate-in fade-in zoom-in duration-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 ${(!agentId || !sessionId) ? 'opacity-50' : ''}`}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 rounded-2xl text-sm shadow whitespace-pre-wrap ${msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-3 rounded-2xl shadow flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center border-t p-3 bg-white">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={(!agentId || !sessionId) ? "Waiting for assistant..." : "Type a message..."}
            className="flex-1 mr-2"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading || !agentId || !sessionId}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !agentId || !sessionId}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[70px]"
          >
            Send
          </Button>
        </div>

        {!isIframe && (
          <div className="mt-4 p-4 bg-gray-50 border rounded relative">
            <p className="text-sm mb-2">Embed this chatbot on any website:</p>

            <pre
              className="bg-gray-200 p-2 rounded text-sm overflow-x-auto cursor-pointer"
              onClick={handleCopy}
              title="Click to copy"
            >
              {`<iframe src="${iframeUrl}" width="350" height="500" style="border:none;"></iframe>`}
            </pre>

            {copied && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow-lg animate-fade-in-out">
                Copied!
              </div>
            )}

            <style jsx>{`
              @keyframes fade-in-out {
                0% {
                  opacity: 0;
                  transform: translateY(-5px);
                }
                10% {
                  opacity: 1;
                  transform: translateY(0);
                }
                90% {
                  opacity: 1;
                  transform: translateY(0);
                }
                100% {
                  opacity: 0;
                  transform: translateY(-5px);
                }
              }
              .animate-fade-in-out {
                animation: fade-in-out 2s ease forwards;
              }
            `}</style>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
