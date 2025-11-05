// Install a global listener to swap failing Gravatar images to a safe fallback
// - Rewrites d=404 → d=identicon
// - If rewrite fails, sets to a local transparent placeholder

const installImageFallback = () => {
  try {
    const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    window.addEventListener(
      'error',
      (ev: Event) => {
        const target = ev.target as HTMLImageElement | null;
        if (!target || target.tagName !== 'IMG') return;
        const src = target.getAttribute('src') || '';
        if (!src) return;
        // Handle Gravatar missing avatar (404)
        if (src.includes('gravatar.com/avatar')) {
          try {
            const url = new URL(src);
            // Prefer identicon or mp over 404
            url.searchParams.set('d', 'identicon');
            // Maintain size if present, else default 40
            if (!url.searchParams.get('s')) url.searchParams.set('s', '40');
            const next = url.toString();
            if (next !== src) target.src = next;
            else target.src = transparentPng;
          } catch {
            target.src = transparentPng;
          }
        } else {
          // Generic broken image fallback
          target.src = transparentPng;
        }
      },
      true
    );
  } catch {}
};

installImageFallback();

export {};

