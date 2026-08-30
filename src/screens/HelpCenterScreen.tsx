import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

const FAQS = [
  {
    q: 'Arka plan kaldırma nasıl çalışır?',
    a: 'Uygulama, cihazınızda çalışan bir yapay zeka modeli (TFLite + U2Net) kullanır. Fotoğrafınızdaki kişiyi veya nesneyi tespit edip arka planından ayırır. Tüm işlemler cihazınızda yapılır — fotoğraflarınız hiçbir sunucuya gönderilmez.',
  },
  {
    q: 'Neden hızlı?',
    a: 'Yapay zeka modeli, cihazınızın GPU\'sunu kullanarak optimize edilmiştir. Görüntüler işlenmeden önce makul bir çözünürlüğe küçültülür, böylece düşük bütçeli cihazlarda bile akıcı çalışır.',
  },
  {
    q: 'Verilerim özel mi?',
    a: 'Kesinlikle. Tüm işlemler cihazınızda gerçekleştirilir. Fotoğraflarınız hiçbir sunucuya gönderilmez, saklanmaz veya paylaşılmaz.',
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const shareApp = () => {
    // Platform'a göre Share API
    //现实中 import Share from 'react-native-share'
    console.log('Paylaş');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Yardım Merkezi</Text>
      <Text style={styles.subtitle}>Arka Plan hakkında bilmeniz gereken her şey</Text>

      {/* Quick Start */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hızlı Başlangıç</Text>
        {[
          'Arka Plan sekmesine gidin ve bir fotoğraf yükleyin',
          '"Arka Planı Kaldır" butonuna dokunun',
          'Öncesi/Sonrası karşılaştırın, kaydedin veya paylaşın',
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* FAQ */}
      <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
      {FAQS.map((faq, i) => (
        <Pressable
          key={i}
          style={styles.faqCard}
          onPress={() => setExpandedIndex(expandedIndex === i ? null : i)}
        >
          <View style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqArrow}>{expandedIndex === i ? '▾' : '▸'}</Text>
          </View>
          {expandedIndex === i && (
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          )}
        </Pressable>
      ))}

      {/* Share */}
      <View style={styles.shareCard}>
        <Text style={styles.shareEmoji}>📤</Text>
        <Text style={styles.shareTitle}>Arkadaşınla paylaş</Text>
        <Text style={styles.shareSubtitle}>Bu ücretsiz aracı keşfetmesine yardım et</Text>
        <Pressable style={styles.shareButton} onPress={shareApp}>
          <Text style={styles.shareButtonText}>Arka Plan'ı Paylaş</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  contentContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#FFFFFF80', marginBottom: 24 },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    marginBottom: 28,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 14 },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  stepText: { fontSize: 13, color: '#FFFFFF88', lineHeight: 18, flex: 1 },

  // FAQ
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  faqCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 6,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFFbb',
  },
  faqArrow: { fontSize: 14, color: '#FFFFFF40' },
  faqAnswer: {
    marginTop: 10,
    paddingLeft: 26,
    fontSize: 12.5,
    lineHeight: 20,
    color: '#FFFFFF70',
  },

  // Share
  shareCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    alignItems: 'center',
    marginTop: 28,
  },
  shareEmoji: { fontSize: 28, marginBottom: 14 },
  shareTitle: { fontSize: 14, fontWeight: '500', color: '#FFF', marginBottom: 4 },
  shareSubtitle: { fontSize: 12, color: '#FFFFFF60', marginBottom: 16 },
  shareButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shareButtonText: { fontSize: 13, color: '#FFF' },
});
