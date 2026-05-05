import React from 'react';

const AimGuardLogo: React.FC<{ size?: number; src?: string | null; alt?: string }> = ({
  size = 32,
  src,
  alt = 'AIM GUARD Logo',
}) => (
  <img
    src={src || "/img/logo.png"}
    alt={alt}
    style={{ height: size, width: 'auto', display: 'block', objectFit: 'contain' }}
  />
);

export default AimGuardLogo;
