import 'package:flutter/material.dart';

class CoachScreen extends StatefulWidget {
  const CoachScreen({Key? key}) : super(key: key);

  @override
  State<CoachScreen> createState() => _CoachScreenState();
}

class _CoachScreenState extends State<CoachScreen> {
  final _chatController = TextEditingController();
  final List<Map<String, String>> _chatMessages = [
    {
      'sender': 'coach',
      'text': "Hi! I am your SkillSync AI Coach. Tell me what skill you'd like to learn or improve, and I'll help analyze your gaps or construct a personalized weekly roadmap!"
    }
  ];

  bool _isTyping = false;
  String _selectedSkill = 'Flutter Development';
  bool _showRoadmap = false;

  final List<String> _skillsList = [
    'Flutter Development',
    'React & Frontend',
    'Figma & UI/UX Design',
    'Backend (NodeJS/Supabase)',
    'Python & Machine Learning'
  ];

  // Map of Roadmap Steps for each skill and their checked states
  late Map<String, List<Map<String, dynamic>>> _roadmaps;

  @override
  void initState() {
    super.initState();
    _initRoadmaps();
  }

  void _initRoadmaps() {
    _roadmaps = {
      'Flutter Development': [
        {'title': 'Week 1: Dart Basics & Basic Widgets', 'checked': true},
        {'title': 'Week 2: State Management (Provider/Riverpod)', 'checked': false},
        {'title': 'Week 3: Database Integrations & Supabase SDK', 'checked': false},
        {'title': 'Week 4: Layout Design, Custom Animations & Publishing', 'checked': false},
      ],
      'React & Frontend': [
        {'title': 'Week 1: React Hooks (useState, useEffect, custom Hooks)', 'checked': true},
        {'title': 'Week 2: State Controllers & TailwindCSS Styling', 'checked': true},
        {'title': 'Week 3: API Connections & Routing', 'checked': false},
        {'title': 'Week 4: Testing & Hosting (Vercel/Netlify)', 'checked': false},
      ],
      'Figma & UI/UX Design': [
        {'title': 'Week 1: Wireframing & Grid systems', 'checked': false},
        {'title': 'Week 2: Auto-Layout & Design Components', 'checked': false},
        {'title': 'Week 3: Interactive Mock Prototyping', 'checked': false},
        {'title': 'Week 4: Design hand-off & developer documentation', 'checked': false},
      ],
      'Backend (NodeJS/Supabase)': [
        {'title': 'Week 1: REST API setups & Express routing', 'checked': false},
        {'title': 'Week 2: Relational Databases & Schema Migrations', 'checked': false},
        {'title': 'Week 3: Supabase Authentication & Security Policies', 'checked': false},
        {'title': 'Week 4: Serverless Functions & Redis Caching', 'checked': false},
      ],
      'Python & Machine Learning': [
        {'title': 'Week 1: Numpy, Pandas & Matplotlib analysis', 'checked': false},
        {'title': 'Week 2: Supervised Learning (Scikit-Learn)', 'checked': false},
        {'title': 'Week 3: Neural Networks & PyTorch Fundamentals', 'checked': false},
        {'title': 'Week 4: Deploying models via FastAPI web services', 'checked': false},
      ],
    };
  }

  double _getRoadmapProgress(String skill) {
    final steps = _roadmaps[skill] ?? [];
    if (steps.isEmpty) return 0.0;
    final checkedCount = steps.where((s) => s['checked'] == true).length;
    return checkedCount / steps.length;
  }

  void _handleSendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _chatMessages.add({'sender': 'user', 'text': text});
      _chatController.clear();
      _isTyping = true;
    });

    // Simulate AI response
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      
      String response = "Excellent query. To pick up or refine that, I recommend focusing on structured weekly tasks. You can use my Roadmap Generator below to map out a clear pathway!";
      if (text.toLowerCase().contains('flutter')) {
        response = "Flutter uses Dart. Focus on understanding the widget tree, state builders, and supabase service wrappers. Check out the 'Flutter Development' roadmap below.";
      } else if (text.toLowerCase().contains('design') || text.toLowerCase().contains('figma')) {
        response = "For UI/UX, practice wireframing on grids and using auto-layouts in Figma. I've created a custom 'Figma & UI/UX Design' roadmap for you below.";
      }

      setState(() {
        _chatMessages.add({'sender': 'coach', 'text': response});
        _isTyping = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'AI Career Coach',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Chat messages panel
            Expanded(
              flex: 3,
              child: Container(
                color: isDark ? const Color(0xFF181311) : const Color(0xFFFAF8F5),
                child: ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: _chatMessages.length + (_isTyping ? 1 : 0),
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    if (index == _chatMessages.length && _isTyping) {
                      return Align(
                        alignment: Alignment.centerLeft,
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF231C1A) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: theme.dividerColor),
                          ),
                          child: const Text('Coach is typing...', style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
                        ),
                      );
                    }

                    final msg = _chatMessages[index];
                    final isUser = msg['sender'] == 'user';
                    return Align(
                      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.75,
                        ),
                        decoration: BoxDecoration(
                          color: isUser
                              ? theme.primaryColor
                              : (isDark ? const Color(0xFF231C1A) : Colors.white),
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(0),
                            bottomRight: isUser ? const Radius.circular(0) : const Radius.circular(16),
                          ),
                          border: isUser ? null : Border.all(color: theme.dividerColor),
                        ),
                        child: Text(
                          msg['text'] ?? '',
                          style: TextStyle(
                            fontSize: 14,
                            color: isUser ? Colors.white : theme.colorScheme.onBackground,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Chat input bar
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
                      controller: _chatController,
                      decoration: InputDecoration(
                        hintText: 'Ask the Coach for advice...',
                        hintStyle: const TextStyle(fontSize: 14),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF2B2320) : const Color(0xFFF5F1EB),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _handleSendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: theme.primaryColor,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 18),
                      onPressed: _handleSendMessage,
                    ),
                  ),
                ],
              ),
            ),

            // Roadmap Constructor Panel
            const Divider(height: 1),
            Expanded(
              flex: 4,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Roadmap Generator',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Pick a skill and construct your personalized weekly roadmap.',
                      style: TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),

                    // Skill selector drop down
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF231C1A) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: theme.dividerColor),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: _selectedSkill,
                          onChanged: (String? val) {
                            if (val != null) {
                              setState(() {
                                _selectedSkill = val;
                                _showRoadmap = false; // Reset view until user hits generate
                              });
                            }
                          },
                          items: _skillsList.map((skill) {
                            return DropdownMenuItem(
                              value: skill,
                              child: Text(skill),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Generate Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _showRoadmap = true;
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.brightness == Brightness.dark
                              ? Colors.white
                              : Colors.black,
                          foregroundColor: theme.brightness == Brightness.dark
                              ? Colors.black
                              : Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Generate Weekly Roadmap', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Generated Checklist
                    if (_showRoadmap) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '$_selectedSkill Roadmap',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            '${(_getRoadmapProgress(_selectedSkill) * 100).toStringAsFixed(0)}% Complete',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: theme.primaryColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Progress Bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: _getRoadmapProgress(_selectedSkill),
                          minHeight: 8,
                          backgroundColor: theme.dividerColor,
                          valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Roadmap steps checklists
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _roadmaps[_selectedSkill]?.length ?? 0,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, idx) {
                          final step = _roadmaps[_selectedSkill]![idx];
                          final isChecked = step['checked'] as bool;
                          return Container(
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF231C1A) : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: theme.dividerColor),
                            ),
                            child: CheckboxListTile(
                              title: Text(
                                step['title'] as String,
                                style: TextStyle(
                                  fontSize: 14,
                                  decoration: isChecked ? TextDecoration.lineThrough : null,
                                  color: isChecked ? Colors.grey : theme.colorScheme.onBackground,
                                ),
                              ),
                              value: isChecked,
                              activeColor: theme.primaryColor,
                              onChanged: (bool? val) {
                                setState(() {
                                  _roadmaps[_selectedSkill]![idx]['checked'] = val ?? false;
                                });
                              },
                              controlAffinity: ListTileControlAffinity.leading,
                            ),
                          );
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
