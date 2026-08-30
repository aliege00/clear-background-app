import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'arka-theme';
type Listener = () => void;
const listeners: Set<Listener> = new Set();
let currentMode: ThemeMode = 'system';

export function getThemeMode(): ThemeMode { return currentMode; }

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') currentMode = stored;
  } catch {}
  return currentMode;
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  currentMode = mode;
  try { await AsyncStorage.setItem(STORAGE_KEY, mode); } catch {}
  listeners.forEach((l) => l());
}

export function subscribeTheme(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTheme() {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(currentMode);
  useEffect(() => { loadThemeMode().then(setMode); }, []);
  useEffect(() => { return subscribeTheme(() => setMode({ ...currentMode } as ThemeMode)); }, []);
  const resolved = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  return { mode, resolved, setMode: setThemeMode };
}
