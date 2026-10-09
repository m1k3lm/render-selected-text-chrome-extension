/**
 * Tests for RSTSettings
 */

describe('RSTSettings.normalizeTheme()', () => {
  it('should keep supported themes', () => {
    expect(RSTSettings.normalizeTheme('dark')).toBe('dark');
    expect(RSTSettings.normalizeTheme('light')).toBe('light');
    expect(RSTSettings.normalizeTheme('system')).toBe('system');
    expect(RSTSettings.normalizeTheme('unicorn')).toBe('unicorn');
  });

  it('should fall back to dark for missing or unknown values', () => {
    expect(RSTSettings.normalizeTheme(undefined)).toBe('dark');
    expect(RSTSettings.normalizeTheme('solarized')).toBe('dark');
  });
});

describe('RSTSettings.loadTheme()', () => {
  it('should fall back to the default theme when storage is unavailable', async () => {
    expect(await RSTSettings.loadTheme()).toBe(RSTSettings.DEFAULT_THEME);
  });
});
