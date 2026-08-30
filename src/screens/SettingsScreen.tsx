import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTheme, ThemeMode, setThemeMode } from '../services/themeService';
import { adMobService } from '../services/adMobService';

export default function SettingsScreen() {
  const { mode, resolved } = useTheme();
  const isDark = resolved === 'dark';

  const [versionTapCount, setVersionTapCount] = useState(0);
  const [devMenuVisible, setDevMenuVisible] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);

  const onVersionTap = useCallback(() => {
    setVersionTapCount((prev) => {
      const next = prev + 1;
      if (next >= 7) {
        setDevMenuVisible((v) => !v);
        return 0;
      }
      // 3 saniye sonra sıfırla
      setTimeout(() => setVersionTapCount(0), 3000);
      return next;
    });
  }, []);

  const handleAdsToggle = (value: boolean) => {
    setAdsEnabled(value);
    adMobService.toggleAds(value);
    adMobService.onSettingChanged(); // Ayar değişti → reklam tetikle
  };

  const clearCache = () => {
    // Gerçek implementasyonda AsyncStorage temizleme + model cache temizleme
  };

  const themes: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Aydınlık', icon: '☀️' },
    { mode: 'dark', label: 'Karanlık', icon: '🌙' },
    { mode: 'system', label: 'Sistem', icon: '📱' },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0F0F14' : '#F8F9FB' }]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#1A1A2E' }]}>Ayarlar</Text>
      <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
        Deneyiminizi özelleştirin
      </Text>

      {/* Tema Seçimi */}
      <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
        Görünüm
      </Text>
      <View style={[styles.card, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }]}>
        {themes.map((t, i) => (
          <TouchableOpacity
            key={t.mode}
            style={[styles.themeRow, i < themes.length - 1 && {
              borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            }]}
            onPress={() => setThemeMode(t.mode)}
          >
            <Text style={{ fontSize: 18, marginRight: 12 }}>{t.icon}</Text>
            <Text style={[styles.themeLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
              {t.label}
            </Text>
            {mode === t.mode && (
              <View style={styles.checkmark}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Hakkında */}
      <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937', marginTop: 28 }]}>
        Hakkında
      </Text>
      <View style={[styles.card, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }]}>
        <TouchableOpacity style={styles.infoRow} onPress={onVersionTap}>
          <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>Sürüm</Text>
          <Text style={[styles.infoValue, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }]}>
            v1.0.0
          </Text>
        </TouchableOpacity>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>İşlem</Text>
          <Text style={[styles.infoValue, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }]}>
            %100 Cihaz Üzerinde
          </Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>AI Model</Text>
          <Text style={[styles.infoValue, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }]}>
            TFLite U2Net
          </Text>
        </View>
      </View>

      {/* Gizli Geliştirici Menüsü */}
      {devMenuVisible && (
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Text style={{ fontSize: 14 }}>🔧</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#F59E0B' }}>Geliştirici Menüsü</Text>
          </View>

          <View style={[styles.devCard, { borderColor: 'rgba(245,158,11,0.15)' }]}>
            {/* Reklam Durumu */}
            <View style={styles.devRow}>
              <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
                📢 Reklam Durumu
              </Text>
              <Switch
                value={adsEnabled}
                onValueChange={handleAdsToggle}
                trackColor={{ false: '#767577', true: '#1A1A2E' }}
                thumbColor="#fff"
              />
            </View>

            {/* Model Bilgisi */}
            <View style={styles.devRow}>
              <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
                🧠 Model Bilgisi
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', textAlign: 'right' }]}>
                U2Net-Lite{'\n'}TFLite Float32
              </Text>
            </View>

            {/* Önbellek Temizle */}
            <TouchableOpacity style={[styles.devRow, { borderBottomWidth: 0 }]} onPress={clearCache}>
              <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
                🗑️ Önbelleği Temizle
              </Text>
              <Text style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  themeLabel: { fontSize: 14, flex: 1 },
  checkmark: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#1A1A2E',
    justifyContent: 'center', alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 12, fontFamily: 'monospace' },
  devCard: {
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  devRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(245,158,11,0.08)',
  },
});
