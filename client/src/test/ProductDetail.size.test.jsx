import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import { getProductById } from '../services/productService.js';
import { useCartStore } from '../store/cartStore.js';

vi.mock('../services/productService.js', () => ({ getProductById: vi.fn(), getProducts: vi.fn().mockResolvedValue([]) }));
vi.mock('../context/Auth/useAuth.jsx', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../components/product/index.js', () => ({
  ProductGallery: () => null,
  ProductBuySection: ({ onSizeChange, onAddToCart, validationError }) => (
    <div>
      <button onClick={() => onSizeChange('M')}>Select M</button>
      <button onClick={onAddToCart}>Add item</button>
      <p>{validationError}</p>
    </div>
  ),
  ProductAccordionDetails: () => null,
  ProductReviews: () => null,
  MatchingProducts: () => null,
  OccasionLookSection: () => null,
  ProductSizeGuideModal: () => null,
  ProductAddedModal: () => null
}));

describe('Product detail size selection', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    useCartStore.setState({ cartItems: [] });
  });

  function loadProduct(stock) {
    getProductById.mockResolvedValue({
      _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Test shirt', category: 'tops',
      variants: [
        { _id: 'small-id', sku: 'TOP-S', size: 'S', color: 'Black', price: 500, stockQuantity: 5 },
        { _id: 'medium-id', sku: 'TOP-M', size: 'M', color: 'Black', price: 600, stockQuantity: stock }
      ]
    });
    render(<MemoryRouter><ProductDetailPage /></MemoryRouter>);
  }

  it('adds the selected size SKU and price rather than the first color variant', async () => {
    loadProduct(3);
    fireEvent.click(await screen.findByRole('button', { name: 'Select M' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    const item = useCartStore.getState().cartItems[0];
    expect(item).toMatchObject({ variantId: 'medium-id', size: 'M', price: 600 });
  });

  it('keeps sold-out variants out of the cart even when selected manually', async () => {
    loadProduct(0);
    fireEvent.click(await screen.findByRole('button', { name: 'Select M' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(useCartStore.getState().cartItems).toHaveLength(0);
    expect(screen.getByText('สินค้าในไซส์และสีนี้มีไม่พอสำหรับจำนวนที่เลือก')).toBeInTheDocument();
  });
});
