import React from 'react';

const AimGuardLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <img
    src="/img/logo.png"
    alt="AIM GUARD Logo"
    style={{ height: size, width: 'auto', display: 'block', objectFit: 'contain' }}
  />
);

export default AimGuardLogo;
