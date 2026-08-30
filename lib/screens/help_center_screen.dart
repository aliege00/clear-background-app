import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  int? _expandedIndex;

  static const _faqs = [
    _FaqItem(
      icon: Icons.content_cut_outlined,
      question: 'Arka plan kaldırma nasıl çalışır?',
      answer:
          'Uygulama, cihazınızda çalışan bir yapay zeka modeli kullanır. '
          'Fotoğrafınızdaki kişiyi veya nesneyi tespit edip arka planından '
          'ayırmak için TFLite tabanlı U2Net modelini çalıştırır. Tüm '
          'işlemler cihazınızda yapılır — fotoğraflarınız hiçbir sunucuya '
          'gönderilmez.',
    ),
    _FaqItem(
      icon: Icons.speed_outlined,
      question: 'Neden hızlı?',
      answer:
          'Yapay zeka modeli, cihazınızın donanım hızlandırmalı GPU\'sunu '
          'kullanarak optimizasyon sağlar. Görüntüler işlenmeden önce makul '
          'bir çözünürlüğe (1024px) küçültülür, böylece düşük bütçeli '
          'cihazlarda bile akıcı çalışır.',
    ),
    _FaqItem(
      icon: Icons.shield_outlined,
      question: 'Verilerim özel mi?',
      answer:
          'Kesinlikle. Tüm işlemler cihazınızın kendi processorunda '
          'gerçekleşir. Fotoğraflarınız hiçbir sunucuya gönderilmez, '
          'saklanmaz veya paylaşılmaz. Uygulama tamamen çevrimdışı çalışır.',
    ),
    _FaqItem(
      icon: Icons.wifi_off_outlined,
      question: 'İnternet bağlantısı gerekiyor mu?',
      answer:
          'Hayır. Yapay zeka modeli uygulama ile birlikte yüklenir. '
          'Bundan sonra uygulama tamamen çevrimdışı çalışır.',
    ),
    _FaqItem(
      icon: Icons.image_outlined,
      question: 'Hangi formatlar destekleniyor?',
      answer:
          'Uygulama PNG, JPG/JPEG ve WebP formatlarını destekler. Çıktı '
          'her zaman şeffaf arka planlı PNG dosyasıdır.',
    ),
    _FaqItem(
      icon: Icons.phone_android_outlined,
      question: 'En iyi sonuçlar için?',
      answer:
          'Model, aydınlık ve arka planından net şekilde ayrılabilen '
          'kişilerin fotoğraflarında en iyi sonucu verir.',
    ),
  ];

  void _shareApp() async {
    try {
      await Share.share(
        'Arka Plan — Ücretsiz, sınırsız, çevrimdışı arka plan kaldırma uygulaması!\n\n'
        'https://play.google.com/store/apps/details?id=com.arkaplan.app',
        subject: 'Arka Plan Uygulaması',
      );
    } catch (e) {
      // iptal
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Yardım Merkezi',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Arka Plan hakkında bilmeniz gereken her şey',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
          ),
          const SizedBox(height: 24),

          // Hızlı başlangıç
          _buildQuickStart(context, isDark),
          const SizedBox(height: 28),

          // SSS başlık
          Text(
            'Sıkça Sorulan Sorular',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),

          // SSS maddeleri
          ...List.generate(_faqs.length, (i) => _buildFaqItem(i, isDark)),

          const SizedBox(height: 28),

          // Paylaş kartı
          _buildShareCard(isDark),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildQuickStart(BuildContext context, bool isDark) {
    return _buildCard(
      isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hızlı Başlangıç',
            style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 14),
          _step('1', 'Arka Plan sekmesine gidin ve bir fotoğraf yükleyin'),
          _step('2', '"Arka Planı Kaldır" butonuna dokunun'),
          _step('3', 'Öncesi/Sonrası karşılaştırın, kaydedin veya paylaşın'),
        ],
      ),
    );
  }

  Widget _step(String num, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22, height: 22,
            decoration: const BoxDecoration(
              color: Color(0xFF1A1A2E), shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                num,
                style: const TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13, height: 1.4,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.white60
                    : Colors.black54,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFaqItem(int index, bool isDark) {
    final faq = _faqs[index];
    final isExpanded = _expandedIndex == index;

    return GestureDetector(
      onTap: () => setState(() => _expandedIndex = isExpanded ? null : index),
      child: _buildCard(
        isDark,
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Row(
              children: [
                Icon(faq.icon, size: 16, color: isDark ? Colors.white38 : Colors.black38),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    faq.question,
                    style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ),
                AnimatedRotation(
                  turns: isExpanded ? 0.5 : 0,
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    Icons.keyboard_arrow_down, size: 18,
                    color: isDark ? Colors.white26 : Colors.black12,
                  ),
                ),
              ],
            ),
            if (isExpanded) ...[
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.only(left: 26),
                child: Text(
                  faq.answer,
                  style: TextStyle(
                    fontSize: 12.5, height: 1.6,
                    color: isDark ? Colors.white45 : Colors.black45,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildShareCard(bool isDark) {
    return _buildCard(
      isDark,
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.share_outlined, size: 20,
              color: isDark ? Colors.white54 : Colors.black38,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Arkadaşınla paylaş',
            style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w500,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Bu ücretsiz aracı keşfetmesine yardım et',
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.white38 : Colors.black38,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _shareApp,
            icon: const Icon(Icons.share_outlined, size: 16),
            label: const Text('Arka Plan\'ı Paylaş', style: TextStyle(fontSize: 13)),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(
    bool isDark, {
    required Widget child,
    EdgeInsets? padding,
  }) {
    return Container(
      width: double.infinity,
      padding: padding ?? const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.06),
        ),
      ),
      child: child,
    );
  }
}

class _FaqItem {
  final IconData icon;
  final String question;
  final String answer;
  const _FaqItem({
    required this.icon,
    required this.question,
    required this.answer,
  });
}
