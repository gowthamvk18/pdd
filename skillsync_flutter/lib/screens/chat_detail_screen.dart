import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/supabase_service.dart';
import '../models/profile.dart';
import '../models/message.dart';
import '../models/session.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_textfield.dart';

class ChatDetailScreen extends StatefulWidget {
  final String matchId;
  final Profile otherProfile;

  const ChatDetailScreen({
    Key? key,
    required this.matchId,
    required this.otherProfile,
  }) : super(key: key);

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _sending = false;

  Session? _activeSession;

  // Review states
  double _rating = 0;
  final _reviewController = TextEditingController();

  // Session proposal dates
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;

  @override
  void initState() {
    super.initState();
    _fetchActiveSession();
    _markRead();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _reviewController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchActiveSession() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    try {
      final sessions = await service.getUserSessions(service.currentUser!.id);
      final matchSessions = sessions.where((Session s) => s.matchId == widget.matchId && (s.status == 'proposed' || s.status == 'confirmed'));
      if (matchSessions.isNotEmpty) {
        setState(() {
          _activeSession = matchSessions.first;
        });
      }
    } catch (e) {
      // Ignore background fetch error
    }
  }

  void _markRead() {
    final service = Provider.of<SupabaseService>(context, listen: false);
    service.markMessagesAsRead(widget.matchId, service.currentUser!.id);
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;

    final service = Provider.of<SupabaseService>(context, listen: false);
    setState(() {
      _sending = true;
      _messageController.clear();
    });

    try {
      await service.sendMessage(widget.matchId, service.currentUser!.id, content);
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _sending = false;
        });
      }
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 60,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  // Launches Jitsi Call Room
  Future<void> _launchVideoCall() async {
    final roomUrl = Uri.parse('https://meet.jit.si/SkillSync_Session_${widget.matchId}');
    if (!await launchUrl(roomUrl, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open video call browser.')),
        );
      }
    }
  }

  // Modal to propose a new session
  void _showProposeSessionModal() {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Schedule Session',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Propose a time to meet with ${widget.otherProfile.fullName}.',
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 24),

                  // Select Date
                  ListTile(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: theme.dividerColor),
                    ),
                    leading: Icon(Icons.date_range, color: theme.primaryColor),
                    title: Text(_selectedDate == null
                        ? 'Select Date'
                        : DateFormat('EEEE, MMM d, yyyy').format(_selectedDate!)),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now().add(const Duration(days: 1)),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (picked != null) {
                        setModalState(() {
                          _selectedDate = picked;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 12),

                  // Select Time
                  ListTile(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: theme.dividerColor),
                    ),
                    leading: Icon(Icons.access_time, color: theme.primaryColor),
                    title: Text(_selectedTime == null
                        ? 'Select Time'
                        : _selectedTime!.format(context)),
                    onTap: () async {
                      final picked = await showTimePicker(
                        context: context,
                        initialTime: TimeOfDay.now(),
                      );
                      if (picked != null) {
                        setModalState(() {
                          _selectedTime = picked;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 24),

                  // Submit proposal
                  CustomButton(
                    text: 'Propose Session',
                    onPressed: _selectedDate == null || _selectedTime == null
                        ? null
                        : () async {
                            final dateString =
                                "${DateFormat('yyyy-MM-dd').format(_selectedDate!)}T${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}:00";
                            final service = Provider.of<SupabaseService>(context, listen: false);
                            try {
                              final session = await service.proposeSession(
                                widget.matchId,
                                service.currentUser!.id,
                                widget.otherProfile.id,
                                dateString,
                              );
                              setState(() {
                                _activeSession = session;
                              });
                              if (context.mounted) Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Session proposed successfully!')),
                              );
                            } catch (e) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Failed to propose: $e')),
                              );
                            }
                          },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // Modal to submit reviews
  void _showLeaveReviewModal() {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Leave a Review',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'How was your experience with ${widget.otherProfile.fullName}?',
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 20),

                  // Stars Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starVal = index + 1.0;
                      return IconButton(
                        icon: Icon(
                          Icons.star,
                          size: 36,
                          color: starVal <= _rating ? Colors.amber : Colors.grey.withOpacity(0.3),
                        ),
                        onPressed: () {
                          setModalState(() {
                            _rating = starVal;
                          });
                        },
                      );
                    }),
                  ),
                  const SizedBox(height: 16),

                  CustomTextField(
                    controller: _reviewController,
                    labelText: 'Comments',
                    hintText: 'Share details of your skill swap exchange (optional)...',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 24),

                  CustomButton(
                    text: 'Submit Review',
                    onPressed: _rating == 0
                        ? null
                        : () async {
                            final service = Provider.of<SupabaseService>(context, listen: false);
                            try {
                              await service.submitReview(
                                widget.matchId,
                                service.currentUser!.id,
                                widget.otherProfile.id,
                                _rating,
                                _reviewController.text.trim(),
                              );
                              if (context.mounted) Navigator.pop(context);
                              _reviewController.clear();
                              setState(() {
                                _rating = 0;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Review submitted successfully!')),
                              );
                            } catch (e) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Failed to submit. You may have already reviewed this partner.')),
                              );
                            }
                          },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _handleSessionAction(String action) async {
    if (_activeSession == null) return;
    final service = Provider.of<SupabaseService>(context, listen: false);
    try {
      if (action == 'accept') {
        final sess = await service.updateSessionStatus(_activeSession!.id, 'confirmed');
        setState(() {
          _activeSession = sess;
        });
      } else {
        await service.updateSessionStatus(_activeSession!.id, 'cancelled');
        setState(() {
          _activeSession = null;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Action failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final service = Provider.of<SupabaseService>(context, listen: false);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: widget.otherProfile.avatarUrl != null
                  ? NetworkImage(widget.otherProfile.avatarUrl!)
                  : null,
              child: widget.otherProfile.avatarUrl == null
                  ? Text(widget.otherProfile.fullName?.substring(0, 1).toUpperCase() ?? 'U')
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.otherProfile.fullName ?? 'SkillSync Partner',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  Text(
                    widget.otherProfile.location ?? '',
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.star_outline),
            tooltip: 'Leave Review',
            onPressed: _showLeaveReviewModal,
          ),
          IconButton(
            icon: const Icon(Icons.calendar_today_outlined),
            tooltip: 'Schedule Session',
            onPressed: _showProposeSessionModal,
          ),
          IconButton(
            icon: const Icon(Icons.videocam_outlined),
            tooltip: 'Start Video Call',
            onPressed: _launchVideoCall,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Active Session Proposed/Confirmed Banner
            if (_activeSession != null) ...[
              _buildSessionBanner(theme, isDark, service.currentUser!.id),
            ],

            // Real-time Chat message logs
            Expanded(
              child: StreamBuilder<List<Message>>(
                stream: service.subscribeToMessages(widget.matchId),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final list = snapshot.data ?? [];
                  WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

                  if (list.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('👋', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 16),
                            const Text(
                              'Say hello!',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Introduce yourself and let ${widget.otherProfile.fullName} know what you want to swap!",
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    itemCount: list.length,
                    itemBuilder: (context, index) {
                      final msg = list[index];
                      final isMine = msg.senderId == service.currentUser!.id;
                      final date = DateTime.parse(msg.createdAt);
                      final formattedTime = DateFormat('h:mm a').format(date);

                      return Align(
                        alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.75,
                          ),
                          decoration: BoxDecoration(
                            color: isMine
                                ? theme.primaryColor
                                : (isDark ? const Color(0xFF231C1A) : const Color(0xFFECE6DC)),
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(16),
                              topRight: const Radius.circular(16),
                              bottomLeft: isMine ? const Radius.circular(16) : const Radius.circular(0),
                              bottomRight: isMine ? const Radius.circular(0) : const Radius.circular(16),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                msg.content,
                                style: TextStyle(
                                  color: isMine ? Colors.white : theme.colorScheme.onBackground,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    formattedTime,
                                    style: TextStyle(
                                      color: isMine ? Colors.white60 : Colors.grey,
                                      fontSize: 10,
                                    ),
                                  ),
                                  if (isMine) ...[
                                    const SizedBox(width: 4),
                                    Icon(
                                      msg.isRead ? Icons.done_all : Icons.done,
                                      size: 12,
                                      color: msg.isRead ? Colors.blue[200] : Colors.white60,
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),

            // Message send text bar
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                border: Border(top: BorderSide(color: theme.dividerColor)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      style: TextStyle(color: theme.colorScheme.onBackground),
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: const TextStyle(fontSize: 14),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: theme.primaryColor,
                    child: _sending
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : IconButton(
                            icon: const Icon(Icons.send, color: Colors.white, size: 18),
                            onPressed: _sendMessage,
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionBanner(ThemeData theme, bool isDark, String currentUserId) {
    final sess = _activeSession!;
    final parsedDate = DateTime.parse(sess.scheduledAt);
    final formattedDate = DateFormat('EEE, MMM d').format(parsedDate);
    final formattedTime = DateFormat('h:mm a').format(parsedDate);
    final isProposedByOther = sess.status == 'proposed' && sess.receiverId == currentUserId;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
        border: Border(bottom: BorderSide(color: theme.dividerColor)),
      ),
      child: Row(
        children: [
          Icon(Icons.calendar_today, color: theme.primaryColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  sess.status == 'confirmed' ? 'Confirmed Session' : 'Proposed Session',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: sess.status == 'confirmed' ? Colors.green : theme.primaryColor,
                  ),
                ),
                Text(
                  '$formattedDate at $formattedTime',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          ),
          if (isProposedByOther) ...[
            TextButton(
              onPressed: () => _handleSessionAction('accept'),
              child: const Text('Accept', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
            ),
            TextButton(
              onPressed: () => _handleSessionAction('decline'),
              child: const Text('Decline', style: TextStyle(color: Colors.red)),
            ),
          ] else if (sess.status == 'confirmed') ...[
            const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 16),
                SizedBox(width: 4),
                Text('Confirmed', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            )
          ] else ...[
            const Text('Awaiting acceptance', style: TextStyle(fontStyle: FontStyle.italic, fontSize: 12, color: Colors.grey)),
          ],
        ],
      ),
    );
  }
}
