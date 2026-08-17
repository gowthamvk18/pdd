import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/supabase_service.dart';
import '../models/profile.dart';
import 'chat_detail_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _connections = [];

  @override
  void initState() {
    super.initState();
    _fetchConnections();
  }

  Future<void> _fetchConnections() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final list = await service.getActiveConnections(userId);
      setState(() {
        _connections = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load connections: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Messages',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchConnections,
              color: theme.primaryColor,
              child: _connections.isEmpty
                  ? Center(
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.chat_bubble_outline,
                                size: 48,
                                color: theme.colorScheme.onBackground.withOpacity(0.4),
                              ),
                            ),
                            const SizedBox(height: 24),
                            const Text(
                              'No active connections yet.',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Go to the Explore tab to find other members and send connection requests!',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      itemCount: _connections.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final conn = _connections[index];
                        final otherProfile = conn['profile'] as Profile;
                        final String matchId = conn['id'] as String;
                        final createdDate = DateTime.parse(conn['created_at']);
                        final formattedDate = DateFormat('MMM d, yyyy').format(createdDate);

                        return Container(
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF231C1A) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: theme.dividerColor),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            leading: CircleAvatar(
                              radius: 24,
                              backgroundImage: otherProfile.avatarUrl != null
                                  ? NetworkImage(otherProfile.avatarUrl!)
                                  : null,
                              child: otherProfile.avatarUrl == null
                                  ? Text(otherProfile.fullName?.substring(0, 1).toUpperCase() ?? 'U')
                                  : null,
                            ),
                            title: Text(
                              otherProfile.fullName ?? 'SkillSync Partner',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              'Connected on $formattedDate',
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                            trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChatDetailScreen(
                                    matchId: matchId,
                                    otherProfile: otherProfile,
                                  ),
                                ),
                              ).then((_) => _fetchConnections());
                            },
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
