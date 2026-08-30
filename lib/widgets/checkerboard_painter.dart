import 'package:flutter/material.dart';

/// Draws a light checkerboard pattern to visualize transparency.
class CheckerboardPainter extends CustomPainter {
  final bool isDark;
  final double squareSize;

  CheckerboardPainter({required this.isDark, this.squareSize = 12});

  @override
  void paint(Canvas canvas, Size size) {
    final lightColor = isDark
        ? const Color(0xFF2A2A32)
        : const Color(0xFFE8E8E8);
    final darkColor = isDark
        ? const Color(0xFF222228)
        : const Color(0xFFD8D8D8);

    final paint = Paint()..style = PaintingStyle.fill;

    for (double y = 0; y < size.height; y += squareSize) {
      for (double x = 0; x < size.width; x += squareSize) {
        final isEven = ((x / squareSize).floor() + (y / squareSize).floor()) % 2 == 0;
        paint.color = isEven ? lightColor : darkColor;
        canvas.drawRect(
          Rect.fromLTWH(x, y, squareSize, squareSize),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CheckerboardPainter oldDelegate) {
    return oldDelegate.isDark != isDark;
  }
}
