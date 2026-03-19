import { useEffect, useState } from 'react';
import { Coffee, IceCream2, Pizza, Sandwich, UtensilsCrossed } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { restaurantAPI } from '@/services/api';


const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('burger')) return <Sandwich size={18} color="#FF6B35" />;
    if (l.includes('pizza')) return <Pizza size={18} color="#FF6B35" />;
    if (l.includes('dessert')) return <IceCream2 size={18} color="#FF6B35" />;
    if (l.includes('healthy') || l.includes('salade')) return <Coffee size={18} color="#FF6B35" />;
    return <UtensilsCrossed size={18} color="#FF6B35" />;
};

interface Props {
    onSelectCategory?: (category: string | null) => void;
    selectedCategory?: string | null;
}

export const CategoryList: React.FC<Props> = ({ onSelectCategory, selectedCategory }) => {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        
        restaurantAPI.getCategories().then(data => {
            const names = data.map((c: any) => c.name);
            setCategories(names);
        });
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Catégories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[styles.chip, selectedCategory === category && styles.chipActive]}
                        onPress={() => {
                            if (onSelectCategory) {
                                
                                // Si la catégorie est déjà sélectionnée, on la désélectionne 
                                onSelectCategory(selectedCategory === category ? null : category);
                            }
                        }}
                    >
                        {getIcon(category)}
                        <Text style={[styles.chipText, selectedCategory === category && styles.chipTextActive]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF4EF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        marginRight: 12,
    },
    chipActive: {
        backgroundColor: '#FF6B35',
    },
    chipText: {
        color: '#FF6B35',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#fff',
    },
});