import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquare, User, Send, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../lib/api';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ['chat', 'sessions'],
    queryFn: () => chatApi.sessions({ status: 'active' }),
    refetchInterval: 5000,
  });

  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['chat', 'messages', selectedSession],
    queryFn: () => chatApi.messages(selectedSession!),
    enabled: !!selectedSession,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(selectedSession!, content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedSession] });
    },
    onError: () => toast.error('Senden fehlgeschlagen'),
  });

  const takeOverMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.takeOver(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      toast.success('Chat übernommen');
    },
  });

  const closeMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.close(sessionId),
    onSuccess: () => {
      setSelectedSession(null);
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      toast.success('Chat geschlossen');
    },
  });

  const sessions = sessionsData?.data?.data || [];
  const messages = messagesData?.data?.messages || [];
  const currentSession = messagesData?.data?.session;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pearl">Live Chat</h1>
        <p className="text-warm-gray text-sm">{sessions.filter((s: any) => s.status === 'waiting').length} wartende Chats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Sessions List */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-navy-light">
            <h2 className="font-medium text-pearl">Chat Sessions</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {loadingSessions ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-navy-light rounded animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-warm-gray">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Keine aktiven Chats</p>
              </div>
            ) : (
              sessions.map((session: any) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`w-full p-4 text-left border-b border-navy-light hover:bg-navy-light/50 transition-colors ${
                    selectedSession === session.id ? 'bg-navy-light' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-pearl">
                      {session.user?.fullName || 'Gast'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      session.status === 'waiting' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {session.status === 'waiting' ? 'Wartet' : 'Aktiv'}
                    </span>
                  </div>
                  <p className="text-sm text-warm-gray truncate">
                    {session.lastMessage || 'Keine Nachricht'}
                  </p>
                  {session.unreadCount > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-sunset-orange text-navy-deep text-xs rounded-full">
                      {session.unreadCount} ungelesen
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-warm-gray">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Wähle einen Chat aus</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-navy-light flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center">
                    <User className="w-5 h-5 text-warm-gray" />
                  </div>
                  <div>
                    <p className="font-medium text-pearl">
                      {messagesData?.data?.session?.user?.fullName || 'Gast'}
                    </p>
                    <p className="text-xs text-warm-gray">
                      @{messagesData?.data?.session?.user?.username}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentSession?.status === 'waiting' && (
                    <button
                      onClick={() => takeOverMutation.mutate(selectedSession)}
                      className="btn-primary py-1"
                    >
                      Übernehmen
                    </button>
                  )}
                  <button
                    onClick={() => closeMutation.mutate(selectedSession)}
                    className="btn-danger py-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-navy-light rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.user?.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.isBot
                          ? 'bg-navy-light text-warm-gray'
                          : msg.user?.isAdmin
                          ? 'bg-sunset-orange text-navy-deep'
                          : 'bg-navy-light text-pearl'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-navy-light">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nachricht schreiben..."
                    className="input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || sendMutation.isPending}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}



