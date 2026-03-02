import { databases, DATABASE_ID } from '../appwriteConfig';
import { Query } from 'node-appwrite';

// IDs de tus colecciones en Appwrite
const COL_PRODUCTS = 'products';
const COL_SETTINGS = 'store_settings';
const COL_TOPBAR = 'top_bar_messages';

// 1. OBTENER TODOS LOS PRODUCTOS
export const getProducts = async () => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COL_PRODUCTS);
    return response.documents;
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
};

// 2. OBTENER UN PRODUCTO POR ID
export const getProductById = async (id: string) => {
  try {
    return await databases.getDocument(DATABASE_ID, COL_PRODUCTS, id);
  } catch (error) {
    console.error("Error cargando producto:", error);
    return null;
  }
};

// 3. FILTRAR POR CATEGORÍA O TAG (Visage, Corps, etc.)
export const getProductsByTag = async (tag: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID, 
      COL_PRODUCTS,
      [Query.equal(tag, true)]
    );
    return response.documents;
  } catch (error) {
    console.error(`Error filtrando por ${tag}:`, error);
    return [];
  }
};

// 4. CONFIGURACIÓN DE LA TIENDA (Mensaje de Ramadan, etc.)
export const getStoreSettings = async () => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COL_SETTINGS);
    return response.documents[0]; // Retorna el primer registro de configuración
  } catch (error) {
    return { dynamic_menu_text: "Skineno", dynamic_menu_active: false };
  }
};