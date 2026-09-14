const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'occasion_admin_token';

async function request(path, options = {}) {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('ไม่พบสิทธิ์ Admin กรุณาเข้าสู่ระบบใหม่');
    }

    const response = await fetch(API_BASE_URL + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || 'ทำรายการสินค้าไม่สำเร็จ');
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('เชื่อมต่อ Product API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่');
    }
    throw error;
  }
}

function prepareProduct(product) {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    gender: product.gender,
    tags: product.tags,
    availableDate: product.availableDate,
    imageUrl: product.imageUrl,
    variants: product.variants.map((variant) => {
      return {
        sku: variant.sku,
        color: variant.color,
        colorCode: variant.colorCode,
        size: variant.size,
        price: variant.price,
        stockQuantity: variant.stockQuantity,
        imageUrl: variant.imageUrl || product.imageUrl || '',
        detailImages: variant.detailImages || []
      };
    })
  };
}

export const productService = {
  async getProducts() {
    const result = await request('/admin/products');
    if (!Array.isArray(result.data)) {
      throw new Error('รูปแบบข้อมูลสินค้าจาก Server ไม่ถูกต้อง');
    }
    return result.data;
  },

  async createProduct(product) {
    const result = await request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(prepareProduct(product))
    });
    return result.data;
  },

  async updateProduct(id, product) {
    const result = await request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prepareProduct(product))
    });
    return result.data;
  },

  async deleteProduct(id) {
    await request(`/admin/products/${id}`, { method: 'DELETE' });
  }
};
