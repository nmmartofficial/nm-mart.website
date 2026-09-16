import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Highlights from './Highlights';

const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Highlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => Promise.reject(new Error("Could not find the table 'public.feature_cards' in the schema cache")));
  });

  it('silently handles missing highlight tables without logging an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Highlights />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
