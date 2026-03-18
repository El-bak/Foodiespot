import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '@/services/storage';

// Voici les 3 modes possibles pour le thème : clair, sombre ou suivre le système
export type ThemeMode = 'light' | 'dark' | 'system';

// Voici les couleurs pour chaque thème
export interface AppColors {
    background: string;
    backgroundSecondary: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    inputBg: string;
}

const LIGHT: AppColors = {
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    card: '#ffffff',
    text: '#111111',
    textSecondary: '#666666',
    border: '#f0f0f0',
    primary: '#FF6B35',
    inputBg: '#f5f5f5',
};

const DARK: AppColors = {
    background: '#121212',
    backgroundSecondary: '#1e1e1e',
    card: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#333333',
    primary: '#FF6B35',
    inputBg: '#2a2a2a',
};

interface ThemeContextType {
    themeMode: ThemeMode;
    isDark: boolean;
    colors: AppColors;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {

        // Cela permet de charger le thème sauvegardé au démarrage
        storage.getItem<ThemeMode>('themeMode').then(saved => {
            if (saved) setThemeModeState(saved);
        });
    }, []);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);

        // Cela permet de sauvegarder le choix de l'utilisateur
        storage.setItem('themeMode', mode);
    };

    // Cela permet de déterminer si le thème est sombre ou clair en fonction du choix de l'utilisateur et du thème système
    const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && systemScheme === 'dark');

    const colors = isDark ? DARK : LIGHT;

    return (
        <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme doit être dans ThemeProvider');
    return ctx;
}