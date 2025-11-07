import 'package:flutter/material.dart';

class AppColors {
  // PURE BLACK Theme - High Contrast
  static const Color black = Color(0xFF000000); // PURE BLACK
  static const Color cardDark = Color(0xFF111111); // Almost Black for Cards
  static const Color surfaceDark = Color(0xFF1A1A1A); // Dark Gray for subtle surfaces
  
  // Accent Colors
  static const Color accent = Color(0xFF00B4D8); // Vibrant Light Blue
  static const Color accentLight = Color(0xFF48CAE4); // Lighter Blue
  static const Color accentGlow = Color(0xFF90E0EF); // Glow Blue
  
  // White & Gray
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color gray = Color(0xFFAAAAAA);
  static const Color darkGray = Color(0xFF666666);
  
  // Text - High Contrast
  static const Color textPrimary = Color(0xFFFFFFFF); // Pure White
  static const Color textSecondary = Color(0xFFCCCCCC); // Light Gray
  static const Color textMuted = Color(0xFF999999); // Medium Gray
  
  // Status
  static const Color success = Color(0xFF00D4AA);
  static const Color warning = Color(0xFFFFAA00);
  static const Color error = Color(0xFFFF3D71);
  static const Color info = Color(0xFF0095FF);
}

class AppTheme {
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.black,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.accent,
      secondary: AppColors.accentLight,
      surface: AppColors.cardDark,
      background: AppColors.black,
      error: AppColors.error,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.black,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: false,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: AppColors.black,
        padding: const EdgeInsets.symmetric(vertical: 16),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.white,
        side: const BorderSide(color: AppColors.darkGray, width: 1.5),
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.darkGray.withOpacity(0.3), width: 1),
      ),
      color: AppColors.cardDark,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.cardDark,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.darkGray, width: 1),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.darkGray, width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.accent, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error, width: 1),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      labelStyle: const TextStyle(
        color: AppColors.textSecondary,
      ),
      hintStyle: const TextStyle(
        color: AppColors.textMuted,
      ),
    ),
  );
}
