class Skill {
  final String id;
  final String name;
  final String category;

  Skill({
    required this.id,
    required this.name,
    required this.category,
  });

  factory Skill.fromJson(Map<String, dynamic> json) {
    return Skill(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
    };
  }
}

class UserSkill {
  final String id;
  final String userId;
  final String skillId;
  final String type; // 'offering' or 'seeking'
  final Skill? skill;

  UserSkill({
    required this.id,
    required this.userId,
    required this.skillId,
    required this.type,
    this.skill,
  });

  factory UserSkill.fromJson(Map<String, dynamic> json) {
    return UserSkill(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      skillId: json['skill_id'] as String,
      type: json['type'] as String,
      skill: json['skills'] != null ? Skill.fromJson(json['skills']) : null,
    );
  }
}
