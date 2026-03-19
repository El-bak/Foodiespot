import { useEffect, useState, useRef } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { Colors } from "@/constants/theme";
import { restaurantAPI } from "@/services/api";
import { Restaurant, SearchFilters } from "@/types";
import { Filter, Search } from "lucide-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { storage, STORAGE_KEYS } from '@/services/storage';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const { colors } = useTheme();
    const { t } = useLanguage();

    // ref pour stocker le timer du debounce
    const debounceTimer = useRef<any>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    //debounce 400ms pour ne pas appeler l'API à chaque lettre tapée
useEffect(() => {
    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
        loadRestaurants();
    }, 400);

    return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
}, [query, filters]);

useEffect(() => {

    // charger les catégories depuis l'API au lieu de les hardcoder
    restaurantAPI.getCategories().then((data) => {
        const names = data.map((cat: any) => cat.name);
        setCategories(names);
    });

    // charger les recherches récentes depuis le stockage local
    storage.getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES).then(saved => {
        if (saved) setRecentSearches(saved);
    });
}, []);

    const loadRestaurants = async () => {
        if (query) {

            if (!recentSearches.includes(query)) {
               const updated = [query, ...recentSearches].slice(0, 5); // max 5
               setRecentSearches(updated);
               await storage.setItem(STORAGE_KEYS.RECENT_SEARCHES, updated);
            }
            const data = await restaurantAPI.searchRestaurants(query);
            setRestaurants(data);
        } else {
            const data = await restaurantAPI.getRestaurants(filters);
            setRestaurants(data);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search size={24} color={Colors.light.text} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t.searchPlaceholder}
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                    <Filter size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            {
                showFilters && (
                    <View style={styles.filters}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories.map((cuisine) => (
                                <TouchableOpacity
                                    key={cuisine}
                                    style={[styles.filterChip, filters.cuisine === cuisine && styles.filterChipActive]}
                                    onPress={() => setFilters({ ...filters, cuisine: filters.cuisine === cuisine ? undefined : cuisine })}>
                                    <Text style={[styles.filterChipText, filters.cuisine === cuisine && styles.filterChipTextActive]}>{cuisine}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )
            }

            {/* recherches récentes - visible seulement si le champ est vide */}
            {query === '' && recentSearches.length > 0 && (
               <View style={styles.recentSection}>
                   <Text style={styles.recentTitle}>{t.recentSearches}</Text>
                   {recentSearches.map((search, index) => (
                       <TouchableOpacity
                           key={index}
                           style={styles.recentItem}
                           onPress={() => setQuery(search)}
                    >
                           <Text style={styles.recentText}>{search}</Text>
                       </TouchableOpacity>
                    ))}
    </View> 
)}

            <FlatList
    data={restaurants}
    keyExtractor={(item) => item.id}
    style={styles.content}
    ListHeaderComponent={
        <Text style={styles.resultsText}>
            {restaurants.length} {t.restaurantsFound}
        </Text>
    }
    renderItem={({ item }) => (
        <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
        />
    )}
    ListEmptyComponent={
        <Text style={styles.emptyText}>{t.noResults}</Text>
    }
/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    recentSection: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    recentTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    recentItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
   },
    recentText: {
        fontSize: 15,
        color: '#333',
    },
    filterChipActive: {
        backgroundColor: '#FF6B35',
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 24,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        padding: 8,
    },
    filters: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 14,
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
});