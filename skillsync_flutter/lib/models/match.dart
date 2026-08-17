import 'profile.dart';

class Match {
  final String id;
  final String user1Id;
  final String user2Id;
  final String status; // 'pending', 'accepted', 'rejected'
  final String createdAt;
  final Profile? otherProfile; // Inlined profile of the other user

  Match({
    required this.id,
    required this.user1Id,
    required this.user2Id,
    required this.status,
    required this.createdAt,
    this.otherProfile,
  });

  factory Match.fromJson(Map<String, dynamic> json, String currentUserId) {
    // Determine who the other person is
    final isUser1 = json['user1_id'] == currentUserId;
    final otherProfileJson = isUser1 ? json['user2_profile'] : json['user1_profile'];
    
    return Match(
      id: json['id'] as String,
      user1Id: json['user1_id'] as String,
      user2Id: json['user2_id'] as String,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      otherProfile: otherProfileJson != null ? Profile.fromJson(otherProfileJson) : null,
    );
  }
}
