import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/supabase_service.dart';
import '../models/profile.dart';
import '../models/skill.dart';
import '../models/portfolio_item.dart';
import '../models/review.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_textfield.dart';
import '../widgets/skill_chip.dart';
import 'settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  Profile? _profile;
  List<UserSkill> _userSkills = [];
  List<PortfolioItem> _portfolio = [];
  List<Review> _reviews = [];
  List<Skill> _allSkills = [];

  // Edit Controllers
  final _nameController = TextEditingController();
  final _bioController = TextEditingController();
  final _locationController = TextEditingController();

  // Portfolio Item Form Controllers
  final _portfolioTitle = TextEditingController();
  final _portfolioDesc = TextEditingController();
  final _portfolioUrl = TextEditingController();

  bool _isPublic = true;
  bool _showLocation = true;
  bool _isEditing = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _locationController.dispose();
    _portfolioTitle.dispose();
    _portfolioDesc.dispose();
    _portfolioUrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfileData() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final profile = await service.getProfile(userId);
      final userSkills = await service.getUserSkills(userId);
      final portfolio = await service.getPortfolio(userId);
      final reviews = await service.getUserReviews(userId);
      final allSkills = await service.getAllSkills();

      setState(() {
        _profile = profile;
        _userSkills = userSkills;
        _portfolio = portfolio;
        _reviews = reviews;
        _allSkills = allSkills;

        if (profile != null) {
          _nameController.text = profile.fullName ?? '';
          _bioController.text = profile.bio ?? '';
          _locationController.text = profile.location ?? '';
          _isPublic = profile.isPublic;
          _showLocation = profile.showLocation;
        }

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load profile data: $e')),
        );
      }
    }
  }

  double _getAverageRating() {
    if (_reviews.isEmpty) return 0.0;
    final sum = _reviews.map((r) => r.rating).reduce((a, b) => a + b);
    return sum / _reviews.length;
  }

  Future<void> _saveProfileChanges() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    setState(() {
      _isSaving = true;
    });

    try {
      final updatedProfile = await service.updateProfile(userId, {
        'full_name': _nameController.text.trim(),
        'bio': _bioController.text.trim(),
        'location': _locationController.text.trim(),
        'is_public': _isPublic,
        'show_location': _showLocation,
      });

      setState(() {
        _profile = updatedProfile;
        _isEditing = false;
        _isSaving = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!')),
        );
      }
    } catch (e) {
      setState(() {
        _isSaving = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save profile: $e')),
        );
      }
    }
  }

  Future<void> _handleRemoveSkill(String userSkillId) async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    try {
      await service.removeUserSkill(userSkillId);
      setState(() {
        _userSkills.removeWhere((us) => us.id == userSkillId);
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to remove skill: $e')),
      );
    }
  }

  Future<void> _handleAddSkill(Skill skill, String type) async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    // Check limits
    final typeSkills = _userSkills.where((us) => us.type == type);
    if (typeSkills.length >= 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('You can add up to 3 ${type == 'offering' ? 'offered' : 'seeking'} skills.')),
      );
      return;
    }

    if (_userSkills.any((us) => us.skillId == skill.id && us.type == type)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Skill already added.')),
      );
      return;
    }

    try {
      final result = await service.addUserSkill(userId, skill.id, type);
      setState(() {
        _userSkills.add(UserSkill(
          id: result['id'],
          userId: userId,
          skillId: skill.id,
          type: type,
          skill: skill,
        ));
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add skill: $e')),
      );
    }
  }

  void _showAddSkillSheet(String type) {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Add ${type == 'offering' ? 'Offering' : 'Seeking'} Skill',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.separated(
                  itemCount: _allSkills.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (context, index) {
                    final skill = _allSkills[index];
                    return ListTile(
                      title: Text(skill.name),
                      subtitle: Text(skill.category),
                      trailing: const Icon(Icons.add_circle_outline),
                      onTap: () {
                        Navigator.pop(context);
                        _handleAddSkill(skill, type);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAddPortfolioModal() {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Add Portfolio Project',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              CustomTextField(
                controller: _portfolioTitle,
                labelText: 'Project Title',
                hintText: 'e.g. Portfolio Website',
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _portfolioDesc,
                labelText: 'Description',
                hintText: 'Briefly explain what you built...',
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _portfolioUrl,
                labelText: 'Project URL',
                hintText: 'e.g. https://myproject.com',
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: 'Add Project',
                onPressed: () async {
                  final title = _portfolioTitle.text.trim();
                  if (title.isEmpty) return;

                  final service = Provider.of<SupabaseService>(context, listen: false);
                  try {
                    final newItem = await service.addPortfolioItem({
                      'user_id': service.currentUser!.id,
                      'title': title,
                      'description': _portfolioDesc.text.trim(),
                      'project_url': _portfolioUrl.text.trim(),
                    });

                    setState(() {
                      _portfolio.insert(0, newItem);
                    });

                    _portfolioTitle.clear();
                    _portfolioDesc.clear();
                    _portfolioUrl.clear();

                    if (mounted) Navigator.pop(context);
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to add project: $e')),
                    );
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleDeletePortfolioItem(String id) async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    try {
      await service.deletePortfolioItem(id);
      setState(() {
        _portfolio.removeWhere((item) => item.id == id);
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete project: $e')),
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

    final offeringSkills = _userSkills.where((us) => us.type == 'offering').toList();
    final seekingSkills = _userSkills.where((us) => us.type == 'seeking').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              ).then((_) => _loadProfileData());
            },
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar & Name Card
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: theme.primaryColor.withOpacity(0.12),
                      backgroundImage: _profile?.avatarUrl != null
                          ? NetworkImage(_profile!.avatarUrl!)
                          : null,
                      child: _profile?.avatarUrl == null
                          ? Text(
                              _profile?.fullName?.substring(0, 1).toUpperCase() ?? 'U',
                              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: theme.primaryColor),
                            )
                          : null,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _profile?.fullName ?? 'SkillSync Member',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                    if (_profile?.showLocation == true && _profile?.location != null && _profile!.location!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            _profile!.location!,
                            style: const TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                        ],
                      ),
                    ],

                    // Rating Average display
                    if (_reviews.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              _getAverageRating().toStringAsFixed(1),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.amber),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '(${_reviews.length} reviews)',
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Edit profile toggle card
              _isEditing ? _buildEditForm(theme) : _buildProfileInfo(theme, isDark),
              const SizedBox(height: 32),

              // Skills Manager
              _buildSkillsSection(theme, 'Offering (I can teach)', offeringSkills, 'offering'),
              const SizedBox(height: 24),
              _buildSkillsSection(theme, 'Seeking (I want to learn)', seekingSkills, 'seeking'),
              const SizedBox(height: 32),

              // Portfolio items Showcase
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Portfolio Showcase',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: Icon(Icons.add_circle, color: theme.primaryColor),
                    onPressed: _showAddPortfolioModal,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _portfolio.isEmpty
                  ? _buildEmptyPlaceholder('No projects uploaded. Click "+" to showcase your work!')
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _portfolio.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = _portfolio[index];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF231C1A) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: theme.dividerColor),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    if (item.description != null && item.description!.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        item.description!,
                                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.red),
                                onPressed: () => _handleDeletePortfolioItem(item.id),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
              const SizedBox(height: 32),

              // Reviews Section
              const Text(
                'Recent Reviews',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _reviews.isEmpty
                  ? _buildEmptyPlaceholder('No reviews left yet.')
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _reviews.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final rev = _reviews[index];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF231C1A) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: theme.dividerColor),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    rev.reviewerProfile?.fullName ?? 'Anonymous',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const Spacer(),
                                  Row(
                                    children: List.generate(5, (starIdx) {
                                      return Icon(
                                        Icons.star,
                                        size: 14,
                                        color: starIdx < rev.rating ? Colors.amber : Colors.grey.withOpacity(0.3),
                                      );
                                    }),
                                  ),
                                ],
                              ),
                              if (rev.comment != null && rev.comment!.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  rev.comment!,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: theme.colorScheme.onBackground.withOpacity(0.8),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileInfo(ThemeData theme, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF231C1A) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('About Me', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.edit_outlined),
                onPressed: () => setState(() => _isEditing = true),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            (_profile?.bio == null || _profile!.bio!.trim().isEmpty)
                ? "Click edit to add a bio and tell the community about yourself!"
                : _profile!.bio!,
            style: TextStyle(
              fontSize: 14,
              color: theme.colorScheme.onBackground.withOpacity(0.8),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditForm(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        CustomTextField(controller: _nameController, labelText: 'Display Name'),
        const SizedBox(height: 16),
        CustomTextField(controller: _bioController, labelText: 'Bio', maxLines: 3),
        const SizedBox(height: 16),
        CustomTextField(controller: _locationController, labelText: 'City / Location'),
        const SizedBox(height: 20),

        // Switches
        SwitchListTile(
          title: const Text('Public Profile Visibility', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          subtitle: const Text('Allow other users to find you in Explore search results', style: TextStyle(fontSize: 12)),
          value: _isPublic,
          activeColor: theme.primaryColor,
          contentPadding: EdgeInsets.zero,
          onChanged: (bool val) => setState(() => _isPublic = val),
        ),
        SwitchListTile(
          title: const Text('Show Location', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          subtitle: const Text('Display your city on cards and chat screens', style: TextStyle(fontSize: 12)),
          value: _showLocation,
          activeColor: theme.primaryColor,
          contentPadding: EdgeInsets.zero,
          onChanged: (bool val) => setState(() => _showLocation = val),
        ),
        const SizedBox(height: 28),

        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: 'Cancel',
                isOutline: true,
                onPressed: () => setState(() => _isEditing = false),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: CustomButton(
                text: 'Save Changes',
                isLoading: _isSaving,
                onPressed: _saveProfileChanges,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSkillsSection(ThemeData theme, String title, List<UserSkill> skills, String type) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            IconButton(
              icon: Icon(Icons.add_circle_outline, color: theme.primaryColor, size: 20),
              onPressed: () => _showAddSkillSheet(type),
            ),
          ],
        ),
        const SizedBox(height: 8),
        skills.isEmpty
            ? _buildEmptyPlaceholder('No skills added. Click "+" to add some.')
            : Wrap(
                spacing: 10,
                runSpacing: 10,
                children: skills.map((us) {
                  return SkillChip(
                    label: us.skill?.name ?? 'Skill',
                    isOffering: type == 'offering',
                    onDelete: () => _handleRemoveSkill(us.id),
                  );
                }).toList(),
              ),
      ],
    );
  }

  Widget _buildEmptyPlaceholder(String msg) {
    return Text(
      msg,
      style: const TextStyle(fontSize: 13, color: Colors.grey, fontStyle: FontStyle.italic),
    );
  }
}
