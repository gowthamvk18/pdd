import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color clayLight = Color(0xFF8B7355);
  static const Color backgroundLight = Color(0xFFFAF8F5);
  static const Color cardLight = Color(0xFFECE6DC);
  static const Color foregroundLight = Color(0xFF2E2521);
  static const Color accentLight = Color(0xFFCEBD9C);
  static const Color mutedLight = Color(0xFFF5F1EB);
  static const Color borderLight = Color(0x1A2E2521);

  static const Color clayDark = Color(0xFFCEBD9C);
  static const Color backgroundDark = Color(0xFF181311);
  static const Color cardDark = Color(0xFF231C1A);
  static const Color foregroundDark = Color(0xFFF7F4F0);
  static const Color accentDark = Color(0xFF5E4E3A);
  static const Color mutedDark = Color(0xFF2B2320);
  static const Color borderDark = Color(0x1AF7F4F0);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: clayLight,
    scaffoldBackgroundColor: backgroundLight,
    cardColor: cardLight,
    colorScheme: const ColorScheme.light(
      primary: clayLight,
      secondary: accentLight,
      surface: cardLight,
      background: backgroundLight,
      onPrimary: Colors.white,
      onSecondary: foregroundLight,
      onSurface: foregroundLight,
      onBackground: foregroundLight,
      outline: borderLight,
    ),
    textTheme: GoogleFonts.figtreeTextTheme(ThemeData.light().textTheme).copyWith(
      displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      displaySmall: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      headlineLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      headlineMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      headlineSmall: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      titleLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      titleMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
      titleSmall: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundLight),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundLight,
      foregroundColor: foregroundLight,
      elevation: 0,
    ),
    dividerColor: borderLight,
    cardTheme: const CardThemeData(
      color: cardLight,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: clayDark,
    scaffoldBackgroundColor: backgroundDark,
    cardColor: cardDark,
    colorScheme: const ColorScheme.dark(
      primary: clayDark,
      secondary: accentDark,
      surface: cardDark,
      background: backgroundDark,
      onPrimary: Colors.black,
      onSecondary: foregroundDark,
      onSurface: foregroundDark,
      onBackground: foregroundDark,
      outline: borderDark,
    ),
    textTheme: GoogleFonts.figtreeTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      displaySmall: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      headlineLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      headlineMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      headlineSmall: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      titleLarge: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      titleMedium: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
      titleSmall: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: foregroundDark),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundDark,
      foregroundColor: foregroundDark,
      elevation: 0,
    ),
    dividerColor: borderDark,
    cardTheme: const CardThemeData(
      color: cardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
    ),
  );
}
