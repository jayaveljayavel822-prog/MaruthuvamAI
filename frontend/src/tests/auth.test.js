import { describe, it, expect, beforeEach } from 'vitest';
import api from '../api/client';

describe('API Client and Authentication Headers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves tokens from localStorage if present', () => {
    localStorage.setItem('maruthuvam_access_token', 'test_token_12345');
    const token = localStorage.getItem('maruthuvam_access_token');
    expect(token).toBe('test_token_12345');
  });

  it('correctly clears tokens on logout simulation', () => {
    localStorage.setItem('maruthuvam_access_token', 'jwt_sample');
    localStorage.setItem('maruthuvam_refresh_token', 'refresh_sample');

    localStorage.removeItem('maruthuvam_access_token');
    localStorage.removeItem('maruthuvam_refresh_token');

    expect(localStorage.getItem('maruthuvam_access_token')).toBeNull();
    expect(localStorage.getItem('maruthuvam_refresh_token')).toBeNull();
  });

  it('has base URL configured pointing to /api/v1', () => {
    expect(api.defaults.baseURL).toContain('/api/v1');
  });
});
