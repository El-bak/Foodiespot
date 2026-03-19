import { OrderCard } from "@/components/order-card";
import { orderAPI } from "@/services/api";
import { Order } from "@/types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
    const { colors } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await orderAPI.getOrders();
            setOrders(data);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    }

    const getFilteredOrders = () => {
        switch (activeTab) {
            case 'active':
               return orders.filter(o =>
                   ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'on-the-way'].includes(o.status)
               );
           case 'delivered':
               return orders.filter(o => o.status === 'delivered');
           case 'cancelled':
               return orders.filter(o => o.status === 'cancelled');
           default:
               return orders;
        }
    };


    return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t.myOrders}</Text>
        </View>

        
        <View style={[styles.tabs, { backgroundColor: colors.card }]}>
            {[
                { key: 'all', label: t.tabAll },
                { key: 'active', label: t.tabActive },
                { key: 'delivered', label: t.tabDelivered },
                { key: 'cancelled', label: t.tabCancelled },
            ].map(tab => (

                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                    onPress={() => setActiveTab(tab.key as any)}
                >
                    <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        ) : (
            <FlatList
                data={getFilteredOrders()}
                keyExtractor={(item) => item.id}
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onPress={() => {
                            if (['on-the-way', 'preparing', 'delivering', 'picked_up', 'confirmed', 'pending'].includes(item.status)) {
                                router.push(`/tracking/${item.id}`);
                            } else if (item.status === 'delivered') {
                                 router.push(`/review/${item.id}?restaurantId=${item.restaurantId}`);
                            }
                        }}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🛍️</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.noOrders}</Text>
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
        backgroundColor: '#f0f0f0',
    },
    header: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF6B35',
    },
    tabText: {
        fontSize: 13,
        color: '#999',
    },
    tabTextActive: {
        color: '#FF6B35',
        fontWeight: '600',
    },
});