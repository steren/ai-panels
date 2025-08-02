
import React from 'react';
import { HEXAGON_SIZE_FACTOR, SQUARE_SIZE_FACTOR } from '../constants';

interface IconProps {
  cx: number;
  cy: number;
  cellSize: number;
}

export const HexagonIcon: React.FC<IconProps> = ({ cx, cy, cellSize }) => {
  const size = cellSize * HEXAGON_SIZE_FACTOR;
  return (
    <polygon
      points={`${cx},${cy - size} ${cx + size * 0.866},${cy - size * 0.5} ${cx + size * 0.866},${cy + size * 0.5} ${cx},${cy + size} ${cx - size * 0.866},${cy + size * 0.5} ${cx - size * 0.866},${cy - size * 0.5}`}
      className="fill-yellow-400"
    />
  );
};

export const BlackSquareIcon: React.FC<IconProps> = ({ cx, cy, cellSize }) => {
  const size = cellSize * SQUARE_SIZE_FACTOR;
  return <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} className="fill-gray-900" />;
};

export const WhiteSquareIcon: React.FC<IconProps> = ({ cx, cy, cellSize }) => {
  const size = cellSize * SQUARE_SIZE_FACTOR;
  return <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} className="fill-white" />;
};
