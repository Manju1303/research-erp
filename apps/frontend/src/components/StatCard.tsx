import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: string;
  color?: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  color = 'blue',
}) => {
  const getGlow = () => {
    switch (color) {
      case 'cyan': return 'rgba(6, 182, 212, 0.2)';
      case 'purple': return 'rgba(168, 85, 247, 0.2)';
      case 'emerald': return 'rgba(16, 185, 129, 0.2)';
      case 'amber': return 'rgba(245, 158, 11, 0.2)';
      default: return 'rgba(59, 130, 246, 0.2)';
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.4rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: getGlow(),
          filter: 'blur(25px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {icon && (
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
        {value}
      </div>
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem' }}>
          <span style={{ color: isPositive ? '#34d399' : '#fb7185', fontWeight: 600 }}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs last cycle</span>
        </div>
      )}
    </div>
  );
};
