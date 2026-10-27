import React from 'react';

interface CrtOverlayProps {
  enabled: boolean;
}

export const CrtOverlay: React.FC<CrtOverlayProps> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {/* Scanline grid pattern */}
      <div className="absolute inset-0 crt-overlay opacity-40" />
      {/* Curved vignette */}
      <div className="absolute inset-0 crt-vignette" />
      {/* Moving scanline beam */}
      <div className="scanline-beam" />
    </div>
  );
};
