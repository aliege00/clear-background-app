import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useTheme } from '../services/themeService';

export default function BackgroundRemovalScreen() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const sliderPosition = useSharedValue(0.5);
  const screenWidth = Dimensions.get('window').width;

  const pickImage = async (fromCamera: boolean) => {
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Kamera izni gerekli');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 1,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Galeri izni gerekli');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 1,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setOriginalUri(result.assets[0].uri);
        setResultUri(null);
        setError(null);
        sliderPosition.value = 0.5;
      }
    } catch (e) {
      setError('Fotoğraf yüklenemedi');
    }
  };

  const processImage = async () => {
    if (!originalUri) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Gerçek implementasyonda react-native-fast-tflite kullanılır.
      // Şimdilik demo: 2 saniye bekle, sonra aynı görseli göster.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResultUri(originalUri);
    } catch (e) {
      setError('İşleme başarısız');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveImage = async () => {
    if (!resultUri) return;

    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(resultUri);
    } else {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Kaydetme izni gerekli');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(resultUri);
      Alert.alert('Kaydedildi', 'Galeriye kaydedildi');
    }
  };

  const shareImage = async () => {
    if (!resultUri) return;
    await Sharing.shareAsync(resultUri);
  };

  const reset = () => {
    setOriginalUri(null);
    setResultUri(null);
    setError(null);
    setShowComparison(false);
    sliderPosition.value = 0.5;
  };

  const toggleSlider = (x: number) => {
    sliderPosition.value = Math.max(0, Math.min(1, x / screenWidth));
  };

  const sliderStyle = useAnimatedStyle(() => ({
    clipPath: `inset(0 ${(1 - sliderPosition.value) * 100}% 0 0)`,
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    left: sliderPosition.value * screenWidth - 1,
  }));

  // ── Boş Durum: Yükleme Alanı ──
  if (!originalUri && !isProcessing) {
    return (
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0F0F14' : '#F8F9FB' }]}
      >
        <View style={[styles.uploadCard, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }]}>
          <View style={[styles.uploadIcon, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          }]}>
            <Text style={{ fontSize: 28 }}>📷</Text>
          </View>
          <Text style={[styles.uploadTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : '#1F2937' }]}>
            Fotoğrafınızı buraya seçin
          </Text>
          <Text style={[styles.uploadSubtitle, { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }]}>
            PNG, JPG, WebP desteklenir
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.pickButton, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              onPress={() => pickImage(false)}
            >
              <Text style={{ fontSize: 14 }}>🖼️</Text>
              <Text style={[styles.pickButtonText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)' }]}>
                Galeri
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickButton, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              onPress={() => pickImage(true)}
            >
              <Text style={{ fontSize: 14 }}>📸</Text>
              <Text style={[styles.pickButtonText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)' }]}>
                Kamera
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Özellik Badges */}
        <View style={styles.badgeRow}>
          {[
            { icon: '🔒', label: 'Tamamen\nÇevrimdışı' },
            { icon: '⚡', label: 'Anında\nİşlem' },
            { icon: '♾️', label: 'Sınırsız\nKullanım' },
          ].map((f) => (
            <View key={f.label} style={[styles.badge, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            }]}>
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</Text>
              <Text style={[styles.badgeText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // ── İşlem / Sonuç Durumu ──
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#0F0F14' : '#F8F9FB' }]}
    >
      <View style={[styles.imageContainer, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }]}>
        {resultUri && !isProcessing ? (
          // Before/After Slider
          <GestureDetector gesture={Gesture.Pan().onUpdate((e) => {
            runOnJS(toggleSlider)(e.absoluteX);
          })}>
            <View style={styles.sliderContainer}>
              {/* Sonuç (alt tabaka) */}
              <Image source={{ uri: resultUri }} style={styles.image} resizeMode="contain" />

              {/* Orijinal (üst tabaka, clip ile) */}
              <Animated.View style={[StyleSheet.absoluteFill, sliderStyle]}>
                <Image source={{ uri: originalUri! }} style={styles.image} resizeMode="contain" />
              </Animated.View>

              {/* Divider */}
              <Animated.View style={[styles.divider, dividerStyle]} />

              {/* Labels */}
              <View style={[styles.label, { left: 12 }]}>
                <Text style={styles.labelText}>Önce</Text>
              </View>
              <View style={[styles.label, { right: 12 }]}>
                <Text style={styles.labelText}>Sonra</Text>
              </View>
            </View>
          </GestureDetector>
        ) : isProcessing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#1A1A2E'} />
            <Text style={[styles.processingText, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }]}>
              Arka plan kaldırılıyor…
            </Text>
          </View>
        ) : (
          <Image source={{ uri: originalUri! }} style={styles.image} resizeMode="contain" />
        )}

        {/* Close button */}
        {!isProcessing && (
          <TouchableOpacity style={styles.closeButton} onPress={reset}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
          <Text style={{ color: '#EF4444', fontSize: 12 }}>{error}</Text>
        </View>
      )}

      {/* Buttons */}
      {resultUri && !isProcessing ? (
        <>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? '#fff' : '#1A1A2E' }]} onPress={saveImage}>
            <Text style={{ color: isDark ? '#000' : '#fff', fontSize: 14, fontWeight: '600' }}>
              📥 Kaydet
            </Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]} onPress={shareImage}>
              <Text style={{ color: isDark ? '#fff' : '#1A1A2E', fontSize: 13 }}>📤 Paylaş</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]} onPress={reset}>
              <Text style={{ color: isDark ? '#fff' : '#1A1A2E', fontSize: 13 }}>🔄 Yeni Fotoğraf</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : !isProcessing && originalUri ? (
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? '#fff' : '#1A1A2E' }]} onPress={processImage}>
          <Text style={{ color: isDark ? '#000' : '#fff', fontSize: 14, fontWeight: '600' }}>
            Arka Planı Kaldır
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  uploadCard: {
    borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed',
    paddingVertical: 52, paddingHorizontal: 24, alignItems: 'center',
  },
  uploadIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  uploadSubtitle: { fontSize: 12, marginBottom: 20 },
  pickButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  pickButtonText: { fontSize: 12, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  badge: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  badgeText: { fontSize: 11, fontWeight: '500', textAlign: 'center', lineHeight: 15 },
  imageContainer: {
    borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16,
    aspectRatio: 4 / 3,
  },
  image: { width: '100%', height: '100%' },
  sliderContainer: { flex: 1, position: 'relative' },
  divider: {
    position: 'absolute', top: 0, bottom: 0, width: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  label: {
    position: 'absolute', top: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  labelText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  closeButton: {
    position: 'absolute', top: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  processingText: { fontSize: 13, marginTop: 12 },
  errorBanner: {
    padding: 12, borderRadius: 12, marginBottom: 12,
  },
  primaryButton: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10,
  },
  secondaryButton: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    borderWidth: 1,
  },
});
