import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/supabase_service.dart';
import '../models/profile.dart';
import '../models/skill.dart';
import '../widgets/custom_button.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({Key? key}) : super(key: key);

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final _searchController = TextEditingController();
  final _locationController = TextEditingController();

  String _searchQuery = '';
  String _locationQuery = '';
  String _selectedCategory = 'All';
  String _sortBy = 'newest'; // 'newest' or 'rating'
  bool _isLoading = true;

  List<Map<String, dynamic>> _allUsers = [];
  final Set<String> _sentRequests = {};

  final List<String> _categories = [
    'All',
    'Programming',
    'Design',
    'Languages',
    'Music',
    'Art',
    'Cooking',
    'Fitness'
  ];

  @override
  void initState() {
    super.initState();
    _fetchUsers();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text;
      });
    });
    _locationController.addListener(() {
      setState(() {
        _locationQuery = _locationController.text;
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _fetchUsers() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final list = await service.exploreUsers(userId);
      setState(() {
        _allUsers = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load explore list: $e')),
        );
      }
    }
  }

  Future<void> _handleConnect(String targetUserId) async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final userId = service.currentUser?.id;
    if (userId == null) return;

    try {
      await service.requestMatch(userId, targetUserId);
      setState(() {
        _sentRequests.add(targetUserId);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connection request sent!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send request: $e')),
      );
    }
  }

  List<Map<String, dynamic>> _getFilteredUsers() {
    var list = List<Map<String, dynamic>>.from(_allUsers);

    // Filter by category
    if (_selectedCategory != 'All') {
      list = list.where((user) {
        final skills = user['skills'] as List<Skill>;
        return skills.any((s) => s.category.toLowerCase() == _selectedCategory.toLowerCase());
      }).toList();
    }

    // Filter by location query
    if (_locationQuery.isNotEmpty) {
      list = list.where((user) {
        final profile = user['profile'] as Profile;
        return (profile.location ?? '').toLowerCase().contains(_locationQuery.toLowerCase());
      }).toList();
    }

    // Filter by text search query
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      list = list.where((user) {
        final profile = user['profile'] as Profile;
        final skills = user['skills'] as List<Skill>;

        final nameMatch = (profile.fullName ?? '').toLowerCase().contains(query);
        final bioMatch = (profile.bio ?? '').toLowerCase().contains(query);
        final skillMatch = skills.any((s) => s.name.toLowerCase().contains(query));

        return nameMatch || bioMatch || skillMatch;
      }).toList();
    }

    // Sort users
    if (_sortBy == 'newest') {
      // In a real application, sort by profiles.created_at
      list.sort((a, b) {
        final aProfile = a['profile'] as Profile;
        final bProfile = b['profile'] as Profile;
        return (bProfile.createdAt ?? '').compareTo(aProfile.createdAt ?? '');
      });
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filteredUsers = _getFilteredUsers();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Explore Skills',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Column(
                children: [
                  // Search & Filters Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12),
                    child: Column(
                      children: [
                        // Search textfield
                        TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Search skills or keywords...',
                            prefixIcon: const Icon(Icons.search),
                            filled: true,
                            fillColor: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Sub filters
                        Row(
                          children: [
                            // Location filter
                            Expanded(
                              child: TextField(
                                controller: _locationController,
                                decoration: InputDecoration(
                                  hintText: 'Filter by city...',
                                  prefixIcon: const Icon(Icons.location_on_outlined, size: 20),
                                  filled: true,
                                  fillColor: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
                                  contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Sort dropdown
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _sortBy,
                                  icon: const Icon(Icons.arrow_drop_down),
                                  onChanged: (String? val) {
                                    if (val != null) {
                                      setState(() {
                                        _sortBy = val;
                                      });
                                    }
                                  },
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'newest',
                                      child: Text('Newest'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'rating',
                                      child: Text('Rating'),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Horizontal Category Bar
                  SizedBox(
                    height: 50,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final cat = _categories[index];
                        final isSelected = _selectedCategory == cat;
                        return ChoiceChip(
                          label: Text(cat),
                          selected: isSelected,
                          onSelected: (_) {
                            setState(() {
                              _selectedCategory = cat;
                            });
                          },
                          selectedColor: theme.primaryColor,
                          labelStyle: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : theme.colorScheme.onBackground,
                          ),
                          backgroundColor: isDark ? const Color(0xFF2B2320) : Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(
                              color: isSelected ? theme.primaryColor : theme.dividerColor,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),

                  // User Cards Grid List
                  Expanded(
                    child: filteredUsers.isEmpty
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(32.0),
                              child: Text(
                                'No users match your filters. Try selecting a different skill or city!',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Colors.grey),
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            itemCount: filteredUsers.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              final item = filteredUsers[index];
                              final prof = item['profile'] as Profile;
                              final skills = item['skills'] as List<Skill>;
                              final isSent = _sentRequests.contains(prof.id);

                              return Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF231C1A) : Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: theme.dividerColor),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.02),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    )
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 24,
                                          backgroundImage: prof.avatarUrl != null
                                              ? NetworkImage(prof.avatarUrl!)
                                              : null,
                                          child: prof.avatarUrl == null
                                              ? Text(prof.fullName?.substring(0, 1).toUpperCase() ?? 'U')
                                              : null,
                                        ),
                                        const SizedBox(width: 14),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                prof.fullName ?? 'SkillSync Buddy',
                                                style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 16),
                                              ),
                                              const SizedBox(height: 2),
                                              Row(
                                                children: [
                                                  const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    prof.showLocation ? (prof.location ?? 'No location') : 'Location hidden',
                                                    style: const TextStyle(
                                                        fontSize: 12,
                                                        color: Colors.grey),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      prof.bio ?? 'This user has not set a bio yet.',
                                      style: TextStyle(
                                          fontSize: 14,
                                          color: theme.colorScheme.onBackground.withOpacity(0.7),
                                          height: 1.4),
                                    ),
                                    const SizedBox(height: 16),

                                    // Skills they teach
                                    const Text(
                                      'They can teach:',
                                      style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey,
                                          letterSpacing: 1),
                                    ),
                                    const SizedBox(height: 8),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: skills.map((s) {
                                        return Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: theme.primaryColor.withOpacity(0.1),
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            s.name,
                                            style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: theme.primaryColor),
                                          ),
                                        );
                                      }).toList(),
                                    ),
                                    const SizedBox(height: 20),

                                    // Action Button
                                    CustomButton(
                                      text: isSent ? 'Request Sent' : 'Request Connection',
                                      color: isSent ? Colors.green : null,
                                      onPressed: isSent
                                          ? null
                                          : () => _handleConnect(prof.id),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
    );
  }
}
