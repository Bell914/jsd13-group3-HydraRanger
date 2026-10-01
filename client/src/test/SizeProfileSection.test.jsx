import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SizeProfileSection } from '../components/profilepage/SizeProfileSection.jsx';

vi.mock('../services/userService.js', () => ({
  userService: { getSizeProfile: vi.fn().mockResolvedValue(null) }
}));

describe('Size & Fit profile', () => {
  it('shows exactly three fit choices and lets the customer select one', async () => {
    render(<SizeProfileSection />);

    const fitted = await screen.findByRole('radio', { name: 'เข้ารูป' });
    const regular = screen.getByRole('radio', { name: 'มาตรฐาน' });
    const relaxed = screen.getByRole('radio', { name: 'หลวมสบาย' });

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(regular.checked).toBe(true);

    await userEvent.click(fitted);
    expect(fitted.checked).toBe(true);

    await userEvent.click(relaxed);
    expect(relaxed.checked).toBe(true);
  });
});
