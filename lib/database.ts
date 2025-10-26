import * as SQLite from 'expo-sqlite';
import { CreateProductData, Product, UpdateProductData } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('storekeep.db');
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL DEFAULT 0.0,
        imageUri TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.execAsync(createProductsTable);
  }

  async createProduct(product: CreateProductData): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO products (name, quantity, price, imageUri) VALUES (?, ?, ?, ?)',
      [product.name, product.quantity, product.price, product.imageUri || null]
    );

    return result.lastInsertRowId as number;
  }

  async getAllProducts(): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM products ORDER BY updatedAt DESC'
    );

    return result as Product[];
  }

  async getProductById(id: number): Promise<Product | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    return result as Product | null;
  }

  async updateProduct(id: number, product: UpdateProductData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    if (product.name !== undefined) {
      fields.push('name = ?');
      values.push(product.name);
    }
    if (product.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(product.quantity);
    }
    if (product.price !== undefined) {
      fields.push('price = ?');
      values.push(product.price);
    }
    if (product.imageUri !== undefined) {
      fields.push('imageUri = ?');
      values.push(product.imageUri);
    }

    if (fields.length === 0) return;

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.runAsync(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteProduct(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM products WHERE name LIKE ? ORDER BY updatedAt DESC',
      [`%${query}%`]
    );

    return result as Product[];
  }
}

export const databaseService = new DatabaseService();
