import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { storeApi } from '@/api';
import { Supplement } from '@/types';


const StoreScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { cart, addToCart } = useApp();
  
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [filteredSupplements, setFilteredSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'Todos', icon: 'grid-outline' },
    { key: 'protein', label: 'Proteínas', icon: 'fitness-outline' },
    { key: 'pre_workout', label: 'Pre-entreno', icon: 'flash-outline' },
    { key: 'vitamins', label: 'Vitaminas', icon: 'medical-outline' },
    { key: 'creatine', label: 'Creatina', icon: 'barbell-outline' },
    { key: 'bcaa', label: 'BCAA', icon: 'body-outline' },
    { key: 'other', label: 'Otros', icon: 'ellipsis-horizontal-outline' },
  ];

  useEffect(() => {
    loadSupplements();
  }, []);

  useEffect(() => {
    filterSupplements();
  }, [supplements, searchQuery, selectedCategory]);

  const loadSupplements = async () => {
    try {
      setLoading(true);
      const data = await storeApi.getSupplements();
      setSupplements(data);
    } catch (error) {
      console.error('Error loading supplements:', error);
      Alert.alert('Error', 'No se pudieron cargar los suplementos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSupplements();
    setRefreshing(false);
  };

  const filterSupplements = () => {
    let filtered = supplements;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supplement => supplement.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(supplement =>
        supplement.name.toLowerCase().includes(query) ||
        supplement.description.toLowerCase().includes(query) ||
        supplement.category.toLowerCase().includes(query)
      );
    }

    setFilteredSupplements(filtered);
  };

  const handleAddToCart = (supplement: Supplement) => {
    const cartItem = { supplement, quantity: 1 };
    addToCart(cartItem);
    Alert.alert(
      'Agregado al carrito',
      `${supplement.name} ha sido agregado a tu carrito`,
      [
        { text: 'Continuar', style: 'default' },
        { 
          text: 'Ver carrito', 
          style: 'default',
          onPress: () => navigation.navigate('Cart' as never)
        }
      ]
    );
  };

  const handleBuyNow = (supplement: Supplement) => {
    // Add to cart and go directly to cart
    const cartItem = { supplement, quantity: 1 };
    addToCart(cartItem);
    navigation.navigate('Cart' as never);
  };

  const handleProductPress = (supplement: Supplement) => {
    navigation.navigate('ProductDetail' as never, { productId: supplement.id } as never);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#FFD700" />
      );
    }

    return stars;
  };

  const getCartItemCount = (supplementId: string) => {
    const item = cart.find(item => item.supplement.id === supplementId);
    return item ? item.quantity : 0;
  };

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor: selectedCategory === item.key ? colors.primary : colors.surface,
          borderColor: colors.border,
        }
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <Ionicons
        name={item.icon as any}
        size={20}
        color={selectedCategory === item.key ? 'white' : colors.textSecondary}
      />
      <Text
        style={[
          styles.categoryText,
          {
            color: selectedCategory === item.key ? 'white' : colors.textSecondary,
          }
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSupplementItem = ({ item: supplement }: { item: Supplement }) => {
    const cartCount = getCartItemCount(supplement.id);
    
    return (
      <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => handleProductPress(supplement)}>
          <Image
            source={{ uri: supplement.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Badge for cart count */}
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <TouchableOpacity onPress={() => handleProductPress(supplement)}>
            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
              {supplement.name}
            </Text>
            
            <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={3}>
              {supplement.description}
            </Text>
            
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(supplement.rating)}
              </View>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {supplement.rating} ({supplement.reviews})
              </Text>
            </View>
            
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              ${supplement.price.toFixed(2)}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
              onPress={() => handleAddToCart(supplement)}
            >
              <Ionicons name="cart-outline" size={18} color={colors.primary} />
              <Text style={[styles.addToCartText, { color: colors.primary }]}>
                Agregar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.buyNowButton, { backgroundColor: colors.primary }]}
              onPress={() => handleBuyNow(supplement)}
            >
              <Text style={styles.buyNowText}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando suplementos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Tienda de Suplementos
        </Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {cart.length > 0 && (
            <View style={[styles.cartBadgeHeader, { backgroundColor: colors.error }]}>
              <Text style={styles.cartBadgeHeaderText}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar suplementos..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filteredSupplements.length} productos encontrados
          {selectedCategory !== 'all' && ` en ${categories.find(c => c.key === selectedCategory)?.label}`}
          {searchQuery ? ` para "${searchQuery}"` : ''}
        </Text>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredSupplements}
        renderItem={renderSupplementItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No se encontraron productos
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Intenta con otro término de búsqueda o categoría
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadgeHeader: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeHeaderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  productsList: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyNowText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default StoreScreen;