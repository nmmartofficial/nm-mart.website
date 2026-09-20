import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductCard from './ProductCard';

const { mockNavigate, mockToggleWishlist, mockIsWishlisted, mockSupabase } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockToggleWishlist: vi.fn(),
  mockIsWishlisted: vi.fn(() => false),
  mockSupabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      })),
    },
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/hooks/useWishlist', () => ({
  useWishlist: () => ({
    isWishlisted: mockIsWishlisted,
    toggleWishlist: mockToggleWishlist,
  }),
}));

vi.mock('@/lib/ThemeProvider', () => ({
  useTheme: () => ({ theme: {} }),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('./ProductImageDisplay', () => ({
  default: () => <div data-testid="product-image">img</div>,
}));

vi.mock('@/lib/adminAccess', () => ({
  isActiveAdminUser: vi.fn(async () => true),
}));

describe('ProductCard performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not subscribe to auth listeners when quick edit is not enabled', () => {
    render(
      <ProductCard
        product={{
          id: 101,
          product_id: 101,
          name: 'Test Product',
          price: 199,
          saleRate: 199,
          mrp: 299,
          barcode: 'ABC123',
          category: 'Groceries',
          brand: 'NM Mart',
          subCategory: 'Daily Needs',
          imageUrl: 'https://example.com/product.jpg',
          discount: 33,
          stock: 12,
          unit: '1 Pack',
          description: 'Test product',
          isFeatured: false,
          save: 100,
          badge: '',
        }}
        onAddToCart={vi.fn()}
      />
    );

    expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
    expect(mockSupabase.auth.onAuthStateChange).not.toHaveBeenCalled();
  });
});
