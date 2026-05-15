"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PilgrimMessages({
  pilgrimId,
  initialMessages,
}: {
  pilgrimId: number;
  initialMessages: any[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("pilgrim_messages")
      .insert({ pilgrim_id: pilgrimId, message: text.trim() })
      .select()
      .single();
    if (data) {
      setMessages([data, ...messages]);
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }
    setSending(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <p className="font-bold text-slate-800 text-sm">💬 ملاحظات للإدارة</p>
        <p className="text-xs text-slate-500 mt-0.5">سيتم الرد عليك في أقرب وقت</p>
      </div>
      <div className="p-4">
        <form onSubmit={sendMessage} className="space-y-2 mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب ملاحظتك أو استفسارك هنا..."
            rows={3}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-400 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-2.5 rounded-xl text-sm font-bold transition"
          >
            {sending ? "جاري الإرسال..." : sent ? "✓ تم الإرسال" : "إرسال الملاحظة"}
          </button>
        </form>

        {messages.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-medium">الرسائل السابقة</p>
            {messages.map((m: any) => (
              <div key={m.id} className="space-y-2">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-sm text-slate-800">{m.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleDateString("ar-AE", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                {m.admin_reply && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mr-6">
                    <p className="text-xs text-emerald-600 font-bold mb-1">رد الإدارة</p>
                    <p className="text-sm text-emerald-900">{m.admin_reply}</p>
                    {m.replied_at && (
                      <p className="text-xs text-emerald-500 mt-1">
                        {new Date(m.replied_at).toLocaleDateString("ar-AE", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
