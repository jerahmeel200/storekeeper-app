export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  quantity: number;
  price: number;
  imageUri?: string;
}

export interface UpdateProductData {
  name?: string;
  quantity?: number;
  price?: number;
  imageUri?: string;
}

export type RootStackParamList = {
  index: undefined;
  'add-product': undefined;
  'edit-product': { productId: number };
  'product-detail': { productId: number };
};
