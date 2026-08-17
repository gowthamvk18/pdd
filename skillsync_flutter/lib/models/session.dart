import 'profile.dart';

class Session {
  final String id;
  final String matchId;
  final String proposerId;
  final String receiverId;
  final String scheduledAt;
  final int durationMinutes;
  final String status; // 'proposed', 'confirmed', 'cancelled', 'completed'
  final String createdAt;
  final Profile? otherProfile;

  Session({
    required this.id,
    required this.matchId,
    required this.proposerId,
    required this.receiverId,
    required this.scheduledAt,
    this.durationMinutes = 60,
    required this.status,
    required this.createdAt,
    this.otherProfile,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      id: json['id'] as String,
      matchId: json['match_id'] as String,
      proposerId: json['proposer_id'] as String,
      receiverId: json['receiver_id'] as String,
      scheduledAt: json['scheduled_at'] as String,
      durationMinutes: json['duration_minutes'] ?? 60,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      otherProfile: json['other_profile'] != null 
          ? Profile.fromJson(json['other_profile']) 
          : null,
    );
  }
}
