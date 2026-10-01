import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SizeRecommendationCard } from '../components/product/SizeRecommendationCard.jsx';

describe('Size recommendation actions', () => {
  it('shows no-match guidance instead of asking for an existing profile again', () => {
    render(<SizeRecommendationCard isLoggedIn recommendation={{ status: 'no-match', reason: 'ตรวจตารางไซส์' }} />);
    expect(screen.getByText('ยังไม่พบไซส์ที่เหมาะสม')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables the suggested size when it is out of stock', () => {
    const onApply = vi.fn();
    render(<SizeRecommendationCard isLoggedIn onApply={onApply} recommendation={{ size: 'M', status: 'out-of-stock' }} />);
    const button = screen.getByRole('button', { name: 'เลือกไซส์ M' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onApply).not.toHaveBeenCalled();
  });

  it('applies an in-stock recommendation', () => {
    const onApply = vi.fn();
    render(<SizeRecommendationCard isLoggedIn onApply={onApply} recommendation={{ size: 'M', status: 'available' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'เลือกไซส์ M' }));
    expect(onApply).toHaveBeenCalledWith('M');
  });
});
