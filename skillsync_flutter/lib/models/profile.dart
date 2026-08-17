class Profile {
  final String id;
  final String? fullName;
  final String? bio;
  final String? location;
  final String? avatarUrl;
  final bool isPublic;
  final bool showLocation;
  final String? createdAt;
  final String? updatedAt;

  Profile({
    required this.id,
    this.fullName,
    this.bio,
    this.location,
    this.avatarUrl,
    this.isPublic = true,
    this.showLocation = true,
    this.createdAt,
    this.updatedAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      bio: json['bio'] as String?,
      location: json['location'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      isPublic: json['is_public'] ?? true,
      showLocation: json['show_location'] ?? true,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'bio': bio,
      'location': location,
      'avatar_url': avatarUrl,
      'is_public': isPublic,
      'show_location': showLocation,
    };
  }
}
