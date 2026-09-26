import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MembershipCard } from '../components/profilepage/MembershipCard.jsx';
import { CouponsSection } from '../components/profilepage/CouponsSection.jsx';
import { RankUpgradeModal } from '../components/profilepage/RankUpgradeModal.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { hasEarlyAccess, NEXT_RANK_PERKS } from '../utils/loyaltyUtils.js';

describe('Customer Experience & Benefits (ประสบการณ์ลูกค้าและสิทธิประโยชน์)', () => {
  describe('MembershipCard Next Rank Perks', () => {
    it('displays next rank perks preview for non-platinum member', () => {
      const mockUser = {
        username: 'TestMember',
        membership: {
          rank: 'MEMBER',
          accumulatedSpending: 500
        }
      };

      render(<MembershipCard user={mockUser} />);

      // Verify current rank & spending
      expect(screen.getByText('MEMBER')).toBeInTheDocument();
      expect(screen.getAllByText('฿500').length).toBeGreaterThanOrEqual(1);

      // Verify Next Rank Benefits Preview (Item 6)
      expect(
        screen.getByText(/สิทธิประโยชน์ที่จะได้รับเมื่อเลื่อนเป็น BRONZE/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText('ปลดล็อกส่วนลด On-top 3% ทุกคำสั่งซื้อ')
      ).toBeInTheDocument();
    });
  });

  describe('CouponsSection & Birthday Reward', () => {
    it('renders usable vouchers, copy code button, and birthday privilege', () => {
      const mockUser = {
        username: 'SilverUser',
        membership: {
          rank: 'SILVER',
          accumulatedSpending: 4500
        }
      };

      render(
        <MemoryRouter>
          <CouponsSection user={mockUser} />
        </MemoryRouter>
      );

      // Verify header & current tier
      expect(screen.getByText(/คูปองและสิทธิพิเศษของฉัน/i)).toBeInTheDocument();
      expect(screen.getByText('SILVER')).toBeInTheDocument();

      // Verify Welcome and Tier coupons (Item 9)
      expect(screen.getByText('OCCWELCOME10')).toBeInTheDocument();
      expect(screen.getByText('SILVERVIP5')).toBeInTheDocument();

      // Verify Birthday Reward Privilege (Item 12)
      expect(screen.getByText(/Birthday Celebration Privilege/i)).toBeInTheDocument();
      expect(screen.getAllByText(/15%/i).length).toBeGreaterThanOrEqual(1);

      // Click Copy Code button (Item 8 & 9)
      const copyButtons = screen.getAllByRole('button', { name: /คัดลอกโค้ด/i });
      expect(copyButtons.length).toBeGreaterThanOrEqual(1);
      fireEvent.click(copyButtons[0]);

      // Feedback message appears
      expect(screen.getByText(/คัดลอกแล้ว/i)).toBeInTheDocument();
    });
  });

  describe('RankUpgradeModal Celebration', () => {
    it('renders celebration banner, new rank, and unlocked benefits', () => {
      const handleClose = vi.fn();

      render(
        <RankUpgradeModal
          isOpen={true}
          onClose={handleClose}
          newRank="GOLD"
          previousRank="SILVER"
        />
      );

      expect(screen.getByText(/CONGRATULATIONS!/i)).toBeInTheDocument();
      expect(screen.getByText('GOLD')).toBeInTheDocument();
      expect(
        screen.getByText(/สิทธิพิเศษใหม่ที่คุณปลดล็อก/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText('ส่วนลด On-top 10% ทุกคำสั่งซื้อ')
      ).toBeInTheDocument();

      // Click action button to close
      const closeBtn = screen.getByRole('button', { name: /รับสิทธิ์และเริ่มช้อปปิ้งเลย/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      const { container } = render(
        <RankUpgradeModal isOpen={false} onClose={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Early Access for Eligible Ranks', () => {
    it('correctly determines early access capability by rank', () => {
      expect(hasEarlyAccess('MEMBER')).toBe(false);
      expect(hasEarlyAccess('BRONZE')).toBe(false);
      expect(hasEarlyAccess('SILVER')).toBe(true);
      expect(hasEarlyAccess('GOLD')).toBe(true);
      expect(hasEarlyAccess('PLATINUM')).toBe(true);
    });

    it('renders EARLY ACCESS badge on product card when product has isEarlyAccess', () => {
      const product = {
        _id: 'prod-early',
        name: 'Autumn Trench Coat',
        imageUrl: 'https://example.com/coat.jpg',
        price: 2490,
        isEarlyAccess: true,
        category: 'Outwear',
        variants: [{ price: 2490 }]
      };

      render(
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      );

      expect(screen.getByText('EARLY ACCESS')).toBeInTheDocument();
    });
  });
});
