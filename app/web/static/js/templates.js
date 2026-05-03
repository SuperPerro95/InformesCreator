import { $ } from './utils.js';

export function mountTemplate(targetId, html) {
  const el = $(targetId);
  if (!el) return null;
  el.innerHTML = html;
  if (window.lucide) lucide.createIcons({ nodes: [el] });
  return el;
}
