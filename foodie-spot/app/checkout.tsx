import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import api, { orderAPI } from "@/services/api";

export default function CheckoutScreen() {
    const { items, restaurantId, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const deliveryFee = totalPrice >= 25 ? 0 : 2.99;
    const total = totalPrice + deliveryFee;

    // Adresse par défaut de l'utilisateur
    const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<{ discount: number; message: string } | null>(null);
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    const handleConfirmOrder = async () => {
        if (!restaurantId) {
            Alert.alert('Erreur', 'Aucun restaurant sélectionné');
            return;
        }

        if (!defaultAddress) {
            Alert.alert(
                'Adresse manquante',
                'Veuillez ajouter une adresse de livraison dans votre profil'
            );
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map(item => ({
                menuItemId: item.dish.id,
                quantity: item.quantity,
            }));

            const order = await orderAPI.createOrder({
                restaurantId,
                items: orderItems,
                deliveryAddress: defaultAddress,
                paymentMethod: 'card',
            });

            clearCart();

            // Cela permet de naviguer vers le suivi de la commande
            router.replace(`/tracking/${order.id}`);
        } catch (error) {
            console.log('erreur création commande:', error);
            Alert.alert('Erreur', 'Impossible de passer la commande, réessayez');
        } finally {
            setLoading(false);
        }
    };

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError('');
        setPromoResult(null);

        try {
            const response = await api.post('/promos/validate', {
                code: promoCode.trim(),
                subtotal: totalPrice,
            });
            const result = response.data?.data;
            setPromoResult({
                discount: result.discountAmount,
                message: result.message || 'Code promo appliqué !',
            });
        } catch (error: any) {

            // Celle-ci permet d'afficher le message d'erreur du backend
            const msg = error.response?.data?.message || 'Code invalide';
            setPromoError(msg);
        } finally {
            setPromoLoading(false);
       }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Confirmer la commande</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* adresse de livraison */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Adresse de livraison</Text>
                    {defaultAddress ? (
                        <View style={styles.addressCard}>
                            <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
                            <Text style={styles.addressText}>
                                {defaultAddress.street}, {defaultAddress.city}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.noAddress}>
                            Aucune adresse — ajoutez-en une dans votre profil
                        </Text>
                    )}
                </View>

                {/* récapitulatif */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Récapitulatif</Text>
                    {items.map(item => (
                        <View key={item.dish.id} style={styles.orderItem}>
                            <Text style={styles.orderItemName}>
                                {item.quantity}x {item.dish.name}
                            </Text>
                            <Text style={styles.orderItemPrice}>
                                {(item.dish.price * item.quantity).toFixed(2)} €
                            </Text>
                        </View>
                    ))}
                </View>

                {/* total */}
                <View style={styles.section}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Sous-total</Text>
                        <Text style={styles.totalValue}>{totalPrice.toFixed(2)} €</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Livraison</Text>
                        <Text style={[styles.totalValue, deliveryFee === 0 && styles.free]}>
                            {deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} €`}
                        </Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>Total</Text>
                        <Text style={styles.grandTotalValue}>{total.toFixed(2)} €</Text>
                    </View>
                </View>
            </ScrollView>

            
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                    onPress={handleConfirmOrder}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.confirmButtonText}>
                            Confirmer et payer {total.toFixed(2)} €
                          </Text>
                    }
                </TouchableOpacity>
            </View>
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
    content: {
        padding: 16,
        gap: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    addressCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
    },
    addressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF6B35',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#444',
    },
    noAddress: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderItemName: {
        fontSize: 14,
        color: '#444',
        flex: 1,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    free: {
        color: '#4CAF50',
    },
    grandTotalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        marginTop: 4,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    grandTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});