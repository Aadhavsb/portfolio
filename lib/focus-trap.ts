const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement): () => void {
  const previous = document.activeElement as HTMLElement | null;

  const focusables = () =>
    [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || container.contains(el)
    );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const nodes = focusables();
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeyDown);
  requestAnimationFrame(() => focusables()[0]?.focus());

  return () => {
    container.removeEventListener("keydown", onKeyDown);
    previous?.focus?.();
  };
}
