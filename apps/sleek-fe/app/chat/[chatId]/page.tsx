"use client"
import React from "react";
import Chat from "../../../components/ui/Chat";

export default function Page({ params }: { params: { chatId: string } }) {
  const { chatId } = params;
  return (
    <div style={{ padding: 16 }}>
      <Chat chatId={chatId} />
    </div>
  );
}
