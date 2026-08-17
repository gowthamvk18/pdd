import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide Session;
import 'package:supabase_flutter/supabase_flutter.dart' as sb show Session;
import '../models/profile.dart';
import '../models/skill.dart';
import '../models/match.dart';
import '../models/message.dart';
import '../models/session.dart';
import '../models/portfolio_item.dart';
import '../models/review.dart';

class SupabaseService extends ChangeNotifier {
  final SupabaseClient client = Supabase.instance.client;

  User? get currentUser => client.auth.currentUser;
  sb.Session? get currentSession => client.auth.currentSession;
  bool get isAuthenticated => currentUser != null;

  // Sign In with Email
  Future<AuthResponse> signInWithEmail(String email, String password) async {
    final response = await client.auth.signInWithPassword(
      email: email.trim(),
      password: password.trim(),
    );
    notifyListeners();
    return response;
  }

  // Sign Up with Email
  Future<AuthResponse> signUpWithEmail(String email, String password) async {
    final response = await client.auth.signUp(
      email: email.trim(),
      password: password.trim(),
    );
    notifyListeners();
    return response;
  }

  // Sign In with Phone
  Future<AuthResponse> signInWithPhone(String phone, String password) async {
    final response = await client.auth.signInWithPassword(
      phone: phone.trim(),
      password: password.trim(),
    );
    notifyListeners();
    return response;
  }

  // Sign Up with Phone
  Future<AuthResponse> signUpWithPhone(String phone, String password) async {
    final response = await client.auth.signUp(
      phone: phone.trim(),
      password: password.trim(),
    );
    notifyListeners();
    return response;
  }

  // Sign Out
  Future<void> signOut() async {
    await client.auth.signOut();
    notifyListeners();
  }

  // Update Auth State
  void refresh() {
    notifyListeners();
  }

  // --- Profiles ---
  Future<Profile?> getProfile(String userId) async {
    try {
      final data = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      return Profile.fromJson(data);
    } catch (e) {
      if (kDebugMode) print('Error fetching profile: $e');
      return null;
    }
  }

  Future<Profile> updateProfile(String userId, Map<String, dynamic> updates) async {
    final data = await client
        .from('profiles')
        .update({
          ...updates,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', userId)
        .select()
        .single();
    return Profile.fromJson(data);
  }

  Future<String> uploadAvatar(String userId, File file) async {
    final fileExt = file.path.split('.').last;
    final filePath = '$userId-${DateTime.now().millisecondsSinceEpoch}.$fileExt';

    await client.storage.from('avatars').upload(
          filePath,
          file,
          fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
        );

    final String publicUrl =
        client.storage.from('avatars').getPublicUrl(filePath);
    return publicUrl;
  }

  // --- Skills ---
  Future<List<Skill>> getAllSkills() async {
    final data = await client
        .from('skills')
        .select('*')
        .order('category', ascending: true)
        .order('name', ascending: true);
    
    return (data as List).map((s) => Skill.fromJson(s)).toList();
  }

  Future<List<UserSkill>> getUserSkills(String userId) async {
    final List<dynamic> userSkillsData = await client
        .from('user_skills')
        .select('*, skills(*)')
        .eq('user_id', userId);
    
    return userSkillsData.map((us) => UserSkill.fromJson(us)).toList();
  }

  Future<Map<String, dynamic>> addUserSkill(
      String userId, String skillId, String type) async {
    final data = await client
        .from('user_skills')
        .insert({
          'user_id': userId,
          'skill_id': skillId,
          'type': type,
        })
        .select()
        .single();
    return data;
  }

  Future<void> removeUserSkill(String userSkillId) async {
    await client.from('user_skills').delete().eq('id', userSkillId);
  }

  // --- Matches & Recommendations ---
  Future<List<Map<String, dynamic>>> getRecommendations(String userId) async {
    // 1. What is the user seeking?
    final List<dynamic> mySeeks = await client
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', userId)
        .eq('type', 'seeking');

    if (mySeeks.isEmpty) return [];
    final List<String> skillIds =
        mySeeks.map((s) => s['skill_id'] as String).toList();

    // 2. Who is offering those?
    final List<dynamic> offerings = await client
        .from('user_skills')
        .select('*, skills(*)')
        .eq('type', 'offering')
        .inFilter('skill_id', skillIds)
        .neq('user_id', userId);

    if (offerings.isEmpty) return [];

    // 3. Filter out existing matches
    final List<dynamic> matches = await client
        .from('matches')
        .select('user1_id, user2_id')
        .or('user1_id.eq.$userId,user2_id.eq.$userId');

    final existingMatchUsers = <String>{};
    for (var m in matches) {
      existingMatchUsers.add(m['user1_id'] == userId
          ? m['user2_id'] as String
          : m['user1_id'] as String);
    }

    final validOfferings =
        offerings.where((off) => !existingMatchUsers.contains(off['user_id']));
    if (validOfferings.isEmpty) return [];

    final List<String> userIds =
        validOfferings.map((o) => o['user_id'] as String).toSet().toList();

    // Fetch profiles of these users
    final List<dynamic> profilesData = await client
        .from('profiles')
        .select('*')
        .inFilter('id', userIds)
        .eq('is_public', true);

    final List<Profile> profiles =
        profilesData.map((p) => Profile.fromJson(p)).toList();

    // Group by user
    final userMap = <String, Map<String, dynamic>>{};
    for (var off in validOfferings) {
      final offUserId = off['user_id'] as String;
      final profile = profiles.firstWhere((p) => p.id == offUserId,
          orElse: () => Profile(id: ''));
      if (profile.id.isEmpty) continue;

      if (!userMap.containsKey(offUserId)) {
        userMap[offUserId] = {
          'profile': profile,
          'skills': <Skill>[],
        };
      }

      if (off['skills'] != null) {
        (userMap[offUserId]!['skills'] as List<Skill>)
            .add(Skill.fromJson(off['skills']));
      }
    }

    return userMap.values.toList();
  }

  Future<Map<String, dynamic>> requestMatch(
      String user1Id, String user2Id) async {
    final data = await client
        .from('matches')
        .insert({
          'user1_id': user1Id,
          'user2_id': user2Id,
          'status': 'pending',
        })
        .select()
        .single();

    // Create Notification in background
    try {
      final senderProfile = await getProfile(user1Id);
      await createNotification(
        user2Id,
        'match_request',
        'New Match Request',
        '${senderProfile?.fullName ?? 'Someone'} wants to swap skills with you!',
        '/dashboard',
        {'match_id': data['id']},
      );
    } catch (e) {
      if (kDebugMode) print('Failed to send match notification: $e');
    }

    return data;
  }

  Future<List<Map<String, dynamic>>> getPendingRequests(String userId) async {
    final List<dynamic> matchesData = await client
        .from('matches')
        .select('*')
        .eq('user2_id', userId)
        .eq('status', 'pending');

    if (matchesData.isEmpty) return [];

    final List<String> user1Ids =
        matchesData.map((m) => m['user1_id'] as String).toList();

    final List<dynamic> profilesData =
        await client.from('profiles').select('*').inFilter('id', user1Ids);
    final List<Profile> profiles =
        profilesData.map((p) => Profile.fromJson(p)).toList();

    return matchesData.map<Map<String, dynamic>>((match) {
      final Map<String, dynamic> matchMap = Map<String, dynamic>.from(match);
      final profile = profiles.firstWhere((p) => p.id == matchMap['user1_id'],
          orElse: () => Profile(id: ''));
      return {
        ...matchMap,
        'profiles': profile,
      };
    }).toList();
  }

  Future<void> updateMatchStatus(String matchId, String status) async {
    await client
        .from('matches')
        .update({
          'status': status,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', matchId);

    if (status == 'accepted') {
      try {
        final match = await client
            .from('matches')
            .select('user1_id, user2_id')
            .eq('id', matchId)
            .single();
        final acceptorProfile = await getProfile(match['user2_id']);
        
        await createNotification(
          match['user1_id'],
          'match_accepted',
          'Match Accepted!',
          '${acceptorProfile?.fullName ?? 'Someone'} accepted your connection request.',
          '/messages',
          {'match_id': matchId},
        );
      } catch (e) {
        if (kDebugMode) print('Failed to send match acceptance: $e');
      }
    }
  }

  Future<List<Map<String, dynamic>>> getActiveConnections(String userId) async {
    final List<dynamic> data = await client
        .from('matches')
        .select('*')
        .eq('status', 'accepted')
        .or('user1_id.eq.$userId,user2_id.eq.$userId');

    if (data.isEmpty) return [];

    final List<String> otherUserIds = data
        .map((m) => m['user1_id'] == userId
            ? m['user2_id'] as String
            : m['user1_id'] as String)
        .toList();

    final List<dynamic> profilesData =
        await client.from('profiles').select('*').inFilter('id', otherUserIds);
    final List<Profile> profiles =
        profilesData.map((p) => Profile.fromJson(p)).toList();

    return data.map((match) {
      final otherId = match['user1_id'] == userId
          ? match['user2_id']
          : match['user1_id'];
      final profile = profiles.firstWhere((p) => p.id == otherId,
          orElse: () => Profile(id: ''));
      return {
        'id': match['id'],
        'created_at': match['created_at'],
        'profile': profile,
      };
    }).toList();
  }

  Future<List<Map<String, dynamic>>> exploreUsers(String userId,
      [String searchQuery = '']) async {
    final List<dynamic> offerings = await client
        .from('user_skills')
        .select('*, skills(*)')
        .eq('type', 'offering')
        .neq('user_id', userId);

    if (offerings.isEmpty) return [];

    final List<String> userIds =
        offerings.map((o) => o['user_id'] as String).toSet().toList();

    final List<dynamic> profilesData = await client
        .from('profiles')
        .select('*')
        .inFilter('id', userIds)
        .eq('is_public', true);

    final List<Profile> profiles =
        profilesData.map((p) => Profile.fromJson(p)).toList();

    final userMap = <String, Map<String, dynamic>>{};
    for (var off in offerings) {
      final offUserId = off['user_id'] as String;
      final profile = profiles.firstWhere((p) => p.id == offUserId,
          orElse: () => Profile(id: ''));
      if (profile.id.isEmpty) continue;

      if (!userMap.containsKey(offUserId)) {
        userMap[offUserId] = {
          'profile': profile,
          'skills': <Skill>[],
        };
      }

      if (off['skills'] != null) {
        (userMap[offUserId]!['skills'] as List<Skill>)
            .add(Skill.fromJson(off['skills']));
      }
    }

    var results = userMap.values.toList();

    if (searchQuery.isNotEmpty) {
      final query = searchQuery.toLowerCase();
      results = results.where((u) {
        final profile = u['profile'] as Profile;
        final skills = u['skills'] as List<Skill>;

        final nameMatch = (profile.fullName ?? '').toLowerCase().contains(query);
        final bioMatch = (profile.bio ?? '').toLowerCase().contains(query);
        final skillMatch = skills.any((s) => s.name.toLowerCase().contains(query));

        return nameMatch || bioMatch || skillMatch;
      }).toList();
    }

    return results;
  }

  // --- Real-time Messages ---
  Stream<List<Message>> subscribeToMessages(String matchId) {
    return client
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('match_id', matchId)
        .order('created_at', ascending: true)
        .map((maps) => maps.map((map) => Message.fromJson(map)).toList());
  }

  Future<List<Message>> getMessages(String matchId) async {
    final List<dynamic> data = await client
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', ascending: true);
    return data.map((m) => Message.fromJson(m)).toList();
  }

  Future<void> markMessagesAsRead(String matchId, String userId) async {
    await client
        .from('messages')
        .update({'is_read': true})
        .eq('match_id', matchId)
        .neq('sender_id', userId)
        .eq('is_read', false);
  }

  Future<Message> sendMessage(
      String matchId, String senderId, String content) async {
    final data = await client
        .from('messages')
        .insert({
          'match_id': matchId,
          'sender_id': senderId,
          'content': content,
        })
        .select()
        .single();

    try {
      final match = await client
          .from('matches')
          .select('user1_id, user2_id')
          .eq('id', matchId)
          .single();
      final receiverId = match['user1_id'] == senderId
          ? match['user2_id']
          : match['user1_id'];
      final senderProfile = await getProfile(senderId);

      await createNotification(
        receiverId,
        'new_message',
        'New Message',
        '${senderProfile?.fullName ?? 'Someone'}: ${content.length > 50 ? '${content.substring(0, 50)}...' : content}',
        '/messages',
        {'match_id': matchId, 'sender_id': senderId},
      );
    } catch (e) {
      if (kDebugMode) print('Failed to send message notification: $e');
    }

    return Message.fromJson(data);
  }

  // --- Reviews ---
  Future<Review> submitReview(String matchId, String reviewerId,
      String revieweeId, double rating, String comment) async {
    final data = await client
        .from('reviews')
        .insert({
          'match_id': matchId,
          'reviewer_id': reviewerId,
          'reviewee_id': revieweeId,
          'rating': rating,
          'comment': comment,
        })
        .select()
        .single();

    try {
      final reviewerProfile = await getProfile(reviewerId);
      await createNotification(
        revieweeId,
        'new_review',
        'New Review Received',
        '${reviewerProfile?.fullName ?? 'Someone'} left you a ${rating.toStringAsFixed(0)}-star review!',
        '/profile',
        {'match_id': matchId, 'reviewer_id': reviewerId},
      );
    } catch (e) {
      if (kDebugMode) print('Failed to send review notification: $e');
    }

    return Review.fromJson(data);
  }

  Future<List<Review>> getUserReviews(String userId) async {
    final List<dynamic> data = await client
        .from('reviews')
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
        .eq('reviewee_id', userId)
        .order('created_at', ascending: false);

    // If reviews_reviewer_id_fkey join isn't exact, fetch reviewers manually
    if (data.isEmpty) return [];
    
    final List<String> reviewerIds =
        data.map((r) => r['reviewer_id'] as String).toSet().toList();

    final List<dynamic> profilesData =
        await client.from('profiles').select('*').inFilter('id', reviewerIds);
    final List<Profile> profiles =
        profilesData.map((p) => Profile.fromJson(p)).toList();

    return data.map((review) {
      final Profile profile = profiles.firstWhere(
          (p) => p.id == review['reviewer_id'],
          orElse: () => Profile(id: ''));
      
      final Map<String, dynamic> reviewMap = Map<String, dynamic>.from(review);
      reviewMap['reviewer'] = reviewMap['reviewer'] ?? profile.toJson();
      return Review.fromJson(reviewMap);
    }).toList();
  }

  // --- Sessions ---
  Future<Session> proposeSession(String matchId, String proposerId,
      String receiverId, String scheduledAt,
      [int durationMinutes = 60]) async {
    final data = await client
        .from('sessions')
        .insert({
          'match_id': matchId,
          'proposer_id': proposerId,
          'receiver_id': receiverId,
          'scheduled_at': scheduledAt,
          'duration_minutes': durationMinutes,
          'status': 'proposed',
        })
        .select()
        .single();

    try {
      final proposerProfile = await getProfile(proposerId);
      await createNotification(
        receiverId,
        'match_request',
        'Session Proposed',
        '${proposerProfile?.fullName ?? 'Someone'} proposed a skill-sharing session.',
        '/messages',
        {'session_id': data['id'], 'match_id': matchId},
      );
    } catch (e) {
      if (kDebugMode) print('Failed to notify session proposal: $e');
    }

    return Session.fromJson(data);
  }

  Future<Session> updateSessionStatus(String sessionId, String status) async {
    final data = await client
        .from('sessions')
        .update({
          'status': status,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', sessionId)
        .select()
        .single();

    try {
      final actorId = currentUser?.id;
      if (actorId != null) {
        final otherId = data['proposer_id'] == actorId
            ? data['receiver_id']
            : data['proposer_id'];
        final actorProfile = await getProfile(actorId);

        await createNotification(
          otherId,
          status == 'confirmed' ? 'match_accepted' : 'match_request',
          'Session ${status[0].toUpperCase()}${status.substring(1)}',
          '${actorProfile?.fullName ?? 'Someone'} has $status the session.',
          status == 'confirmed' ? '/dashboard' : '/messages',
          {'session_id': sessionId},
        );
      }
    } catch (e) {
      if (kDebugMode) print('Failed to send session update notification: $e');
    }

    return Session.fromJson(data);
  }

  Future<List<Session>> getUserSessions(String userId) async {
    final List<dynamic> data = await client
        .from('sessions')
        .select('*')
        .or('proposer_id.eq.$userId,receiver_id.eq.$userId')
        .order('scheduled_at', ascending: true);

    if (data.isEmpty) return [];

    final List<String> otherIds = data
        .map((s) => s['proposer_id'] == userId
            ? s['receiver_id'] as String
            : s['proposer_id'] as String)
        .toList();

    final List<dynamic> profilesData =
        await client.from('profiles').select('*').inFilter('id', otherIds);
    final List<Profile> profiles =
        profilesData.map((p) => Profile.fromJson(p)).toList();

    return data.map((session) {
      final otherId = session['proposer_id'] == userId
          ? session['receiver_id']
          : session['proposer_id'];
      final profile = profiles.firstWhere((p) => p.id == otherId,
          orElse: () => Profile(id: ''));

      final Map<String, dynamic> sessionMap = Map<String, dynamic>.from(session);
      sessionMap['other_profile'] = profile.toJson();
      return Session.fromJson(sessionMap);
    }).toList();
  }

  // --- Portfolio ---
  Future<List<PortfolioItem>> getPortfolio(String userId) async {
    final List<dynamic> data = await client
        .from('portfolio_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return data.map((item) => PortfolioItem.fromJson(item)).toList();
  }

  Future<PortfolioItem> addPortfolioItem(Map<String, dynamic> item) async {
    final data = await client
        .from('portfolio_items')
        .insert(item)
        .select()
        .single();
    return PortfolioItem.fromJson(data);
  }

  Future<void> deletePortfolioItem(String itemId) async {
    await client.from('portfolio_items').delete().eq('id', itemId);
  }

  // --- Notifications ---
  Future<List<Map<String, dynamic>>> getNotifications(String userId) async {
    final List<dynamic> data = await client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .limit(20);
    return List<Map<String, dynamic>>.from(data);
  }

  Stream<List<Map<String, dynamic>>> subscribeToNotifications(String userId) {
    return client
        .from('notifications')
        .stream(primaryKey: ['id'])
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .map((maps) => List<Map<String, dynamic>>.from(maps));
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    await client
        .from('notifications')
        .update({'is_read': true})
        .eq('id', notificationId);
  }

  Future<Map<String, dynamic>> createNotification(
    String userId,
    String type,
    String title,
    String content, [
    String link = '',
    Map<String, dynamic> metadata = const {},
  ]) async {
    final data = await client
        .from('notifications')
        .insert({
          'user_id': userId,
          'type': type,
          'title': title,
          'content': content,
          'link': link,
          'metadata': metadata,
        })
        .select()
        .single();
    return data;
  }
}
