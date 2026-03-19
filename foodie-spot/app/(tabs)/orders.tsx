import { OrderCard } from "@/components/order-card";
import { orderAPI } from "@/services/api";
import { Order } from "@/types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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


    return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <Text style={styles.title}>Mes Commandes</Text>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        ) : (
            <FlatList
                data={orders}
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
                        <Text style={styles.emptyText}>Aucune commande trouvée.</Text>
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
    }
});