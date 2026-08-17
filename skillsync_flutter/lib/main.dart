import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'theme.dart';
import 'services/supabase_service.dart';
import 'screens/landing_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase using your live credentials
  await Supabase.initialize(
    url: 'https://owmrcsutrjhzmcykgoub.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXJjc3V0cmpoem1jeWtnb3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjUwNDUsImV4cCI6MjA5MzI0MTA0NX0.POjD6ErXQ1I7FxqS8NsNLXM46AFbHvf4DWTSMSLU5QA',
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SupabaseService()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const SkillSyncApp(),
    ),
  );
}

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;

  ThemeMode get themeMode => _themeMode;

  void toggleTheme(bool isDark) {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }
}

class SkillSyncApp extends StatelessWidget {
  const SkillSyncApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      title: 'SkillSync',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      home: const InitialRouter(),
    );
  }
}

class InitialRouter extends StatefulWidget {
  const InitialRouter({Key? key}) : super(key: key);

  @override
  State<InitialRouter> createState() => _InitialRouterState();
}

class _InitialRouterState extends State<InitialRouter> {
  bool _loading = true;
  Widget _targetScreen = const LandingScreen();

  @override
  void initState() {
    super.initState();
    _determineStartScreen();
  }

  Future<void> _determineStartScreen() async {
    final service = Provider.of<SupabaseService>(context, listen: false);
    final user = service.currentUser;

    if (user == null) {
      setState(() {
        _targetScreen = const LandingScreen();
        _loading = false;
      });
      return;
    }

    try {
      final profile = await service.getProfile(user.id);
      if (profile == null || profile.fullName == null || profile.fullName!.trim().isEmpty) {
        setState(() {
          _targetScreen = const OnboardingScreen();
          _loading = false;
        });
      } else {
        setState(() {
          _targetScreen = const MainNavigation();
          _loading = false;
        });
      }
    } catch (e) {
      setState(() {
        _targetScreen = const LandingScreen();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.swap_calls,
                      color: Theme.of(context).primaryColor,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'SkillSync',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const CircularProgressIndicator(),
            ],
          ),
        ),
      );
    }

    return _targetScreen;
  }
}
