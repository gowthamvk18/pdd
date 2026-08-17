import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Video, Star, X, Calendar, CheckCircle, Check, CheckCheck } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { NotificationBell } from '../components/NotificationBell';

export const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [connections, setConnections] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [videoCallActive, setVideoCallActive] = useState(false);
  
  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Session State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      api.getActiveConnections(user.id)
        .then(data => {
          setConnections(data);
          if (data.length > 0) {
            setActiveChat(data[0]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (!activeChat || !user) return;
    setVideoCallActive(false);

    // Fetch initial messages
    api.getMessages(activeChat.id)
      .then(msgs => {
        setMessages(msgs);
        // Mark as read
        if (user) api.markMessagesAsRead(activeChat.id, user.id);
      })
      .catch(console.error);

    // Fetch active session
    api.getUserSessions(user.id)
      .then(sessions => {
        const matchSession = sessions.find((s: any) => s.match_id === activeChat.id && (s.status === 'proposed' || s.status === 'confirmed'));
        setActiveSession(matchSession || null);
      })
      .catch(console.error);

    // Subscribe to new messages
    const channel = api.subscribeToMessages(activeChat.id, (message) => {
      setMessages(prev => [...prev, message]);
      // If message is from other party and I am active in this chat, mark as read
      if (message.sender_id !== user.id) {
        api.markMessagesAsRead(activeChat.id, user.id);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChat || !newMessage.trim()) return;

    setSending(true);
    try {
      await api.sendMessage(activeChat.id, user.id, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleProposeSession = async (scheduledAt: string) => {
    if (!user || !activeChat) return;
    setSubmittingSession(true);
    try {
      const session = await api.proposeSession(activeChat.id, user.id, activeChat.profile.id, scheduledAt);
      setActiveSession(session);
      setSessionModalOpen(false);
      alert("Session proposal sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to propose session");
    } finally {
      setSubmittingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden text-foreground">
      
      {/* Sidebar - Connections */}
      <div className={`w-full md:w-80 bg-card border-r border-border flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#8b7355]/10 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Messages</h1>
          <NotificationBell />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {connections.length === 0 ? (
            <div className="p-8 text-center text-foreground/50">
              <p>No active connections yet.</p>
              <button onClick={() => navigate('/explore')} className="mt-4 text-primary font-bold hover:underline">
                Find people
              </button>
            </div>
          ) : (
            connections.map(conn => (
              <button 
                key={conn.id}
                onClick={() => setActiveChat(conn)}
                className={`w-full text-left p-4 border-b border-border flex items-center gap-3 transition-colors ${activeChat?.id === conn.id ? 'bg-primary/5' : 'hover:bg-muted'}`}
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                  {conn.profile.avatar_url ? (
                    <img src={conn.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    conn.profile.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{conn.profile.full_name}</h3>
                  <p className="text-sm text-foreground/50 truncate">Connected {new Date(conn.created_at).toLocaleDateString()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full bg-background ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-card p-4 border-b border-border flex items-center gap-4 shadow-sm z-10">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-muted rounded-full text-foreground/60">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {activeChat.profile.avatar_url ? (
                  <img src={activeChat.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  activeChat.profile.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{activeChat.profile.full_name}</h2>
                <p className="text-xs text-foreground/50">{activeChat.profile.location}</p>
              </div>
              <button 
                onClick={() => setReviewModalOpen(true)}
                className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-400 hover:text-white rounded-full transition-colors flex items-center justify-center"
                title="Leave Review"
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
              <button 
                onClick={() => setSessionModalOpen(true)}
                className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors flex items-center justify-center"
                title="Schedule Session"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setVideoCallActive(true)}
                className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors flex items-center justify-center"
                title="Start Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>

            {videoCallActive ? (
              <div className="flex-1 flex flex-col bg-[#111111]">
                <JitsiMeeting
                  roomName={`SkillSync_Session_${activeChat.id}`}
                  configOverwrite={{
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                  }}
                  userInfo={{
                    displayName: user?.user_metadata?.full_name || user?.email || 'SkillSync User',
                    email: user?.email || ''
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.flex = '1';
                  }}
                  onReadyToClose={() => setVideoCallActive(false)}
                />
              </div>
            ) : (
              <>
                {/* Active Session Banner */}
                {activeSession && (
                  <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between shadow-sm animate-fade-up">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSession.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          {activeSession.status === 'confirmed' ? 'Confirmed Session' : 'Proposed Session'}
                        </p>
                        <p className="text-sm font-bold">
                          {new Date(activeSession.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(activeSession.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activeSession.status === 'proposed' && activeSession.receiver_id === user?.id && (
                        <>
                          <button 
                            onClick={async () => {
                              try {
                                await api.updateSessionStatus(activeSession.id, 'confirmed');
                                setActiveSession({ ...activeSession, status: 'confirmed' });
                                alert("Session confirmed!");
                              } catch (e) { alert("Failed to confirm"); }
                            }}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:opacity-90"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                await api.updateSessionStatus(activeSession.id, 'cancelled');
                                setActiveSession(null);
                              } catch (e) { alert("Failed to cancel"); }
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {activeSession.status === 'confirmed' && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle className="w-4 h-4" /> Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-sm mb-4">
                    <span className="text-2xl">👋</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">Say hello!</h3>
                  <p className="text-foreground/60 max-w-sm">
                    This is the beginning of your conversation with {activeChat.profile.full_name}. Introduce yourself and what you're hoping to learn or teach!
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 ${isMine ? 'bg-primary text-white rounded-tr-sm' : 'bg-card border border-border shadow-sm rounded-tl-sm'}`}>
                        <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <p className={`text-[10px] ${isMine ? 'text-white/70' : 'text-foreground/40'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isMine && (
                            <div className="text-white/70">
                              {msg.is_read ? (
                                <CheckCheck className="w-3 h-3 text-blue-200" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-card p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 py-3 px-4 bg-muted border border-border rounded-xl focus:border-primary focus:bg-card outline-none transition-all text-foreground placeholder:text-foreground/40"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        )}
        </>
      ) : (
          <div className="h-full flex items-center justify-center text-foreground/50 hidden md:flex">
            Select a connection to start messaging
          </div>
        )}
      </div>

      {reviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setReviewModalOpen(false)} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2">Leave a Review</h2>
            <p className="text-foreground/60 mb-6">How was your experience with {activeChat?.profile.full_name}?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setReviewRating(star)}
                  className={`p-2 transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-muted-foreground'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>

            <textarea 
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Leave a comment (optional)..."
              className="w-full p-4 bg-muted rounded-xl border border-border focus:border-primary outline-none resize-none h-32 mb-6"
            ></textarea>

            <button 
              onClick={async () => {
                if (!reviewRating || !user || !activeChat) return alert('Please select a rating');
                setSubmittingReview(true);
                try {
                  await api.submitReview(activeChat.id, user.id, activeChat.profile.id, reviewRating, reviewComment);
                  setReviewModalOpen(false);
                  setReviewRating(0);
                  setReviewComment('');
                  alert('Review submitted successfully!');
                } catch (e: any) {
                  alert("Failed to submit review. You may have already reviewed this user.");
                } finally {
                  setSubmittingReview(false);
                }
              }}
              disabled={submittingReview || !reviewRating}
              className="w-full py-4 bg-primary text-background rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      <ScheduleModal 
        isOpen={sessionModalOpen} 
        onClose={() => setSessionModalOpen(false)} 
        onSchedule={handleProposeSession}
        loading={submittingSession}
        otherName={activeChat?.profile.full_name}
      />
    </div>
  );
};

// --- Modals ---

const ScheduleModal = ({ isOpen, onClose, onSchedule, loading, otherName }: any) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-2">Schedule Session</h2>
        <p className="text-foreground/60 mb-6">Propose a time to meet with {otherName}.</p>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm font-bold text-foreground/50 block mb-2 uppercase tracking-wider">Select Date</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary text-foreground" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-foreground/50 block mb-2 uppercase tracking-wider">Select Time</label>
            <input 
              type="time" 
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary text-foreground" 
            />
          </div>
        </div>

        <button 
          onClick={() => onSchedule(`${date}T${time}`)}
          disabled={loading || !date || !time}
          className="w-full py-4 bg-primary text-background rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Propose Session'}
        </button>
      </div>
    </div>
  );
};
