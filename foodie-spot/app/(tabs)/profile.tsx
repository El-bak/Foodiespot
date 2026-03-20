import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Heart, ShoppingBag, Phone, Share2, Camera, ChevronRight, LogOut } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '@/contexts/language-context';

import { userAPI, uploadAPI, orderAPI } from '@/services/api';
import type { User } from '@/types';
import log from '@/services/logger';
import  { useToast } from '@/components/toast-provider';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ProfileScreen() {

  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const { user: authUser,logout } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const { language, setLanguage, t } = useLanguage();
  
  
  // remplace les deux useEffect par celui-ci
  useFocusEffect(
      useCallback(() => {
          loadUser();
          orderAPI.getOrders().then(orders => setOrderCount(orders.length));
          userAPI.getFavorites().then(favs => setFavoriteCount(favs.length));
          userAPI.getAddresses().then(addresses => setAddressCount(addresses.length));
      },   [])
  );


  const loadUser = async () => {

    try {
        const fresh = await userAPI.getProfile();
        if (fresh) {
            setUser(fresh);
            return;
        }
    } catch (error) {
        log.error('Failed to fetch profile:', error);
    }

    const userData = await userAPI.getCurrentUser();
    log.info('Loaded user data:', toast, userData);
    
    // ensure favoriteRestaurants is always an array
    setUser(userData ? { ...userData, favoriteRestaurants: userData.favoriteRestaurants || [] } : null);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Nous avons besoin d'accéder à vos photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos', 'livePhotos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        const imageUrl = await uploadAPI.uploadImage(result.assets[0].uri, 'profile');
        await userAPI.updateProfile({ photo: imageUrl });
        await loadUser();
        toast.success('Photo de profil mise à jour !'); 
      } catch (error) {
        log.error('Failed to upload profile photo:', error);
        Alert.alert('Erreur', 'Impossible de télécharger la photo');
      }
    }
  };
  

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (!user) {
      return (
          <SafeAreaView style={styles.container}>
              <View style={styles.loading}>
                  <ActivityIndicator size="large" color="#FF6B35" />
              </View>
          </SafeAreaView>
     );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{(user.firstName || user.email || '?').charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.phone}>{user.phone}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orderCount}</Text>
            <Text style={styles.statLabel}>{t.orders}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>{t.favorites}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t.reviews}</Text>
          </View>
        </View>

        <View style={styles.menuItem}>
            <Text style={styles.menuText}>Langue</Text>
            <View style={styles.menuRight}>
                <TouchableOpacity
                    style={[styles.themeBtn, language === 'fr' && styles.themeBtnActive]}
                    onPress={() => setLanguage('fr')}
                >
                    <Text style={styles.themeBtnText}>🇫🇷</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.themeBtn, language === 'en' && styles.themeBtnActive]}
                    onPress={() => setLanguage('en')}
                >
                    <Text style={styles.themeBtnText}>🇬🇧</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} 
               onPress={() => router.push('/addresses')}>
              <MapPin size={20} color="#666" />
              <Text style={styles.menuText}>{t.myAddresses}</Text>

            <View style={styles.menuRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{addressCount}</Text>
              </View>
              <ChevronRight size={18} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')}>
            <Heart size={20} color="#666" />
            <Text style={styles.menuText}>{t.myFavorites}</Text>
            <View style={styles.menuRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoriteCount}</Text>
              </View>
              <ChevronRight size={18} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/orders')}>
            <ShoppingBag size={20} color="#666" />
            <Text style={styles.menuText}>{t.history}</Text>
            <ChevronRight size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Phone size={20} color="#666" />
            <Text style={styles.menuText}>{t.support}</Text>
            <ChevronRight size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Share2 size={20} color="#666" />
            <Text style={styles.menuText}>{t.shareApp}</Text>
            <ChevronRight size={18} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
              <Text style={styles.menuText}>{t.appearance}</Text>
              <View style={styles.menuRight}>

                  <TouchableOpacity
                      style={[styles.themeBtn, themeMode === 'light' && styles.themeBtnActive]}
                      onPress={() => setThemeMode('light')}
                  >
                      <Text style={styles.themeBtnText}>☀️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={[styles.themeBtn, themeMode === 'system' && styles.themeBtnActive]}
                      onPress={() => setThemeMode('system')}
                  >
                      <Text style={styles.themeBtnText}>📱</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={[styles.themeBtn, themeMode === 'dark' && styles.themeBtnActive]}
                      onPress={() => setThemeMode('dark')}
                  >
                      <Text style={styles.themeBtnText}>🌙</Text>
                  </TouchableOpacity>
              </View>
           </View>

           <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
               <LogOut size={20} color="#FF6B35" />
               <Text style={[styles.menuText, styles.logoutText]}>{t.logout}</Text>
           </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: '#999',
  },
  themeBtn: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
  },
  themeBtnActive: {
      backgroundColor: '#FFE5DB',
  },
  themeBtnText: {
      fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FFE5DB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});


