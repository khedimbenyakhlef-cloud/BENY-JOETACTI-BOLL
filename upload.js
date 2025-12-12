// Simple fetch upload helper for the Tactiball frontend
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadZone = document.getElementById('upload-zone');
  const out = document.getElementById('upload-progress-text') || document.getElementById('out');

  if (!fileInput || !uploadZone) return;

  uploadZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);

    try {
      out.textContent = 'Envoi au serveur...';
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      out.textContent = 'Erreur upload: ' + err.message;
    }
  });
});
