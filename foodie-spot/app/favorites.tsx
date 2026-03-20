import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { userAPI } from '@/services/api';
import { RestaurantCard } from '@/components/restaurant-card';
import { Restaurant } from '@/types';
import { useTheme } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const data = await userAPI.getFavorites();
            setFavorites(data);
        } catch (error) {
            console.log('erreur chargement favoris:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Mes favoris</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <RestaurantCard
                            restaurant={item}
                            onPress={() => router.push(`/restaurant/${item.id}`)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>❤️</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun restaurant en favori</Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => router.replace('/(tabs)')}
                            >
                                <Text style={styles.browseButtonText}>Découvrir des restaurants</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    list: {
        padding: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    browseButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 8,
    },
    browseButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});