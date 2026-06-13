import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function prettyLabel(seg) {
  if (!seg) return '';
  if (seg === 'application') return 'Application';
  if (seg === 'preview') return 'Preview';
  if (!isNaN(Number(seg))) return seg;
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const base = { label: '', to: '/' };
  const crumbs = parts.map((p, i) => {
    return { label: prettyLabel(p), to: '/' + parts.slice(0, i + 1).join('/') };
  });

  const items = [base, ...crumbs];

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={it.to} className={isLast ? 'crumb-last' : 'crumb'}>
            {isLast ? (
              <span>{it.label}</span>
            ) : (
              <Link to={it.to}>{it.label}</Link>
            )}
            {idx < items.length - 1 && <span className="crumb-sep">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
