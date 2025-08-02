
export enum PuzzleElementType {
  BlackSquare = 'black_square',
  WhiteSquare = 'white_square',
  Hexagon = 'hexagon',
}

export type Point = {
  x: number;
  y: number;
};

export type PuzzleElement = {
  position: Point;
  type: PuzzleElementType;
};

export type GridSize = 5 | 7;

export type PuzzleDefinition = {
  gridSize: GridSize;
  start: Point;
  end: Point;
  elements: PuzzleElement[];
};
