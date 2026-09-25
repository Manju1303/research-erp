import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
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
  const getColorStyles = () => {
    switch (color) {
      case 'cyan':
        return { bg: '#f0f9ff', text: '#0284c7', border: '#e0f2fe' };
      case 'purple':
        return { bg: '#faf5ff', text: '#7c3aed', border: '#f3e8ff' };
      case 'emerald':
        return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
      case 'amber':
        return { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };
      default:
        return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
    }
  };

  const style = getColorStyles();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.35rem 1.4rem',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: style.bg,
              color: style.text,
              border: `1px solid ${style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
        {value}
      </div>
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem' }}>
          <span style={{ color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>vs last cycle</span>
        </div>
      )}
    </div>
  );
};
