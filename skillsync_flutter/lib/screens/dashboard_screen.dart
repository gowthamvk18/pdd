import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/supabase_service.dart';
import '../models/profile.dart';
import '../models/session.dart';
import '../widgets/custom_button.dart';
import 'chat_detail_screen.dart';
import 'main_navigation.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;

  Profile? _profile;
  List<Map<String, dynamic>> _recommendations = [];
  List<Map<String, dynamic>> _pendingRequests = [];
  List<Map<String, dynamic>> _activeConnections = [];
  List<Session> _sessions = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final profile = await service.getProfile(userId);
      final recs = await service.getRecommendations(userId);
      final pending = await service.getPendingRequests(userId);
      final active = await service.getActiveConnections(userId);
      final sessions = await service.getUserSessions(userId);

      setState(() {
        _profile = profile;
        _recommendations = recs;
        _pendingRequests = pending;
        _activeConnections = active;
        _sessions = sessions.where((Session s) => s.status == 'confirmed' || s.status == 'proposed').toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading dashboard: $e')),
        );
      }
    }
  }

  Future<void> _handleAcceptMatch(String matchId) async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    try {
      await service.updateMatchStatus(matchId, 'accepted');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connection request accepted!')),
      );
      _loadDashboardData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to accept connection: $e')),
      );
    }
  }

  Future<void> _handleDeclineMatch(String matchId) async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    try {
      await service.updateMatchStatus(matchId, 'rejected');
      _loadDashboardData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to decline: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadDashboardData,
          color: theme.primaryColor,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row
                Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: theme.primaryColor.withOpacity(0.12),
                      backgroundImage: _profile?.avatarUrl != null
                          ? NetworkImage(_profile!.avatarUrl!)
                          : null,
                      child: _profile?.avatarUrl == null
                          ? Text(
                              _profile?.fullName?.substring(0, 1).toUpperCase() ?? 'U',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: theme.primaryColor),
                            )
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Welcome back,',
                            style: TextStyle(fontSize: 13, color: Colors.grey),
                          ),
                          Text(
                            _profile?.fullName ?? 'User',
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    // Notification Icon with badge logic
                    IconButton(
                      icon: const Icon(Icons.notifications_none),
                      onPressed: () {
                        // In React, notification panel is shown. We will show notifications in a sheet/alert
                        _showNotificationsSheet(context);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Welcome Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        theme.primaryColor,
                        theme.primaryColor.withOpacity(0.8),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Ready to swap some skills today?',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'You have ${_activeConnections.length} active connections and ${_sessions.length} scheduled swaps.',
                        style: TextStyle(
                            color: Colors.white.withOpacity(0.9), fontSize: 14),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Connection Requests (if any)
                if (_pendingRequests.isNotEmpty) ...[
                  _buildSectionHeader('Connection Requests', () {}),
                  const SizedBox(height: 12),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _pendingRequests.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final req = _pendingRequests[index];
                      final requester = req['profiles'] as Profile;
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF231C1A) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: theme.dividerColor),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundImage: requester.avatarUrl != null
                                  ? NetworkImage(requester.avatarUrl!)
                                  : null,
                              child: requester.avatarUrl == null
                                  ? Text(requester.fullName?.substring(0, 1).toUpperCase() ?? 'U')
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    requester.fullName ?? 'SkillSync Member',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    requester.location ?? 'Unknown location',
                                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.check_circle, color: Colors.green),
                              onPressed: () => _handleAcceptMatch(req['id']),
                            ),
                            IconButton(
                              icon: const Icon(Icons.cancel, color: Colors.red),
                              onPressed: () => _handleDeclineMatch(req['id']),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 32),
                ],

                // Upcoming Sessions
                _buildSectionHeader('Upcoming Sessions', () {}),
                const SizedBox(height: 12),
                _sessions.isEmpty
                    ? _buildEmptyCard(Icons.calendar_today, 'No sessions proposed or confirmed. Head over to Messages to book one!')
                    : ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _sessions.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final sess = _sessions[index];
                          final parsedDate = DateTime.parse(sess.scheduledAt);
                          final formattedDate = DateFormat('EEE, MMM d').format(parsedDate);
                          final formattedTime = DateFormat('h:mm a').format(parsedDate);

                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF231C1A) : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: theme.dividerColor),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: sess.status == 'confirmed'
                                        ? Colors.green.withOpacity(0.12)
                                        : theme.primaryColor.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    Icons.calendar_month,
                                    color: sess.status == 'confirmed'
                                        ? Colors.green
                                        : theme.primaryColor,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        sess.otherProfile?.fullName ?? 'Skill Swap Session',
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        '$formattedDate at $formattedTime (${sess.durationMinutes} mins)',
                                        style: const TextStyle(fontSize: 13, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: sess.status == 'confirmed'
                                        ? Colors.green.withOpacity(0.12)
                                        : Colors.orange.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    sess.status.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: sess.status == 'confirmed'
                                          ? Colors.green
                                          : Colors.orange,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                const SizedBox(height: 32),

                // Recommendations
                _buildSectionHeader('Recommended Matches', () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const MainNavigation(initialTab: 1)),
                    (route) => false,
                  );
                }),
                const SizedBox(height: 12),
                _recommendations.isEmpty
                    ? _buildEmptyCard(Icons.people_outline, 'No matches recommended. Try updating your Seeking Skills in your Profile!')
                    : SizedBox(
                        height: 200,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _recommendations.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 16),
                          itemBuilder: (context, index) {
                            final rec = _recommendations[index];
                            final recProfile = rec['profile'] as Profile;
                            return Container(
                              width: 260,
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF231C1A) : Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: theme.dividerColor),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 18,
                                        backgroundImage: recProfile.avatarUrl != null
                                            ? NetworkImage(recProfile.avatarUrl!)
                                            : null,
                                        child: recProfile.avatarUrl == null
                                            ? Text(recProfile.fullName?.substring(0, 1).toUpperCase() ?? 'U')
                                            : null,
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          recProfile.fullName ?? 'SkillSync Member',
                                          style: const TextStyle(fontWeight: FontWeight.bold),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    recProfile.bio ?? 'No bio provided.',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                                  ),
                                  const Spacer(),
                                  CustomButton(
                                    text: 'Connect',
                                    onPressed: () async {
                                      final service = Provider.of<SupabaseService>(context, listen: false);
                                      try {
                                        await service.requestMatch(service.currentUser!.id, recProfile.id);
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Connection request sent!')),
                                        );
                                        _loadDashboardData();
                                      } catch (e) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Failed to connect: $e')),
                                        );
                                      }
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onSeeAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        GestureDetector(
          onTap: onSeeAll,
          child: Text(
            'See all',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyCard(IconData icon, String message) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF231C1A) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        children: [
          Icon(icon, size: 28, color: Colors.grey.withOpacity(0.6)),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  void _showNotificationsSheet(BuildContext context) {
    final theme = Theme.of(context);
    final service = Provider.of<SupabaseService>(context, listen: false);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StreamBuilder<List<Map<String, dynamic>>>(
          stream: service.subscribeToNotifications(service.currentUser!.id),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            final list = snapshot.data ?? [];
            return Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Notifications',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (list.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 32.0),
                      child: Center(
                        child: Text(
                          'No new notifications.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: ListView.separated(
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const Divider(),
                        itemBuilder: (context, index) {
                          final notif = list[index];
                          final isRead = notif['is_read'] ?? false;
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(
                              notif['title'] ?? 'Notification',
                              style: TextStyle(
                                  fontWeight: isRead ? FontWeight.normal : FontWeight.bold),
                            ),
                            subtitle: Text(notif['content'] ?? ''),
                            trailing: !isRead
                                ? IconButton(
                                    icon: const Icon(Icons.mark_chat_read_outlined, size: 20),
                                    onPressed: () {
                                      service.markNotificationAsRead(notif['id']);
                                    },
                                  )
                                : null,
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
