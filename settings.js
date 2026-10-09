/**
 * RSTSettings - User preferences shared by the content script and the options page
 */
if (typeof RSTSettings === 'undefined') {
  window.RSTSettings = {
    THEMES: ['dark', 'light', 'system', 'unicorn'],
    DEFAULT_THEME: 'dark',

    /**
     * Returns a supported theme name, falling back to the default for unknown values.
     * @param {*} theme
     * @returns {string}
     */
    normalizeTheme(theme) {
      return this.THEMES.includes(theme) ? theme : this.DEFAULT_THEME;
    },

    /**
     * Reads the saved theme from chrome.storage.sync.
     * @returns {Promise<string>}
     */
    async loadTheme() {
      try {
        const { theme } = await chrome.storage.sync.get('theme');
        return this.normalizeTheme(theme);
      } catch (e) {
        return this.DEFAULT_THEME;
      }
    },

    /**
     * Persists the theme to chrome.storage.sync.
     * @param {string} theme
     * @returns {Promise<void>}
     */
    saveTheme(theme) {
      return chrome.storage.sync.set({ theme: this.normalizeTheme(theme) });
    }
  };
}
