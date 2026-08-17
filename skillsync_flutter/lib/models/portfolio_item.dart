class PortfolioItem {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String? projectUrl;
  final String? imageUrl;
  final String createdAt;

  PortfolioItem({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.projectUrl,
    this.imageUrl,
    required this.createdAt,
  });

  factory PortfolioItem.fromJson(Map<String, dynamic> json) {
    return PortfolioItem(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      projectUrl: json['project_url'] as String?,
      imageUrl: json['image_url'] as String?,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'project_url': projectUrl,
      'image_url': imageUrl,
    };
  }
}
