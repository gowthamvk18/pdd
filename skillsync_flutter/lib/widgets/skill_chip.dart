import 'package:flutter/material.dart';

class SkillChip extends StatelessWidget {
  final String label;
  final bool isOffering; // true for offering, false for seeking
  final VoidCallback? onDelete;

  const SkillChip({
    Key? key,
    required this.label,
    this.isOffering = true,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Offering styles (Secondary)
    final Color offeringBg = isDark
        ? const Color(0xFFCEBD9C).withOpacity(0.15)
        : const Color(0xFF8B7355).withOpacity(0.12);
    final Color offeringText = isDark ? const Color(0xFFCEBD9C) : const Color(0xFF8B7355);
    final Color offeringBorder = offeringText.withOpacity(0.3);

    // Seeking styles (Primary)
    final Color seekingBg = theme.primaryColor.withOpacity(0.12);
    final Color seekingText = theme.primaryColor;
    final Color seekingBorder = seekingText.withOpacity(0.3);

    final Color bg = isOffering ? offeringBg : seekingBg;
    final Color text = isOffering ? offeringText : seekingText;
    final Color border = isOffering ? offeringBorder : seekingBorder;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: text,
            ),
          ),
          if (onDelete != null) ...[
            const SizedBox(width: 6),
            GestureDetector(
              onTap: onDelete,
              child: Icon(
                Icons.close,
                size: 14,
                color: text.withOpacity(0.7),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
