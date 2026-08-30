import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import {
  toggleAds,
  getAdsEnabled,
  isAdPlatform,
  onSettingChanged,
  resetSession,
} from '../services/AdService';

type ThemeMode = 'system' | 'light' | 'dark';

export default function SettingsScreen() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [devMenuVisible, setDevMenuVisible] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(getAdsEnabled());

  const handleVersionTap = useCallback(() => {
    const next = versionTapCount + 1;
    setVersionTapCount(next);
    if (next >= 7) {
      setDevMenuVisible((prev) => !prev);
      setVersionTapCount(0);
    }
    // 3 saniye sonra sayacı sıfırla
    setTimeout(() => setVersionTapCount(0), 3000);
  }, [versionTapCount]);

  const handleAdsToggle = (value: boolean) => {
    setAdsEnabled(value);
    toggleAds(value);
    onSettingChanged(); // Ayar değişti → reklam tetikle
  };

  const themes: { icon: string; label: string; mode: ThemeMode }[] = [
    { icon: '☀️', label: 'Aydınlık', mode: 'light' },
    { icon: '🌙', label: 'Karanlık', mode: 'dark' },
    { icon: '📱', label: 'Sistem', mode: 'system' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Ayarlar</Text>
      <Text style={styles.subtitle}>Deneyiminizi özelleştirin</Text>

      {/* ── Tema ── */}
      <Text style={styles.sectionTitle}>Görünüm</Text>
      <View style={styles.card}>
        {themes.map((t, i) => (
          <Pressable
            key={t.mode}
            style={[styles.themeRow, i < themes.length - 1 && styles.themeRowBorder]}
            onPress={() => setThemeMode(t.mode)}
          >
            <Text style={styles.themeIcon}>{t.icon}</Text>
            <Text style={styles.themeLabel}>{t.label}</Text>
            {themeMode === t.mode && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* ── Hakkında ── */}
      <Text style={styles.sectionTitle}>Hakkında</Text>
      <View style={styles.card}>
        <InfoRow icon="ℹ️" label="Sürüm" value="v1.0.0" onPress={handleVersionTap} />
        <InfoRow icon="📱" label="İşlem" value="%100 Cihaz Üzerinde" />
        <InfoRow icon="🧠" label="AI Model" value="U2Net-Lite (TFLite)" />
        <InfoRow icon="📐" label="Model Çözünürlüğü" value="512×512" isLast />
      </View>

      {/* ── Gizli Geliştirici Menüsü ── */}
      {devMenuVisible && (
        <>
          <View style={styles.devHeader}>
            <Text style={styles.devIcon}>🔧</Text>
            <Text style={styles.devTitle}>Geliştirici Menüsü</Text>
          </View>
          <View style={styles.devCard}>
            {/* Reklam Durumu */}
            <View style={styles.devRow}>
              <Text style={styles.devRowLabel}>📢 Reklam Durumu</Text>
              {isAdPlatform ? (
                <Switch
                  value={adsEnabled}
                  onValueChange={handleAdsToggle}
                  trackColor={{ false: '#333', true: '#1A1A2E' }}
                  thumbColor={adsEnabled ? '#FFF' : '#666'}
                />
              ) : (
                <Text style={styles.devPlatformNote}>
                  Bu platformda{'\n'}reklam desteklenmiyor
                </Text>
              )}
            </View>

            {/* RAM Kullanımı */}
            <View style={styles.devRow}>
              <Text style={styles.devRowLabel}>💾 RAM Kullanımı</Text>
              <Text style={styles.devRowValue}>Bilgi mevcut değil</Text>
            </View>

            {/* Model Bilgisi */}
            <View style={styles.devRow}>
              <Text style={styles.devRowLabel}>📊 Model Bilgisi</Text>
              <Text style={styles.devRowValue}>U2Net-Lite{'\n'}Float32</Text>
            </View>

            {/* Önbellek Temizle */}
            <Pressable
              style={styles.devRowLast}
              onPress={() => Alert.alert('Önbellek', 'Önbellek temizlendi')}
            >
              <Text style={styles.devRowLabel}>🗑️ Önbelleği Temizle</Text>
              <Text style={styles.devRowArrow}>›</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  onPress,
  isLast = false,
}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      style={[styles.infoRow, !isLast && styles.infoRowBorder]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  contentContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#FFFFFF80', marginBottom: 28 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFFbb',
    marginBottom: 12,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 28,
  },

  // Theme
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  themeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  themeIcon: { fontSize: 16, marginRight: 12 },
  themeLabel: { flex: 1, fontSize: 14, color: '#FFFFFFbb' },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { fontSize: 11, color: '#FFF', fontWeight: '700' },

  // Info
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoIcon: { fontSize: 16, marginRight: 12 },
  infoLabel: { flex: 1, fontSize: 14, color: '#FFFFFFbb' },
  infoValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFFFFF60',
    textAlign: 'right',
  },

  // Developer Menu
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  devIcon: { fontSize: 14 },
  devTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  devCard: {
    backgroundColor: 'rgba(245,158,11,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.15)',
    marginBottom: 28,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,158,11,0.08)',
  },
  devRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  devRowLabel: { flex: 1, fontSize: 14, color: '#FFFFFFbb' },
  devRowValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#FFFFFF60',
    textAlign: 'right',
  },
  devRowArrow: { fontSize: 18, color: '#FFFFFF40' },
  devPlatformNote: {
    fontSize: 11,
    color: '#FFFFFF60',
    textAlign: 'right',
  },
});
