import 'profile.dart';

class Review {
  final String id;
  final String matchId;
  final String reviewerId;
  final String revieweeId;
  final double rating;
  final String? comment;
  final String createdAt;
  final Profile? reviewerProfile;

  Review({
    required this.id,
    required this.matchId,
    required this.reviewerId,
    required this.revieweeId,
    required this.rating,
    this.comment,
    required this.createdAt,
    this.reviewerProfile,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as String,
      matchId: json['match_id'] as String,
      reviewerId: json['reviewer_id'] as String,
      revieweeId: json['reviewee_id'] as String,
      rating: (json['rating'] as num).toDouble(),
      comment: json['comment'] as String?,
      createdAt: json['created_at'] as String,
      reviewerProfile: json['reviewer'] != null 
          ? Profile.fromJson(json['reviewer']) 
          : null,
    );
  }
}
