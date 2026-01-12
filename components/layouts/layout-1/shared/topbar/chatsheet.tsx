'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCheck} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ChatSheetProps {
  trigger: ReactNode;
  leadId: number;
  leadPhone: string;
}

interface Message {
  id?: number;
  text: string;
  out: boolean;
  status?: string;
  created_at?: string;
}

export function ChatSheet({ trigger, leadId, leadPhone }: ChatSheetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSummary, setChatSummary] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchMessages = async () => {
    if (!leadId || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/twilio/messages/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
    }
  };

const generateChatSummary = async () => {
  if (!token) return;

  setSummaryLoading(true);
  setChatSummary("");

  try {
    const res = await fetch(`${API_URL}/api/lead/summarize-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lead_id: leadId }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'OpenAI API key not configured for this tenant') {
        setChatSummary(
          "⚠️ OpenAI API key is not configured.\n\nPlease add your API key in Integrations to enable chat summaries."
        );
      } else {
        setChatSummary(data.message || 'Failed to generate chat summary.');
      }

      setSummaryOpen(true);
      return;
    }

    setChatSummary(data.summary);
    setSummaryOpen(true);
  } catch (err) {
    setChatSummary("Network error while generating chat summary.");
    setSummaryOpen(true);
  } finally {
    setSummaryLoading(false);
  }
};

  useEffect(() => {
    fetchMessages();
  }, [leadId, token]);

  useEffect(() => {
    if (!leadId || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/twilio/messages/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [leadId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !token) return;
    setLoading(true);

    try {
      let formattedNumber = leadPhone.trim();
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+92' + formattedNumber.slice(1);
      }

      const res = await fetch(`${API_URL}/api/twilio/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: formattedNumber,
          message: input,
          lead_id: leadId,
          human:true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Failed to send: ${data.error || 'Unknown error'}`);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { text: input, out: true, status: data.status || 'sent' },
      ]);
      setInput('');
    } catch (e) {
      console.error('❌ Network error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Sheet */}
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>

        <SheetContent className="p-0 sm:w-[450px] rounded-lg">
          <SheetHeader>
            <div className="flex items-center justify-between p-3 border-b">
              <SheetTitle>Chat</SheetTitle>
            </div>
          </SheetHeader>

          {/* Messages */}
          <SheetBody className="scrollable-y-auto grow space-y-3.5 p-4">
            {messages.length > 0 ? (
              messages.map((m, i) =>
                m.out ? (
                  <div key={i} className="flex justify-end gap-3">
                    <div className="flex flex-col items-end">
                      <div className="bg-primary text-white text-sm font-medium p-3 rounded-lg shadow-xs">
                        {m.text}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          {m.status || 'sent'}
                        </span>
                        <CheckCheck className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <Avatar className="size-8">
                      <AvatarImage
                        src={toAbsoluteUrl('/media/avatars/300-2.png')}
                      />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={toAbsoluteUrl('/media/avatars/300-4.png')}
                      />
                      <AvatarFallback>LD</AvatarFallback>
                    </Avatar>
                    <div className="bg-accent/50 text-sm font-medium p-3 rounded-lg shadow-xs">
                      {m.text}
                    </div>
                  </div>
                ),
              )
            ) : (
              <p className="text-center text-sm text-gray-500">
                No messages yet.
              </p>
            )}

            <div ref={messagesEndRef} />
          </SheetBody>

          {/* Input + Buttons */}
          <SheetFooter className="p-4 border-t flex gap-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a message..."
              disabled={loading}
            />

            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? 'Sending...' : 'Send'}
            </Button>

            {/* Chat Summary Button Same Style */}
            <Button onClick={generateChatSummary} disabled={summaryLoading}>
              {summaryLoading ? 'Generating...' : 'Chat Summary'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Chat Summary Dialog */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Chat Summary
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-700 whitespace-pre-line">
            {chatSummary}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
