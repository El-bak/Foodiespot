import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star } from "lucide-react-native";
import api from "@/services/api";

export default function ReviewScreen() {
    const { orderId, restaurantId } = useLocalSearchParams<{
        orderId: string;
        restaurantId: string;
    }>();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Laiser une note', 'Pensez ajouter une note afin de partager votre avis ou votre expérience');
            return;
        }

        setLoading(true);
        try {
            await api.post('/reviews', {
                restaurantId,
                orderId,
                rating,
                comment,
            });

            Alert.alert(
                'Merci pour votre avis !',
                'Votre avis a été publié',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }]
            );
        } catch (error) {
            console.log('erreur envoi avis:', error);
            Alert.alert('Erreur', 'Impossible de publier votre avis');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Laisser un avis</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* étoiles pour les avis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Note globale</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                            >
                                <Star
                                    size={40}
                                    color="#FFC107"
                                    fill={star <= rating ? '#FFC107' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={styles.ratingText}>
                            {rating === 1 && 'Très mauvais'}
                            {rating === 2 && 'Mauvais'}
                            {rating === 3 && 'Moyen'}
                            {rating === 4 && 'Bien'}
                            {rating === 5 && 'Excellent !'}
                        </Text>
                    )}
                </View>

                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Partagez votre expérience..."
                        placeholderTextColor="#aaa"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, (loading || rating === 0) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || rating === 0}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.submitButtonText}>Publier mon avis</Text>
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
        marginBottom: 16,
        color: '#333',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    ratingText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B35',
    },
    commentInput: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        minHeight: 100,
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});