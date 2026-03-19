import { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { Order } from "@/types";
import { orderAPI } from "@/services/api";
import { ArrowLeft } from "lucide-react-native";

export default function TrackingScreen() {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Cela va pouvoir permettre de stocker l'interval du polling
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        loadOrder();

        intervalRef.current = setInterval(() => {
            loadOrder();
        }, 10000);

        // Cela va permettre de nettoyer l'interval quand on quitte l'écran
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const orderData = await orderAPI.getOrderById(orderId);
            setOrder(orderData);
        } catch (error) {
            console.log('erreur chargement commande:', error);
        } finally {
            setLoading(false);
        }
    };

    //  C'est pour les étapes de la timeline dans l'ordre
    const timelineSteps = [
        { status: 'pending', label: 'Commande reçue' },
        { status: 'confirmed', label: 'Confirmée par le restaurant' },
        { status: 'preparing', label: 'En préparation' },
        { status: 'ready', label: 'Prête' },
        { status: 'picked_up', label: 'Récupérée par le livreur' },
        { status: 'delivering', label: 'En livraison' },
        { status: 'delivered', label: 'Livrée' },
    ];

    // Cela vapermettre de vérifier si une étape est complétée
    const isStepDone = (stepStatus: string) => {
        const order_steps = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered'];
        const currentIndex = order_steps.indexOf(order?.status || '');
        const stepIndex = order_steps.indexOf(stepStatus);
        return stepIndex <= currentIndex;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loading}>
                    <Text style={{ color: '#999' }}>Commande introuvable</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            
            {/* C'est le bouton retour */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#333" />
                <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Suivi commande</Text>
                <Text style={styles.subtitle}>Commande #{order.id}</Text>

                {/* statut actuel */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusLabel}>Statut actuel</Text>
                    <Text style={styles.statusValue}>{order.status}</Text>
                </View>

                {/* timeline de progression */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Progression</Text>
                    {timelineSteps.map((step, index) => (
                        <View key={step.status} style={styles.timelineItem}>
                            <View style={[
                                styles.timelineDot,
                                isStepDone(step.status) && styles.timelineDotDone
                            ]} />
                            {index < timelineSteps.length - 1 && (
                                <View style={[
                                    styles.timelineLine,
                                    isStepDone(step.status) && styles.timelineLineDone
                                ]} />
                            )}
                            <Text style={[
                                styles.timelineLabel,
                                isStepDone(step.status) && styles.timelineLabelDone
                            ]}>
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>

                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Restaurant</Text>
                    <Text style={styles.value}>{order.restaurantName}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Adresse de livraison</Text>
                    <Text style={styles.value}>
                        {typeof order.deliveryAddress === 'object' && order.deliveryAddress !== null
                            ? `${(order.deliveryAddress as any).street}, ${(order.deliveryAddress as any).city}`
                            : order.deliveryAddress as string}
                    </Text>
                </View>

                {/* C'est pour les infos du livreur si ils sont disponibles */}
                {order.driverInfo && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Votre livreur</Text>
                        <Text style={styles.value}>{order.driverInfo.name}</Text>
                        <Text style={styles.label}>{order.driverInfo.phone}</Text>
                    </View>
                )}
                
                {order.status === 'delivered' && ( 
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => router.push(`/review/${order.id}?restaurantId=${order.restaurantId}`)}
                    >
                        <Text style={styles.reviewButtonText}>⭐ Laisser un avis</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );

    
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 8,
        backgroundColor: '#fff',
    },
    backText: {
        fontSize: 16,
        color: '#333',
    },
    content: {
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        color: '#666',
    },
    statusCard: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statusLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginBottom: 4,
    },
    statusValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 12,
    },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#E0E0E0',
        marginTop: 2,
    },
    timelineDotDone: {
        backgroundColor: '#FF6B35',
    },
    timelineLine: {
        position: 'absolute',
        left: 6,
        top: 16,
        width: 2,
        height: 20,
        backgroundColor: '#E0E0E0',
    },
    timelineLineDone: {
        backgroundColor: '#FF6B35',
    },
    timelineLabel: {
        fontSize: 14,
        color: '#999',
        flex: 1,
    },
    timelineLabelDone: {
        color: '#333',
        fontWeight: '600',
    },
    reviewButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    reviewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});