"use client";
import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';

export default function ChatWindow({ myId, myType }: { myId: string, myType: 'teacher' | 'student' }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Fetch Conversations
  const fetchConversations = () => {
    fetch(`/api/chat?userId=${myId}&type=${myType}`)
      .then(res => res.json())
      .then(data => {
        setConversations(data);
        // If we have data and no active chat, default to first
        if (data.length > 0 && !activeChat) {
          setActiveChat(data[0]);
        }
        // If we have an active chat, update it with new messages
        if (activeChat) {
            const found = data.find((c:any) => c.id === activeChat.id);
            if(found) setActiveChat(found);
        }
      });
  };

  useEffect(() => {
    fetchConversations();
    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [myId, myType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [activeChat]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const receiver = myType === 'teacher' ? activeChat.student : activeChat.teacher;

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        senderId: myId,
        senderType: myType,
        receiverId: receiver.id,
        content: newMessage
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if(res.ok) {
        setNewMessage('');
        fetchConversations(); // Refresh immediately
        scrollToBottom();
    }
  };

  if (conversations.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border">
        <User size={48} className="mb-2 text-gray-300"/>
        <p>No conversations yet.</p>
        <p className="text-xs mt-1">Start a chat from the Classroom/Instructors tab.</p>
    </div>
  );

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b font-bold text-gray-700 bg-white">Messages</div>
        <div className="overflow-y-auto flex-1">
          {conversations.map(conv => {
            const partner = myType === 'teacher' ? conv.student : conv.teacher;
            return (
              <div 
                key={conv.id} 
                onClick={() => setActiveChat(conv)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition border-b border-gray-100 ${activeChat?.id === conv.id ? 'bg-white border-l-4 border-l-blue-600' : ''}`}
              >
                <img src={partner?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.name}`} className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-gray-900 truncate">{partner?.name}</p>
                  <p className="text-xs text-gray-500 truncate">Click to read...</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
              <span className="font-bold text-gray-800">
                {myType === 'teacher' ? activeChat.student.name : activeChat.teacher.name}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {activeChat.messages.length === 0 && <p className="text-center text-xs text-gray-400 mt-10">Start the conversation...</p>}
              {activeChat.messages.map((msg: any) => {
                const isMe = msg.senderId === myId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t flex gap-2">
              <input 
                className="flex-1 border p-3 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition" 
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-md">
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>
        )}
      </div>
    </div>
  );
}