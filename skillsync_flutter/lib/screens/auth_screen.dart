import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/supabase_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_textfield.dart';
import 'onboarding_screen.dart';
import 'main_navigation.dart';

class AuthScreen extends StatefulWidget {
  final bool initialIsSignUp;

  const AuthScreen({Key? key, this.initialIsSignUp = false}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  late bool _isSignUp;
  bool _usePhone = false;
  bool _isLoading = false;
  String? _errorMessage;

  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _isSignUp = widget.initialIsSignUp;
  }

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final supabaseService = Provider.of<SupabaseService>(context, listen: false);

    try {
      if (_isSignUp) {
        if (_usePhone) {
          await supabaseService.signUpWithPhone(
            _phoneController.text,
            _passwordController.text,
          );
        } else {
          await supabaseService.signUpWithEmail(
            _emailController.text,
            _passwordController.text,
          );
        }
      } else {
        if (_usePhone) {
          await supabaseService.signInWithPhone(
            _phoneController.text,
            _passwordController.text,
          );
        } else {
          await supabaseService.signInWithEmail(
            _emailController.text,
            _passwordController.text,
          );
        }
      }

      // Check if user has completed onboarding (if they have a full name set)
      if (mounted) {
        final userId = supabaseService.currentUser?.id;
        if (userId != null) {
          final profile = await supabaseService.getProfile(userId);
          
          if (!mounted) return;
          if (profile?.fullName == null || profile!.fullName!.trim().isEmpty) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const OnboardingScreen()),
              (route) => false,
            );
          } else {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const MainNavigation()),
              (route) => false,
            );
          }
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  _isSignUp ? 'Join SkillSync' : 'Welcome back',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _isSignUp
                      ? 'Create an account to start trading skills.'
                      : 'Enter your details to access your account.',
                  style: TextStyle(
                    color: theme.textTheme.bodyLarge?.color?.withOpacity(0.6),
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 32),

                // Email / Phone Toggle
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: theme.brightness == Brightness.dark
                        ? const Color(0xFF231C1A)
                        : const Color(0xFFECE6DC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: theme.dividerColor,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _usePhone = false;
                              _errorMessage = null;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: !_usePhone
                                  ? (theme.brightness == Brightness.dark
                                      ? const Color(0xFF181311)
                                      : Colors.white)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: !_usePhone
                                  ? [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      )
                                    ]
                                  : null,
                            ),
                            child: Text(
                              'Email',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: !_usePhone
                                    ? theme.colorScheme.onBackground
                                    : theme.colorScheme.onBackground.withOpacity(0.5),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _usePhone = true;
                              _errorMessage = null;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: _usePhone
                                  ? (theme.brightness == Brightness.dark
                                      ? const Color(0xFF181311)
                                      : Colors.white)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: _usePhone
                                  ? [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      )
                                    ]
                                  : null,
                            ),
                            child: Text(
                              'Phone Number',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _usePhone
                                    ? theme.colorScheme.onBackground
                                    : theme.colorScheme.onBackground.withOpacity(0.5),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Form Fields
                if (!_usePhone) ...[
                  CustomTextField(
                    controller: _emailController,
                    labelText: 'Email Address',
                    hintText: 'name@example.com',
                    prefixIcon: Icons.mail_outline,
                    keyboardType: TextInputType.emailAddress,
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'Email is required';
                      }
                      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(val.trim())) {
                        return 'Enter a valid email address';
                      }
                      return null;
                    },
                  ),
                ] else ...[
                  CustomTextField(
                    controller: _phoneController,
                    labelText: 'Phone Number',
                    hintText: '+1234567890',
                    prefixIcon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'Phone number is required';
                      }
                      if (!val.trim().startsWith('+')) {
                        return 'Include country code starting with +';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Include country code prefix (e.g. +91 for India, +1 for USA)',
                    style: TextStyle(
                      fontSize: 11,
                      color: theme.colorScheme.onBackground.withOpacity(0.4),
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                CustomTextField(
                  controller: _passwordController,
                  labelText: 'Password',
                  hintText: '••••••••',
                  prefixIcon: Icons.lock_outline,
                  obscureText: true,
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return 'Password is required';
                    }
                    if (val.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Errors Display
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.withOpacity(0.3)),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Action Button
                CustomButton(
                  text: _isSignUp ? 'Create Account' : 'Sign In',
                  isLoading: _isLoading,
                  onPressed: _handleSubmit,
                ),
                const SizedBox(height: 24),

                // Toggle Sign In / Sign Up
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _isSignUp ? 'Already have an account? ' : "Don't have an account? ",
                      style: TextStyle(
                        color: theme.colorScheme.onBackground.withOpacity(0.6),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _isSignUp = !_isSignUp;
                          _errorMessage = null;
                        });
                      },
                      child: Text(
                        _isSignUp ? 'Sign In' : 'Sign Up',
                        style: TextStyle(
                          color: theme.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
