import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function ChatsView() {
  const { chats, replyToChat } = useAdmin();
  const [selected, setSelected] = React.useState(chats[0] || null);
  const [reply, setReply] = React.useState('');

  React.useEffect(() => {
    if (!selected && chats.length) setSelected(chats[0]);
  }, [chats, selected]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Customer Chats</h2>
        <p className="text-xs text-slate-500">Receive customer questions and send direct replies.</p>
      </div>

      <div className="grid min-h-[520px] overflow-hidden rounded-2xl border bg-white lg:grid-cols-[320px_1fr]">
        <div className="border-r bg-slate-50">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setSelected(chat);
                setReply(chat.reply || '');
              }}
              className={`w-full border-b p-4 text-left ${selected?.id === chat.id ? 'bg-red-50' : 'hover:bg-white'}`}
            >
              <div className="flex justify-between gap-2">
                <p className="text-xs font-black">{chat.customerName}</p>
                <span className={`text-[10px] font-bold ${chat.status === 'Open' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {chat.status}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500">{chat.message}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {selected ? (
            <>
              <div className="border-b p-5">
                <h3 className="font-black">{selected.customerName}</h3>
                <p className="text-xs text-slate-500">
                  {selected.customerEmail} · {selected.date}
                </p>
              </div>

              <div className="flex-1 space-y-4 p-5">
                <div className="max-w-xl rounded-2xl rounded-tl-sm bg-slate-100 p-4 text-sm">
                  {selected.message}
                </div>
                {selected.reply && (
                  <div className="ml-auto max-w-xl rounded-2xl rounded-tr-sm bg-red-600 p-4 text-sm text-white">
                    {selected.reply}
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reply.trim()) return;
                  replyToChat(selected.id, reply.trim());
                  setSelected({ ...selected, reply: reply.trim(), status: 'Replied' });
                }}
                className="flex gap-2 border-t p-4"
              >
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type reply..."
                  className="min-h-12 flex-1 rounded-xl border p-3 text-xs outline-none focus:border-red-500"
                />
                <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white">
                  <Send size={15} /> Reply
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-slate-400">
              <MessageSquare className="mx-auto mb-2" />
              No chats
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
