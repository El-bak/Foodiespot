import { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react-native";
import { useCart } from "@/contexts/cart-context";
import { CartItem } from "@/types";
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';

export default function CartScreen() {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

    // Cela c'est pour les frais de livraison - gratuit au dessus de 25€
    const deliveryFee = totalPrice >= 25 ? 0 : 2.99;
    const total = totalPrice + deliveryFee;
    const { t } = useLanguage();
    const { colors } = useTheme();

    const handleClearCart = () => {
        Alert.alert(
            'Vider le panier',
            'Êtes-vous sûr de vouloir vider votre panier ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Vider', style: 'destructive', onPress: () => clearCart() },
            ]
        );
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={[styles.item, { backgroundColor: colors.card }]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.dish.name}</Text>
                <Text style={styles.itemPrice}>{(item.dish.price * item.quantity).toFixed(2)} €</Text>
            </View>
            <View style={styles.itemControls}>
                <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.inputBg }]}
                    onPress={() => updateQuantity(item.dish.id, item.quantity - 1)}
                >
                    {item.quantity === 1
                        ? <Trash2 size={14} color="#FF6B35" />
                        : <Minus size={14} color="#333" />
                    }
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.inputBg }]}
                    onPress={() => updateQuantity(item.dish.id, item.quantity + 1)}
                >
                    <Plus size={14} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
            
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Mon panier ({totalItems})</Text>
                {items.length > 0 && (
                    <TouchableOpacity onPress={handleClearCart}>
                        <Trash2 size={20} color="#FF6B35" />
                    </TouchableOpacity>
                )}
            </View>

            {items.length === 0 ? (

                // panier vide
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Votre panier est vide</Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={styles.browseButtonText}>Voir les restaurants</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.dish.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                    />

                    {/* Cela c'est pour le résumé de la commande */}
                    <View style={[styles.summary, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.subtotal}</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalPrice.toFixed(2)} €</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{t.delivery}</Text>
                            <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeDelivery]}>
                                {deliveryFee === 0 ? t.freeDelivery : `${deliveryFee.toFixed(2)} €`}
                            </Text>
                        </View>
                        {deliveryFee > 0 && (
                            <Text style={styles.freeDeliveryHint}>
                                Encore {(25 - totalPrice).toFixed(2)} € pour la livraison gratuite
                            </Text>
                        )}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={[styles.totalLabel, { color: colors.text }]}>{t.total}</Text>
                            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={() => router.push('/checkout')}
                        >
                            <Text style={styles.checkoutButtonText}>Commander</Text>
                        </TouchableOpacity>
                    </View>
                </>
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    list: {
        padding: 16,
        gap: 12,
    },
    item: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '700',
    },
    itemControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    qtyBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 15,
        fontWeight: '700',
        minWidth: 20,
        textAlign: 'center',
    },
    summary: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    freeDelivery: {
        color: '#4CAF50',
    },
    freeDeliveryHint: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        marginTop: 4,
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
    },
    checkoutButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});