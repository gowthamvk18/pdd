import { supabase } from './supabase';



export const api = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  },

  // Skills
  async getAllSkills() {
    const { data, error } = await (supabase as any)
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  // User Skills
  async getUserSkills(userId: string) {
    const { data: userSkills, error } = await (supabase as any)
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    if (!userSkills || userSkills.length === 0) return [];

    const skillIds = userSkills.map((us: any) => us.skill_id);
    const { data: skills } = await (supabase as any)
      .from('skills')
      .select('*')
      .in('id', skillIds);

    return userSkills.map((us: any) => ({
      ...us,
      skills: skills?.find((s: any) => s.id === us.skill_id)
    }));
  },

  async addUserSkill(userId: string, skillId: string, type: 'offering' | 'seeking') {
    const { data, error } = await (supabase as any)
      .from('user_skills')
      .insert({
        user_id: userId,
        skill_id: skillId,
        type
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async removeUserSkill(userSkillId: string) {
    const { error } = await (supabase as any)
      .from('user_skills')
      .delete()
      .eq('id', userSkillId);
      
    if (error) throw error;
  },

  // Matches
  async getRecommendations(userId: string) {
    // 1. What is the user seeking?
    const { data: mySeeks } = await (supabase as any)
      .from('user_skills')
      .select('skill_id')
      .eq('user_id', userId)
      .eq('type', 'seeking');
    
    if (!mySeeks || mySeeks.length === 0) return [];
    const skillIds = mySeeks.map((s: any) => s.skill_id);

    // 2. Who is offering those?
    const { data: offerings, error } = await (supabase as any)
      .from('user_skills')
      .select('*')
      .eq('type', 'offering')
      .in('skill_id', skillIds)
      .neq('user_id', userId);

    if (error) throw error;
    if (!offerings || offerings.length === 0) return [];

    // 3. Filter out existing matches
    const { data: matches } = await (supabase as any)
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    const existingMatchUsers = new Set();
    if (matches) {
      matches.forEach((m: any) => {
        existingMatchUsers.add(m.user1_id === userId ? m.user2_id : m.user1_id);
      });
    }

    const validOfferings = offerings.filter((off: any) => !existingMatchUsers.has(off.user_id));
    if (validOfferings.length === 0) return [];

    const userIds = [...new Set(validOfferings.map((o: any) => o.user_id))];
    const offSkillIds = [...new Set(validOfferings.map((o: any) => o.skill_id))];

    const { data: profiles } = await (supabase as any).from('profiles').select('*').in('id', userIds).eq('is_public', true);
    const { data: skills } = await (supabase as any).from('skills').select('*').in('id', offSkillIds);

    // Group by user
    const userMap = new Map();
    validOfferings.forEach((off: any) => {
      if (!userMap.has(off.user_id)) {
        userMap.set(off.user_id, {
          profile: profiles?.find((p: any) => p.id === off.user_id),
          skills: []
        });
      }
      const skillData = skills?.find((s: any) => s.id === off.skill_id);
      if (skillData) {
        userMap.get(off.user_id).skills.push(skillData);
      }
    });

    return Array.from(userMap.values()).filter((u: any) => u.profile);
  },

  async requestMatch(user1Id: string, user2Id: string) {
    const { data, error } = await (supabase as any)
      .from('matches')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    
    // Notify target user
    try {
      const { data: sender } = await (supabase as any).from('profiles').select('full_name').eq('id', user1Id).single();
      await this.createNotification(
        user2Id,
        'match_request',
        'New Match Request',
        `${sender?.full_name || 'Someone'} wants to swap skills with you!`,
        '/dashboard',
        { match_id: data.id }
      );
    } catch (e) {
      console.error("Failed to send notification", e);
    }

    return data;
  },

  async getPendingRequests(userId: string) {
    // Requests sent TO the user (they are user2_id)
    const { data, error } = await (supabase as any)
      .from('matches')
      .select('*')
      .eq('user2_id', userId)
      .eq('status', 'pending');
    if (error) throw error;

    if (!data || data.length === 0) return [];
    
    // Fetch profiles manually to avoid schema join errors
    const user1Ids = data.map((m: any) => m.user1_id);
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('*')
      .in('id', user1Ids);
      
    return data.map((m: any) => ({
      ...m,
      profiles: profiles?.find((p: any) => p.id === m.user1_id)
    }));
  },

  async updateMatchStatus(matchId: string, status: 'accepted' | 'rejected') {
    const { error } = await (supabase as any)
      .from('matches')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', matchId);
    if (error) throw error;

    // If accepted, notify the requester
    if (status === 'accepted') {
      try {
        const { data: match } = await (supabase as any).from('matches').select('user1_id, user2_id').eq('id', matchId).single();
        const { data: acceptor } = await (supabase as any).from('profiles').select('full_name').eq('id', match.user2_id).single();
        
        await this.createNotification(
          match.user1_id,
          'match_accepted',
          'Match Accepted!',
          `${acceptor?.full_name || 'Someone'} accepted your connection request.`,
          '/messages',
          { match_id: matchId }
        );
      } catch (e) {
        console.error("Failed to send acceptance notification", e);
      }
    }
  },

  async getActiveConnections(userId: string) {
    const { data, error } = await (supabase as any)
      .from('matches')
      .select('*')
      .eq('status', 'accepted')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get the profiles for the other users manually
    const otherUserIds = data.map((m: any) => m.user1_id === userId ? m.user2_id : m.user1_id);
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    return data.map((match: any) => {
      const otherId = match.user1_id === userId ? match.user2_id : match.user1_id;
      return {
        id: match.id,
        created_at: match.created_at,
        profile: profiles?.find((p: any) => p.id === otherId)
      };
    });
  },

  async exploreUsers(userId: string, searchQuery: string = '') {
    // Basic search implementation
    const { data: offerings, error } = await (supabase as any)
      .from('user_skills')
      .select('*')
      .eq('type', 'offering')
      .neq('user_id', userId);

    if (error) throw error;
    if (!offerings || offerings.length === 0) return [];

    const userIds = [...new Set(offerings.map((o: any) => o.user_id))];
    const skillIds = [...new Set(offerings.map((o: any) => o.skill_id))];

    const { data: profiles } = await (supabase as any).from('profiles').select('*').in('id', userIds).eq('is_public', true);
    const { data: skills } = await (supabase as any).from('skills').select('*').in('id', skillIds);

    // Group by user
    const userMap = new Map();
    offerings.forEach((off: any) => {
      if (!userMap.has(off.user_id)) {
        userMap.set(off.user_id, {
          profile: profiles?.find((p: any) => p.id === off.user_id),
          skills: []
        });
      }
      const skillData = skills?.find((s: any) => s.id === off.skill_id);
      if (skillData) {
        userMap.get(off.user_id).skills.push(skillData);
      }
    });

    let results = Array.from(userMap.values()).filter((u: any) => u.profile);
    
    // Client-side filtering if search query exists
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      results = results.filter((u: any) => 
        (u.profile?.full_name || '').toLowerCase().includes(lowerQ) ||
        (u.profile?.bio || '').toLowerCase().includes(lowerQ) ||
        u.skills.some((s: any) => s.name.toLowerCase().includes(lowerQ))
      );
    }

    return results;
  },

  // Messaging
  async getMessages(matchId: string) {
    const { data, error } = await (supabase as any)
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(matchId: string, userId: string) {
    const { error } = await (supabase as any)
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  },

  async sendMessage(matchId: string, senderId: string, content: string) {
    const { data, error } = await (supabase as any)
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content
      })
      .select()
      .single();
      
    if (error) throw error;

    // Notify receiver
    try {
      const { data: match } = await (supabase as any).from('matches').select('user1_id, user2_id').eq('id', matchId).single();
      const receiverId = match.user1_id === senderId ? match.user2_id : match.user1_id;
      const { data: sender } = await (supabase as any).from('profiles').select('full_name').eq('id', senderId).single();

      await this.createNotification(
        receiverId,
        'new_message',
        'New Message',
        `${sender?.full_name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        '/messages',
        { match_id: matchId, sender_id: senderId }
      );
    } catch (e) {
      console.error("Failed to send message notification", e);
    }

    return data;
  },

  subscribeToMessages(matchId: string, callback: (message: any) => void) {
    return supabase.channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  // Reviews
  async submitReview(matchId: string, reviewerId: string, revieweeId: string, rating: number, comment: string) {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .insert({
        match_id: matchId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment
      })
      .select()
      .single();
    if (error) throw error;

    // Notify reviewee
    try {
      const { data: reviewer } = await (supabase as any).from('profiles').select('full_name').eq('id', reviewerId).single();
      await this.createNotification(
        revieweeId,
        'new_review',
        'New Review Received',
        `${reviewer?.full_name || 'Someone'} left you a ${rating}-star review!`,
        '/profile',
        { match_id: matchId, reviewer_id: reviewerId }
      );
    } catch (e) {
      console.error("Failed to send review notification", e);
    }

    return data;
  },

  async getUserReviews(userId: string) {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .select('*')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    if (!data || data.length === 0) return [];

    const reviewerIds = [...new Set(data.map((r: any) => r.reviewer_id))];
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('*')
      .in('id', reviewerIds);

    return data.map((review: any) => ({
      ...review,
      reviewer: profiles?.find((p: any) => p.id === review.reviewer_id)
    }));
  },

  // Notifications
  async getNotifications(userId: string) {
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(notificationId: string) {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },

  async createNotification(userId: string, type: string, title: string, content: string, link: string = '', metadata: any = {}) {
    const { data, error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        content,
        link,
        metadata
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    return supabase.channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  // Sessions
  async proposeSession(matchId: string, proposerId: string, receiverId: string, scheduledAt: string, durationMinutes: number = 60) {
    const { data, error } = await (supabase as any)
      .from('sessions')
      .insert({
        match_id: matchId,
        proposer_id: proposerId,
        receiver_id: receiverId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: 'proposed'
      })
      .select()
      .single();
      
    if (error) throw error;

    // Notify receiver
    try {
      const { data: proposer } = await (supabase as any).from('profiles').select('full_name').eq('id', proposerId).single();
      await this.createNotification(
        receiverId,
        'match_request', // Reusing matching icon/type for now or generic
        'Session Proposed',
        `${proposer?.full_name} proposed a skill-sharing session on ${new Date(scheduledAt).toLocaleDateString()}.`,
        '/messages',
        { session_id: data.id, match_id: matchId }
      );
    } catch (e) {
      console.error(e);
    }

    return data;
  },

  async updateSessionStatus(sessionId: string, status: 'confirmed' | 'cancelled' | 'completed') {
    const { data, error } = await (supabase as any)
      .from('sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();
      
    if (error) throw error;

    // Notify the other party
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (user) {
        const otherId = data.proposer_id === user.id ? data.receiver_id : data.proposer_id;
        const { data: actor } = await (supabase as any).from('profiles').select('full_name').eq('id', user.id).single();
        
        await this.createNotification(
          otherId,
          status === 'confirmed' ? 'match_accepted' : 'match_request',
          `Session ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          `${actor?.full_name} has ${status} the session scheduled for ${new Date(data.scheduled_at).toLocaleDateString()}.`,
          status === 'confirmed' ? '/dashboard' : '/messages',
          { session_id: sessionId }
        );
      }
    } catch (e) {
      console.error(e);
    }

    return data;
  },

  async getUserSessions(userId: string) {
    const { data, error } = await (supabase as any)
      .from('sessions')
      .select('*, profiles:proposer_id(*)') // This is a bit complex due to two possible profiles
      .or(`proposer_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });
      
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Manually fetch the "other" profile for each session
    const otherIds = data.map((s: any) => s.proposer_id === userId ? s.receiver_id : s.proposer_id);
    const { data: profiles } = await (supabase as any).from('profiles').select('*').in('id', otherIds);

    return data.map((session: any) => ({
      ...session,
      other_profile: profiles?.find((p: any) => p.id === (session.proposer_id === userId ? session.receiver_id : session.proposer_id))
    }));
  },

  // Portfolio
  async getPortfolio(userId: string) {
    const { data, error } = await (supabase as any)
      .from('portfolio_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addPortfolioItem(item: { user_id: string, title: string, description?: string, project_url?: string, image_url?: string }) {
    const { data, error } = await (supabase as any)
      .from('portfolio_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePortfolioItem(itemId: string) {
    const { error } = await (supabase as any)
      .from('portfolio_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },

  // Settings
  async updatePrivacySettings(userId: string, settings: { is_public?: boolean, show_location?: boolean }) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update(settings)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
