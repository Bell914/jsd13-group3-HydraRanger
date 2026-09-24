import { Filter, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { ProductTable } from '../components/ProductTable.jsx';
import { ProductFormModal } from '../components/ProductFormModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';
import { productService } from '../services/productService.js';

export function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await productService.getProducts();
      setProductList(result);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadFirstPage() {
      setLoading(true);
      setErrorMessage('');

      try {
        const result = await productService.getProducts();
        setProductList(result);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadFirstPage();
  }, []);

  const searchText = search.trim().toLowerCase();

  const visibleProducts = productList.filter((product) => {
    const isCorrectCategory = category === 'all' || product.category === category;
    const productName = product.name.toLowerCase();
    const isNameMatch = productName.includes(searchText);
    const isSkuMatch = product.variants.some((variant) => {
      return variant.sku.toLowerCase().includes(searchText);
    });

    return isCorrectCategory && (isNameMatch || isSkuMatch);
  });

  const saveProduct = async (product) => {
    setErrorMessage('');
    try {
      if (selectedProduct) {
        const updatedProduct = await productService.updateProduct(selectedProduct._id, product);
        setProductList((currentProducts) => {
          return currentProducts.map((currentProduct) => {
            if (currentProduct._id === updatedProduct._id) {
              return updatedProduct;
            }
            return currentProduct;
          });
        });
        setSuccessMessage(`แก้ไขสินค้า “${product.name}” เรียบร้อยแล้ว`);
      } else {
        const newProduct = await productService.createProduct(product);
        setProductList((currentProducts) => [newProduct, ...currentProducts]);
        setSuccessMessage(`เพิ่มสินค้า “${product.name}” เรียบร้อยแล้ว`);
      }
      setSelectedProduct(null);
      setFormOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    }
  };

  const openCreateForm = () => {
    setSuccessMessage('');
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setSuccessMessage('');
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setSelectedProduct(null);
    setFormOpen(false);
  };

  const openDeleteConfirm = (product) => {
    setSuccessMessage('');
    setProductToDelete(product);
  };

  const closeDeleteConfirm = () => {
    setProductToDelete(null);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    setErrorMessage('');
    try {
      const inactiveProduct = await productService.deleteProduct(productToDelete._id);
      setProductList((currentProducts) => {
        return currentProducts.map((product) => (
          product._id === inactiveProduct._id ? inactiveProduct : product
        ));
      });
      setSuccessMessage(`ปิดการขาย “${productToDelete.name}” เรียบร้อยแล้ว`);
      setProductToDelete(null);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const changeSearch = (event) => {
    setSearch(event.target.value);
  };

  const changeCategory = (event) => {
    setSelectedCategory(event.target.value);
  };

  const applyCategoryFilter = () => {
    setCategory(selectedCategory);
  };

  return (
    <div className="admin-content">
      <AdminTopbar title="สินค้า" />

      <main className="products-page">
        <header className="page-heading">
          <div>
            <h1>จัดการสินค้าทั้งหมด (Products)</h1>
            <p>จัดการคลังสินค้า เพิ่ม แก้ไข และตรวจสอบสถานะสินค้าในระบบ</p>
          </div>
          <button type="button" className="primary-action" onClick={openCreateForm}>
            <Plus size={16} /> เพิ่มสินค้าใหม่
          </button>
        </header>

        {successMessage && (
          <p
            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700"
            role="status"
          >
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <div className="error-panel" role="alert">
            <span>{errorMessage}</span>
            <button type="button" onClick={loadProducts} disabled={loading}>ลองใหม่</button>
          </div>
        )}

        <section className="filter-toolbar" aria-label="ค้นหาและกรองสินค้า">
          <label className="product-search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">ค้นหาชื่อสินค้าหรือ SKU</span>
            <input
              type="search"
              value={search}
              onChange={changeSearch}
              placeholder="ค้นหาชื่อสินค้า, SKU..."
            />
          </label>
          <div className="filters">
            <select value={selectedCategory} onChange={changeCategory} aria-label="เลือกหมวดหมู่">
              <option value="all">ทุกหมวดหมู่ (Categories)</option>
              <option value="tops">เสื้อ (Tops)</option>
              <option value="bottoms">กางเกง (Bottoms)</option>
            </select>
            <button type="button" className="filter-button" onClick={applyCategoryFilter}>
              <Filter size={15} /> ตัวกรอง
            </button>
          </div>
        </section>

        {loading ? (
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        ) : (
          <ProductTable
            products={visibleProducts}
            onEdit={openEditForm}
            onDelete={openDeleteConfirm}
          />
        )}
      </main>
      {formOpen && (
        <ProductFormModal product={selectedProduct} onClose={closeForm} onSave={saveProduct} />
      )}
      {productToDelete && (
        <DeleteConfirmModal
          product={productToDelete}
          loading={deleting}
          onCancel={closeDeleteConfirm}
          onConfirm={deleteProduct}
        />
      )}
    </div>
  );
}
