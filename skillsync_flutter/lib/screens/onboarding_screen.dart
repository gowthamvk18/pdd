import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/supabase_service.dart';
import '../models/skill.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_textfield.dart';
import 'main_navigation.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _step = 1;
  bool _isLoading = true;
  bool _isSaving = false;

  String _fullName = '';
  final _nameController = TextEditingController();

  List<Skill> _allSkills = [];
  final List<String> _selectedOffers = []; // Skill IDs
  final List<String> _selectedSeeks = [];  // Skill IDs

  @override
  void initState() {
    super.initState();
    _fetchSkills();
    _nameController.addListener(() {
      setState(() {
        _fullName = _nameController.text;
      });
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _fetchSkills() async {
    final supabaseService = Provider.of<SupabaseService>(context, listen: false);
    try {
      final skills = await supabaseService.getAllSkills();
      setState(() {
        _allSkills = skills;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load skills: $e')),
        );
      }
    }
  }

  void _toggleSkill(String id, List<String> list) {
    setState(() {
      if (list.contains(id)) {
        list.remove(id);
      } else {
        if (list.length >= 3) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('You can only select up to 3 skills.')),
          );
          return;
        }
        list.add(id);
      }
    });
  }

  Future<void> _handleComplete() async {
    final supabaseService = Provider.of<SupabaseService>(context, listen: false);
    final userId = supabaseService.currentUser?.id;
    if (userId == null) return;

    setState(() {
      _isSaving = true;
    });

    try {
      // 1. Save Offering Skills
      for (final skillId in _selectedOffers) {
        await supabaseService.addUserSkill(userId, skillId, 'offering');
      }

      // 2. Save Seeking Skills
      for (final skillId in _selectedSeeks) {
        await supabaseService.addUserSkill(userId, skillId, 'seeking');
      }

      // 3. Update Full Name in Profile
      await supabaseService.updateProfile(userId, {
        'full_name': _fullName.trim().isEmpty ? 'New User' : _fullName.trim(),
      });

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const MainNavigation()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save details: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Step Progress Indicator
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                children: [
                  Expanded(child: _buildProgressBar(1)),
                  const SizedBox(width: 8),
                  Expanded(child: _buildProgressBar(2)),
                  const SizedBox(width: 8),
                  Expanded(child: _buildProgressBar(3)),
                ],
              ),
            ),

            // Content Panel
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: _buildStepContent(theme),
              ),
            ),

            // Floating Navigation Footer
            _buildNavigationFooter(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar(int step) {
    final theme = Theme.of(context);
    final isActive = _step >= step;
    return Container(
      height: 6,
      decoration: BoxDecoration(
        color: isActive ? theme.primaryColor : theme.dividerColor,
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }

  Widget _buildStepContent(ThemeData theme) {
    if (_step == 1) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          const Text(
            'Welcome to SkillSync!',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            "Let's start with your name. How should the community call you?",
            style: TextStyle(
              fontSize: 16,
              color: theme.textTheme.bodyLarge?.color?.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 40),
          CustomTextField(
            controller: _nameController,
            labelText: 'Full Name',
            hintText: 'e.g. Alex Rivera',
            prefixIcon: Icons.person_outline,
            validator: (val) => val == null || val.trim().isEmpty ? 'Name is required' : null,
          ),
        ],
      );
    } else if (_step == 2) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          const Text(
            'What can you teach?',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'Select up to 3 skills you are proficient in and can offer to others.',
            style: TextStyle(
              fontSize: 16,
              color: theme.textTheme.bodyLarge?.color?.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 10,
            runSpacing: 12,
            children: _allSkills.map((skill) {
              final isSelected = _selectedOffers.contains(skill.id);
              return FilterChip(
                label: Text(skill.name),
                selected: isSelected,
                onSelected: (_) => _toggleSkill(skill.id, _selectedOffers),
                selectedColor: theme.primaryColor.withOpacity(0.12),
                checkmarkColor: theme.primaryColor,
                labelStyle: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? theme.primaryColor : theme.colorScheme.onBackground,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(
                    color: isSelected ? theme.primaryColor : theme.dividerColor,
                    width: 1.5,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      );
    } else {
      final offeringNames = _selectedOffers
          .map((id) => _allSkills.firstWhere((s) => s.id == id).name)
          .join(', ');
      final seekingNames = _selectedSeeks
          .map((id) => _allSkills.firstWhere((s) => s.id == id).name)
          .join(', ');

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          const Text(
            'What do you want to learn?',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'Select up to 3 skills you are looking to acquire from the community.',
            style: TextStyle(
              fontSize: 16,
              color: theme.textTheme.bodyLarge?.color?.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 10,
            runSpacing: 12,
            children: _allSkills.map((skill) {
              final isSelected = _selectedSeeks.contains(skill.id);
              return FilterChip(
                label: Text(skill.name),
                selected: isSelected,
                onSelected: (_) => _toggleSkill(skill.id, _selectedSeeks),
                selectedColor: theme.primaryColor.withOpacity(0.12),
                checkmarkColor: theme.primaryColor,
                labelStyle: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? theme.primaryColor : theme.colorScheme.onBackground,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(
                    color: isSelected ? theme.primaryColor : theme.dividerColor,
                    width: 1.5,
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 40),

          // Setup Summary Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: theme.brightness == Brightness.dark
                  ? const Color(0xFF231C1A)
                  : const Color(0xFFF5F1EB),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: theme.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Setup Summary',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildSummaryRow('Name', _fullName),
                const SizedBox(height: 12),
                _buildSummaryRow('Offering', offeringNames.isEmpty ? 'None selected' : offeringNames),
                const SizedBox(height: 12),
                _buildSummaryRow('Learning', seekingNames.isEmpty ? 'None selected' : seekingNames),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      );
    }
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            '$label:',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationFooter(ThemeData theme) {
    final double paddingBottom = MediaQuery.of(context).padding.bottom > 0
        ? MediaQuery.of(context).padding.bottom
        : 16;

    return Container(
      padding: EdgeInsets.fromLTRB(24, 16, 24, paddingBottom),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        border: Border(top: BorderSide(color: theme.dividerColor)),
      ),
      child: Row(
        children: [
          if (_step > 1) ...[
            CustomButton(
              text: 'Back',
              isOutline: true,
              onPressed: () {
                setState(() {
                  _step--;
                });
              },
            ),
            const SizedBox(width: 16),
          ],
          Expanded(
            child: CustomButton(
              text: _step == 3 ? 'Finish Setup' : 'Next Step',
              isLoading: _isSaving,
              onPressed: _isNextDisabled()
                  ? null
                  : () {
                      if (_step < 3) {
                        setState(() {
                          _step++;
                        });
                      } else {
                        _handleComplete();
                      }
                    },
            ),
          ),
        ],
      ),
    );
  }

  bool _isNextDisabled() {
    if (_step == 1) return _fullName.trim().isEmpty;
    if (_step == 2) return _selectedOffers.isEmpty;
    if (_step == 3) return _selectedSeeks.isEmpty;
    return false;
  }
}
