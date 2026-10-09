const preview = document.getElementById('preview');
const status = document.getElementById('status');
const radios = document.querySelectorAll('input[name="theme"]');

const showTheme = (theme) => {
  preview.dataset.rstTheme = theme;
  radios.forEach((radio) => {
    radio.checked = radio.value === theme;
  });
};

const sample = { name: 'render-selected-text', version: 1.2, themes: ['dark', 'light', 'system'], beta: true, license: null };
document.getElementById('preview-content').appendChild(new JSONRenderer().createCollapsibleJSON(sample, 0, null, true));

RSTSettings.loadTheme().then(showTheme);

radios.forEach((radio) => {
  radio.addEventListener('change', async () => {
    showTheme(radio.value);
    await RSTSettings.saveTheme(radio.value);
    status.textContent = 'Saved. Open popups update immediately.';
  });
});
