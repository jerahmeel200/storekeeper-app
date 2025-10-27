import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../contexts/DatabaseContext';
import { databaseService } from '../lib/database';
import { CreateProductData } from '../types';

export default function AddProduct() {
  const insets = useSafeAreaInsets();
  const { isInitialized, error } = useDatabase();
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    quantity: 0,
    price: 0,
    imageUri: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateProductData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        handleInputChange('imageUri', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        handleInputChange('imageUri', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    if (formData.quantity < 0) {
      Alert.alert('Validation Error', 'Quantity must be 0 or greater');
      return false;
    }
    if (formData.price < 0) {
      Alert.alert('Validation Error', 'Price must be 0 or greater');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await databaseService.createProduct(formData);
      
      Alert.alert(
        'Success',
        'Product added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                quantity: 0,
                price: 0,
                imageUri: undefined,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating product:', error);
      Alert.alert('Error', 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom + 20}
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Image Section */}
        <View className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Product Image
          </Text>
          
          <TouchableOpacity
            onPress={showImageOptions}
            className="items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8"
          >
            {formData.imageUri ? (
              <View className="items-center">
                <Image
                  source={{ uri: formData.imageUri }}
                  className="w-32 h-32 rounded-lg mb-4"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleInputChange('imageUri', undefined)}
                  className="bg-red-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-red-600 font-medium">Remove Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-600 mt-2 text-center">
                  Tap to add product image
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Camera or Photo Library
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Product Details
          </Text>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Quantity */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter quantity"
              value={formData.quantity.toString()}
              onChangeText={(text) => handleInputChange('quantity', parseInt(text) || 0)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Price ($) *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter price"
              value={formData.price.toString()}
              onChangeText={(text) => handleInputChange('price', parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-4 rounded-lg ${
              loading ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Adding Product...' : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
