import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, MessageCircle, Star, Handshake, ChevronRight, X } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [latestToast, setLatestToast] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    api.getNotifications(user.id).then(setNotifications).catch(console.error);

    // Subscribe to real-time notifications
    const channel = api.subscribeToNotifications(user.id, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev].slice(0, 20));
      setLatestToast(newNotif);
      setTimeout(() => setLatestToast(null), 5000);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match_request': return <Handshake className="w-4 h-4 text-primary" />;
      case 'match_accepted': return <Check className="w-4 h-4 text-green-500" />;
      case 'new_message': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'new_review': return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-elevated border border-border z-50 overflow-hidden animate-fade-up">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                {unreadCount} NEW
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    handleMarkAsRead(notif.id);
                    if (notif.link) navigate(notif.link);
                    setIsOpen(false);
                  }}
                  className={`p-4 border-b border-black/5 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-background shadow-sm flex items-center justify-center shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{notif.content}</p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-400">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!notif.is_read && <div className="w-1.5 h-1.5 bg-primary rounded-full self-center"></div>}
                </div>
              ))
            )}
          </div>

          <div className="p-3 text-center border-t border-black/5">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-gray-400 hover:text-primary flex items-center justify-center gap-1 mx-auto"
            >
              Close <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {latestToast && !isOpen && (
        <div 
          onClick={() => {
            setIsOpen(true);
            setLatestToast(null);
          }}
          className="fixed top-20 right-6 z-[100] bg-card rounded-2xl shadow-elevated border border-primary/20 p-4 flex gap-3 animate-fade-up max-w-[300px] cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            {getIcon(latestToast.type)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900">{latestToast.title}</p>
            <p className="text-[11px] text-gray-500 truncate">{latestToast.content}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLatestToast(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
