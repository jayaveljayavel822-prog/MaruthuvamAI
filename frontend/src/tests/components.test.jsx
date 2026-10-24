import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthScoreRing from '../components/common/HealthScoreRing';
import EcgLine from '../components/common/EcgLine';

describe('UI Presentation Components', () => {
  it('renders HealthScoreRing with correct score value', () => {
    render(<HealthScoreRing score={85} size={100} strokeWidth={8} />);
    const scoreElement = screen.getByText('85');
    expect(scoreElement).toBeDefined();
  });

  it('clamps HealthScoreRing between 0 and 100', () => {
    const { rerender } = render(<HealthScoreRing score={150} size={100} />);
    expect(screen.getByText('100')).toBeDefined();

    rerender(<HealthScoreRing score={-20} size={100} />);
    expect(screen.getByText('0')).toBeDefined();
  });

  it('renders animated EcgLine SVG component', () => {
    const { container } = render(<EcgLine width={180} height={36} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg.getAttribute('viewBox')).toBe('0 0 220 50');
    expect(svg.getAttribute('width')).toBe('180');
    expect(svg.getAttribute('height')).toBe('36');
  });
});
