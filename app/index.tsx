import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDatabase } from '../contexts/DatabaseContext';
import { databaseService } from '../lib/database';
import { Product } from '../types';

export default function ProductList() {
  const { isInitialized, error } = useDatabase();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      const allProducts = await databaseService.getAllProducts();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteProduct(product.id);
              await loadProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        loadProducts();
      }
    }, [isInitialized])
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 mx-4">
      <View className="flex-row items-start">
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            className="w-16 h-16 rounded-lg mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg mr-4 bg-gray-200 items-center justify-center">
            <Ionicons name="image-outline" size={24} color="#9CA3AF" />
          </View>
        )}
        
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            Quantity: {item.quantity}
          </Text>
          <Text className="text-lg font-bold text-blue-600">
            ${item.price.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => router.push(`/edit-product?productId=${item.id}`)}
            className="p-2 rounded-full bg-blue-100"
          >
            <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            className="p-2 rounded-full bg-red-100"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-medium text-red-600 mt-4">
          Database Error
        </Text>
        <Text className="text-gray-500 mt-2 text-center px-8">
          {error}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Loading products...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg font-medium text-gray-600 mt-4">
            {searchQuery ? 'No products found' : 'No products yet'}
          </Text>
          <Text className="text-gray-500 mt-2 text-center px-8">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Add your first product to get started'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </View>
  );
}
