import { Supplement, Purchase } from '@/types';
import { supabase } from './auth';

type ProductCategory = Supplement['category'];
type ProductRow = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: ProductCategory | null;
  stock?: number | null;
  gym_id?: string | null;
  ingredients?: string[] | null;
  serving_size?: string | null;
  servings_per_container?: number | null;
};

const getGymNamesMap = async (gymIds: string[]): Promise<Record<string, string>> => {
  if (!gymIds.length) {
    return {};
  }

  const { data, error } = await supabase
    .from('gyms')
    .select('id, name')
    .in('id', gymIds);

  if (error || !data) {
    console.warn('Error fetching gyms for products:', error);
    return {};
  }

  return data.reduce<Record<string, string>>((acc, gym) => {
    if (gym?.id && gym?.name) {
      acc[gym.id] = gym.name;
    }
    return acc;
  }, {});
};

const mapProductToSupplement = (product: ProductRow, gymNameById: Record<string, string> = {}): Supplement => ({
  id: product.id,
  name: product.name,
  description: product.description || '',
  price: product.price,
  image: product.image_url || 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=300&h=300&fit=crop',
  category: product.category || 'other',
  rating: 4.5,
  reviews: 0,
  ingredients: product.ingredients || [],
  servingSize: product.serving_size || '',
  servingsPerContainer: product.servings_per_container || 0,
  stock: typeof product.stock === 'number' ? product.stock : 0,
  gym_id: product.gym_id || undefined,
  gym_name: product.gym_id ? gymNameById[product.gym_id] : undefined,
});

// Mock supplement data
const mockSupplements: Supplement[] = [
  {
    id: '1',
    name: 'Whey Protein Isolate',
    description: 'High-quality whey protein isolate with 25g protein per serving. Perfect for post-workout recovery and muscle building.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=300&h=300&fit=crop',
    category: 'protein',
    rating: 4.8,
    reviews: 1250,
    ingredients: ['Whey Protein Isolate', 'Natural Flavors', 'Lecithin', 'Stevia'],
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 33,
    stock: 25,
  },
  {
    id: '2',
    name: 'Pre-Workout Energy',
    description: 'Advanced pre-workout formula with caffeine, beta-alanine, and citrulline for enhanced performance and energy.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    category: 'pre_workout',
    rating: 4.6,
    reviews: 892,
    ingredients: ['Caffeine', 'Beta-Alanine', 'L-Citrulline', 'Creatine Monohydrate'],
    servingSize: '1 scoop (15g)',
    servingsPerContainer: 20,
    stock: 18,
  },
  {
    id: '3',
    name: 'Creatine Monohydrate',
    description: 'Pure creatine monohydrate powder. Proven to increase strength, power, and muscle mass.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop',
    category: 'creatine',
    rating: 4.9,
    reviews: 2150,
    ingredients: ['100% Pure Creatine Monohydrate'],
    servingSize: '1 scoop (5g)',
    servingsPerContainer: 100,
    stock: 40,
  },
  {
    id: '4',
    name: 'BCAA Recovery',
    description: 'Branched-chain amino acids in a 2:1:1 ratio to support muscle recovery and reduce fatigue.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    category: 'bcaa',
    rating: 4.4,
    reviews: 675,
    ingredients: ['L-Leucine', 'L-Isoleucine', 'L-Valine', 'Natural Flavors'],
    servingSize: '1 scoop (10g)',
    servingsPerContainer: 30,
    stock: 30,
  },
  {
    id: '5',
    name: 'Multivitamin Complex',
    description: 'Complete daily multivitamin with essential vitamins and minerals for active individuals.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
    category: 'vitamins',
    rating: 4.5,
    reviews: 1100,
    ingredients: ['Vitamin A', 'Vitamin C', 'Vitamin D3', 'B-Complex', 'Zinc', 'Magnesium'],
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    stock: 50,
  },
  {
    id: '6',
    name: 'Fat Burner',
    description: 'Thermogenic fat burner with green tea extract, L-carnitine, and natural caffeine.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    category: 'other',
    rating: 4.2,
    reviews: 450,
    ingredients: ['Green Tea Extract', 'L-Carnitine', 'Caffeine', 'Garcinia Cambogia'],
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    stock: 22,
  },
];

// Store API service
export const storeApi = {
  /**
   * Obtener suplementos del gimnasio al que está suscrito el usuario
   */
  async getSupplementsByGym(gymId: string): Promise<Supplement[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('gym_id', gymId);

      if (error) {
        console.warn('Error fetching gym supplements, using mock data:', error);
        return mockSupplements;
      }

      if (!data || data.length === 0) {
        return mockSupplements; // Fallback a datos mock si no hay productos
      }

      const gymNameById = await getGymNamesMap([gymId]);
      return (data as ProductRow[]).map(product => mapProductToSupplement(product, gymNameById));
    } catch (error) {
      console.error('Error getting gym supplements:', error);
      return mockSupplements;
    }
  },

  /**
   * Obtener suplementos de múltiples gimnasios
   */
  async getSupplementsByGyms(gymIds: string[]): Promise<Supplement[]> {
    try {
      if (!gymIds || gymIds.length === 0) {
        return mockSupplements;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('gym_id', gymIds);

      if (error) {
        console.warn('Error fetching supplements from multiple gyms, using mock data:', error);
        return mockSupplements;
      }

      if (!data || data.length === 0) {
        return mockSupplements;
      }

      const uniqueGymIds = Array.from(new Set(
        (data as ProductRow[])
          .map(product => product.gym_id)
          .filter((id): id is string => Boolean(id))
      ));
      const gymNameById = await getGymNamesMap(uniqueGymIds);

      return (data as ProductRow[]).map(product => mapProductToSupplement(product, gymNameById));
    } catch (error) {
      console.error('Error getting supplements from multiple gyms:', error);
      return mockSupplements;
    }
  },

  async getSupplements(): Promise<Supplement[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.warn('Error fetching supplements, using mock data:', error);
        return mockSupplements;
      }

      if (!data || data.length === 0) {
        return mockSupplements;
      }

      const uniqueGymIds = Array.from(new Set(
        (data as ProductRow[])
          .map(product => product.gym_id)
          .filter((id): id is string => Boolean(id))
      ));
      const gymNameById = await getGymNamesMap(uniqueGymIds);

      return (data as ProductRow[]).map(product => mapProductToSupplement(product, gymNameById));
    } catch (error) {
      console.error('Error getting supplements:', error);
      return mockSupplements;
    }
  },

  async getSupplement(id: string): Promise<Supplement | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.warn('Error fetching supplement, using mock data:', error);
        return mockSupplements.find(supplement => supplement.id === id) || null;
      }

      const gymId = (data as ProductRow).gym_id;
      const gymNameById = await getGymNamesMap(gymId ? [gymId] : []);
      return mapProductToSupplement(data as ProductRow, gymNameById);
    } catch (error) {
      console.error('Error getting supplement:', error);
      return mockSupplements.find(supplement => supplement.id === id) || null;
    }
  },

  async getSupplementsByCategory(category: string): Promise<Supplement[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockSupplements.filter(supplement => supplement.category === category);
  },

  async searchSupplements(query: string): Promise<Supplement[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    const lowercaseQuery = query.toLowerCase();
    return mockSupplements.filter(supplement =>
      supplement.name.toLowerCase().includes(lowercaseQuery) ||
      supplement.description.toLowerCase().includes(lowercaseQuery) ||
      supplement.category.toLowerCase().includes(lowercaseQuery)
    );
  },

  async getFeaturedSupplements(): Promise<Supplement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return top-rated supplements as featured
    return mockSupplements
      .filter(supplement => supplement.rating >= 4.5)
      .slice(0, 4);
  },

  // Mock Stripe integration
  async createCheckoutSession(items: { supplementId: string; quantity: number }[]): Promise<{ 
    success: boolean; 
    checkoutUrl?: string; 
    error?: string 
  }> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // In a real app, this would create a Stripe checkout session
    // For now, return a mock checkout URL
    const mockCheckoutUrl = 'https://checkout.stripe.com/pay/mock-session-id';
    
    return {
      success: true,
      checkoutUrl: mockCheckoutUrl,
    };
  },

  async completePurchase(items: { supplementId: string; quantity: number }[], total: number): Promise<{
    success: boolean;
    purchaseId?: string;
    error?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful purchase
    const purchaseId = `purchase_${Date.now()}`;
    
    return {
      success: true,
      purchaseId,
    };
  },

  async getPurchaseHistory(userId: string): Promise<Purchase[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock purchase history
    const mockPurchases: Purchase[] = [
      {
        id: '1',
        date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        items: [
          {
            supplement: mockSupplements[0],
            quantity: 1,
          },
          {
            supplement: mockSupplements[2],
            quantity: 2,
          },
        ],
        total: 99.97,
        status: 'completed',
        paymentMethod: 'Credit Card ending in 4242',
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        items: [
          {
            supplement: mockSupplements[1],
            quantity: 1,
          },
        ],
        total: 34.99,
        status: 'completed',
        paymentMethod: 'Credit Card ending in 4242',
      },
    ];

    return mockPurchases;
  },

  /**
   * Actualizar el stock de un producto después de una compra
   */
  async updateProductStock(productId: string, quantityDecrease: number): Promise<boolean> {
    try {
      // Primero obtener el stock actual
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock, is_active')
        .eq('id', productId)
        .single();

      if (fetchError || !product) {
        console.error('Error fetching product stock:', fetchError);
        return false;
      }

      const currentStock = product.stock || 0;
      const newStock = Math.max(0, currentStock - quantityDecrease);
      const shouldDeactivate = newStock === 0 && product.is_active;

      console.log(`Actualizando producto ${productId}: stock ${currentStock} -> ${newStock}, desactivar: ${shouldDeactivate}`);

      // Actualizar el stock y potencialmente el estado activo
      const updateData: any = { stock: newStock };
      if (shouldDeactivate) {
        updateData.is_active = false;
        console.log(`Desactivando producto ${productId} porque stock llegó a 0`);
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select('id, stock, is_active');

      if (updateError) {
        console.error('Error updating product stock:', updateError);
        return false;
      }

      if (!updatedProduct || updatedProduct.length === 0) {
        console.error('No se actualizó el producto:', productId);
        return false;
      }

      const updated = updatedProduct[0];
      console.log(`✓ Stock actualizado para producto ${productId}: ${currentStock} -> ${updated.stock}, is_active: ${updated.is_active}`);
      return true;
    } catch (error) {
      console.error('Error in updateProductStock:', error);
      return false;
    }
  },

  /**
   * Actualizar stock para múltiples productos
   */
  async updateMultipleProductsStock(items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
    try {
      const promises = items.map(item => 
        this.updateProductStock(item.productId, item.quantity)
      );

      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('Error updating multiple products stock:', error);
      return false;
    }
  },
};