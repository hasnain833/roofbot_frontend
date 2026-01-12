"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ChatbotWidget from "@/components/layouts/layout-1/shared/topbar/chatbotwidget";

export default function ChatbotPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const companyName = searchParams.get("company") || "Company";
  const botToken = searchParams.get("token") || ""; 

  return (
    <div className="container max-w-md mx-auto py-10">
      <Button
        onClick={() => router.back()}
        className="mb-4 bg-gray-800 text-white hover:bg-black"
      >
        ←
      </Button>
      <ChatbotWidget companyName={companyName} botToken={botToken} 
    isPublic={false} />
    </div>
  );
}
