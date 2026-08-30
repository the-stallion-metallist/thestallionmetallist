/**
 * Reusable FAQ accordion (native <details>, no JS). Used on sub-pages. The same
 * items should also be passed to the page's FAQPage schema so structured data
 * matches what's visible.
 */
export default function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="fql">
      {items.map((f) => (
        <details className="fql-item" key={f.q}>
          <summary>
            <span>{f.q}</span>
            <span className="fql-mark" aria-hidden="true">+</span>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
      <style>{`
        .fql { max-width: 780px; }
        .fql-item { border-bottom: 1px solid var(--line); }
        .fql-item > summary { list-style: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 1.2rem;
          padding: 1.2rem 0.2rem; font-family: var(--f-disp); font-weight: 600;
          font-size: clamp(1.02rem, 2vw, 1.22rem); line-height: 1.35; color: var(--ink); }
        .fql-item > summary::-webkit-details-marker { display: none; }
        .fql-mark { flex: 0 0 auto; font-size: 1.5rem; line-height: 1; color: var(--copper);
          transition: transform .25s ease; }
        .fql-item[open] > summary .fql-mark { transform: rotate(45deg); }
        .fql-item > p { margin: 0 0 1.3rem; padding-right: 2rem; max-width: 68ch;
          color: var(--ink-soft); line-height: 1.7; }
        @media (prefers-reduced-motion: reduce) { .fql-mark { transition: none; } }
      `}</style>
    </div>
  );
}
