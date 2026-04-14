import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { storeApi } from '@/api';
import { Supplement } from '@/types';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { addToCart } = useApp();
  
  const { productId } = route.params as { productId: string };
  
  const [product, setProduct] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const productDescription = [
    product?.description || '',
    product?.gym_name ? `Gym: ${product.gym_name}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  useEffect(() => {
    loadProductDetails();
    setQuantity(1); // Reset quantity when entering/changing product
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const data = await storeApi.getSupplement(productId);
      if (data) {
        setProduct(data);
      } else {
        Alert.alert('Error', 'Producto no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const stock = typeof product.stock === 'number' ? product.stock : Infinity;

    if (stock <= 0) {
      Alert.alert('Sin stock', 'Este producto no está disponible actualmente');
      return;
    }

    if (quantity > stock) {
      setQuantity(stock);
      Alert.alert('Stock insuficiente', `Solo hay ${stock} unidades disponibles`);
      return;
    }

    const success = addToCart({ supplement: product, quantity });

    if (!success) {
      Alert.alert('Stock insuficiente', `Solo hay ${stock} unidades disponibles`);
      return;
    }

    Alert.alert('Éxito', `${quantity} ${quantity > 1 ? 'productos' : 'producto'} añadido al carrito`, [
      {
        text: 'Continuar comprando',
        onPress: () => navigation.goBack(),
      },
      {
        text: 'Ir al carrito',
        onPress: () => navigation.navigate('Store' as never, { screen: 'Cart' } as never),
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Producto no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detalles del Producto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
          {/* Price */}
          <Text style={[styles.price, { color: colors.primary }]}>
            ${product.price.toFixed(2)}
          </Text>
          {typeof product.stock === 'number' && (
            <>
              <Text style={[styles.stockText, { color: colors.textSecondary }]}>
                Stock disponible: {product.stock}
              </Text>
              {product.stock <= 3 && (
                <Text style={[styles.lowStockText, { color: colors.error }]}>
                  {product.stock === 0 ? 'Sin stock' : '¡Queda poco!'}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {productDescription}
          </Text>
        </View>

        {/* Ingredients */}
        {product.ingredients && product.ingredients.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredientes</Text>
            {product.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={[styles.ingredientText, { color: colors.text }]}>{ingredient}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quantity Selector and Add to Cart */}
        <View style={[styles.section, { backgroundColor: colors.surface, marginBottom: 30 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cantidad</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.border }]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
            
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.border }]}
              onPress={() => {
                const stock = typeof product.stock === 'number' ? product.stock : Infinity;
                setQuantity((prev) => {
                  const next = prev + 1;
                  return stock === Infinity ? next : Math.min(stock, next);
                });
              }}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { backgroundColor: product.stock === 0 ? colors.border : colors.primary }
            ]}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={styles.addToCartText}>
              Añadir al carrito - ${(product.price * quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: 14,
    marginTop: 8,
  },
  lowStockText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  ingredientText: {
    fontSize: 14,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;