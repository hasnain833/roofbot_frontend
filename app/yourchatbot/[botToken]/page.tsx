"use client";

import ChatbotWidget from "@/components/layouts/layout-1/shared/topbar/chatbotwidget";

interface Params { params: { token: string } }

export default function PublicChatbot({ params }: Params) {
  const { token } = params;

  return (
    <div className="container max-w-md mx-auto py-5">
      <ChatbotWidget botToken={token} isPublic={true} />
    </div>
  );
}
