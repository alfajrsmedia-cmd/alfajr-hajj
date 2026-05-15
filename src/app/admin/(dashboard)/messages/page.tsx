'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all')
  const [replyText, setReplyText] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => { loadMessages() }, [filter])

  async function loadMessages() {
    setLoading(true)
    let q = supabase
      .from('pilgrim_messages')
      .select(`
        id, message, admin_reply, status, created_at, replied_at,
        pilgrims(id, full_name, passport_number, groups(group_number))
      `)
      .order('created_at', { ascending: false })

    if (filter !== 'all') q = q.eq('status', filter)

    const { data } = await q
    setMessages(data || [])
    setLoading(false)
  }

  async function sendReply(msgId: number) {
    const reply = replyText[msgId]?.trim()
    if (!reply) return
    setSaving(msgId)
    await supabase
      .from('pilgrim_messages')
      .update({ admin_reply: reply, status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', msgId)
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, admin_reply: reply, status: 'replied', replied_at: new Date().toISOString() } : m
    ))
    setReplyText(prev => { const n = { ...prev }; delete n[msgId]; return n })
    setSaving(null)
  }

  const pending = messages.filter(m => m.status === 'pending').length

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">💬 رسائل الحجاج</h1>
          {pending > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5">{pending} رسالة تنتظر الرد</p>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'replied'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                filter === f
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
              }`}>
              {f === 'all' ? 'الكل' : f === 'pending' ? 'بانتظار الرد' : 'تم الرد'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full ml-3"></div>
          جاري التحميل...
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-slate-400">لا توجد رسائل</div>
      ) : (
        <div className="space-y-4">
          {messages.map(m => {
            const pilgrim = m.pilgrims as any
            const group = pilgrim?.groups as any
            return (
              <div key={m.id} className={`bg-white rounded-2xl border-2 overflow-hidden ${
                m.status === 'pending' ? 'border-amber-300' : 'border-slate-200'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900">{pilgrim?.full_name || '—'}</span>
                    {group?.group_number && (
                      <span className="mr-2 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        م {group.group_number}
                      </span>
                    )}
                    {pilgrim?.id && (
                      <a href={`/pilgrim/${pilgrim.id}`} target="_blank"
                        className="mr-2 text-xs text-emerald-600 hover:underline">
                        ← صفحة الحاج
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      m.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {m.status === 'pending' ? '⏳ بانتظار الرد' : '✓ تم الرد'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleDateString('ar-AE', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Pilgrim message */}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1 font-medium">رسالة الحاج</p>
                    <p className="text-slate-800">{m.message}</p>
                  </div>

                  {/* Existing reply */}
                  {m.admin_reply && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <p className="text-xs text-emerald-600 mb-1 font-medium">ردك</p>
                      <p className="text-emerald-900">{m.admin_reply}</p>
                      {m.replied_at && (
                        <p className="text-xs text-emerald-500 mt-1">
                          {new Date(m.replied_at).toLocaleDateString('ar-AE', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reply form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText[m.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [m.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') sendReply(m.id) }}
                      placeholder={m.admin_reply ? 'تعديل الرد...' : 'اكتب ردك هنا...'}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={() => sendReply(m.id)}
                      disabled={saving === m.id || !replyText[m.id]?.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-medium transition"
                    >
                      {saving === m.id ? '...' : 'رد'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
