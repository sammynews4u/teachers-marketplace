"use client";
import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';

export default function ChatWindow({ myId, myType }: { myId: string, myType: 'teacher' | 'student' }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Fetch Conversations
  useEffect(() => {
    fetch(`/api/chat?userId=${myId}&type=${myType}`)
      .then(res => res.json())
      .then(data => {
        setConversations(data);
        if (data.length > 0) setActiveChat(data[0]);
      });
  }, [myId, myType]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [activeChat]);

  // Send Message
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

    const savedMsg = await res.json();
    
    // Optimistic Update
    const updatedChat = { ...activeChat, messages: [...activeChat.messages, savedMsg] };
    setActiveChat(updatedChat);
    setNewMessage('');
    scrollToBottom();
  };

  if (conversations.length === 0) return <div className="text-center p-10 text-gray-500">No conversations yet.</div>;

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-sm border overflow-hidden">
      
      {/* SIDEBAR (List of People) */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b font-bold text-gray-700">Messages</div>
        <div className="overflow-y-auto h-full">
          {conversations.map(conv => {
            const partner = myType === 'teacher' ? conv.student : conv.teacher;
            return (
              <div 
                key={conv.id} 
                onClick={() => setActiveChat(conv)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition ${activeChat?.id === conv.id ? 'bg-white border-l-4 border-blue-600' : ''}`}
              >
                <img src={partner.image || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.name}`} className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <p className="font-bold text-sm text-gray-900">{partner.name}</p>
                  <p className="text-xs text-gray-500 truncate w-32">Click to chat</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="w-2/3 flex flex-col">
        {activeChat && (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white">
              <span className="font-bold text-gray-800">
                {myType === 'teacher' ? activeChat.student.name : activeChat.teacher.name}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {activeChat.messages.map((msg: any) => {
                const isMe = msg.senderId === myId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t flex gap-2">
              <input 
                className="flex-1 border p-3 rounded-full outline-none focus:border-blue-500" 
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
                <Send size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}