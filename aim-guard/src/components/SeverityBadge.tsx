import React from 'react';
import type { SeverityLevel } from '../mock/data';


const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const cls = `severity-badge severity--${severity.toLowerCase()}`;
  return (
    <span className={cls}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
