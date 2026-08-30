import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../services/themeService';

const FAQS = [
  {
    q: 'Arka plan kaldırma nasıl çalışır?',
    a: 'Uygulama, cihazınızda çalışan bir yapay zeka modeli kullanır. TFLite tabanlı U2Net modeli, fotoğrafınızdaki kişiyi veya nesneyi tespit edip arka planından ayırır. Tüm işlemler cihazınızda yapılır.',
  },
  {
    q: 'Neden hızlı?',
    a: 'Yapay zeka modeli cihazınızın GPU\'sunu kullanarak donanım hızlandırması sağlar. Görüntüler işlenmeden önce makul bir çözünürlüğe küçültülür.',
  },
  {
    q: 'Verilerim özel mi?',
    a: 'Kesinlikle. Tüm işlemler cihazınızın kendi processorunda gerçekleşir. Fotoğraflarınız hiçbir sunucuya gönderilmez.',
  },
  {
    q: 'İnternet bağlantısı gerekiyor mu?',
    a: 'Hayır. Yapay zeka modeli uygulama ile birlikte yüklenir. Bundan sonra uygulama tamamen çevrimdışı çalışır.',
  },
  {
    q: 'Hangi formatlar destekleniyor?',
    a: 'PNG, JPG/JPEG ve WebP formatları desteklenir. Çıktı her zaman şeffaf arka planlı PNG dosyasıdır.',
  },
];

export default function HelpCenterScreen() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const shareApp = async () => {
    try {
      await Sharing.shareAsync('https://play.google.com/store/apps/details?id=com.arkaplan.app', {
        dialogTitle: 'Arka Plan Uygulaması',
      });
    } catch {}
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0F0F14' : '#F8F9FB' }]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#1A1A2E' }]}>Yardım Merkezi</Text>
      <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
        Arka Plan hakkında bilmeniz gereken her şey
      </Text>

      {/* Quick Start */}
      <View style={[styles.card, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1F2937' }]}>Hızlı Başlangıç</Text>
        {[
          'Arka Plan sekmesine gidin ve bir fotoğraf yükleyin',
          '"Arka Planı Kaldır" butonuna dokunun',
          'Öncesi/Sonrası karşılaştırın, kaydedin veya paylaşın',
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* FAQ */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1A1A2E' }]}>Sıkça Sorulan Sorular</Text>
      {FAQS.map((faq, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.faqItem, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }]}
          onPress={() => setExpandedIndex(expandedIndex === i ? null : i)}
        >
          <View style={styles.faqHeader}>
            <Text style={[styles.faqQuestion, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
              {faq.q}
            </Text>
            <Text style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }}>
              {expandedIndex === i ? '▲' : '▼'}
            </Text>
          </View>
          {expandedIndex === i && (
            <Text style={[styles.faqAnswer, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
              {faq.a}
            </Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Share */}
      <View style={[styles.shareCard, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }]}>
        <Text style={{ fontSize: 32, marginBottom: 12 }}>📤</Text>
        <Text style={[styles.shareTitle, { color: isDark ? '#fff' : '#1F2937' }]}>
          Arkadaşınla paylaş
        </Text>
        <Text style={[styles.shareSubtitle, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }]}>
          Bu ücretsiz aracı keşfetmesine yardım et
        </Text>
        <TouchableOpacity style={[styles.shareButton, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]} onPress={shareApp}>
          <Text style={{ color: isDark ? '#fff' : '#1A1A2E', fontSize: 13, fontWeight: '500' }}>
            📤 Arka Plan'ı Paylaş
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 28 },
  cardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  stepBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#1A1A2E',
    justifyContent: 'center', alignItems: 'center',
  },
  stepText: { fontSize: 13, lineHeight: 19, flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  faqItem: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 6 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },
  faqAnswer: { fontSize: 12.5, lineHeight: 20, marginTop: 10, paddingLeft: 0 },
  shareCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  shareTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  shareSubtitle: { fontSize: 12, marginBottom: 16 },
  shareButton: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10 },
});
