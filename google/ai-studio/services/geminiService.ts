
import { GoogleGenAI, Type } from "@google/genai";
import type { GridSize, PuzzleDefinition } from '../types';
import { PuzzleElementType } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const puzzleSchema = {
  type: Type.OBJECT,
  properties: {
    gridSize: { type: Type.INTEGER, description: "The grid size (5 or 7)." },
    start: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.INTEGER },
        y: { type: Type.INTEGER },
      },
      required: ['x', 'y'],
    },
    end: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.INTEGER },
        y: { type: Type.INTEGER },
      },
      required: ['x', 'y'],
    },
    elements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: [PuzzleElementType.BlackSquare, PuzzleElementType.WhiteSquare, PuzzleElementType.Hexagon],
          },
          position: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.INTEGER },
              y: { type: Type.INTEGER },
            },
            required: ['x', 'y'],
          },
        },
        required: ['type', 'position'],
      },
    },
  },
  required: ['gridSize', 'start', 'end', 'elements'],
};

export const generatePuzzle = async (gridSize: GridSize): Promise<PuzzleDefinition> => {
  const prompt = `
    Generate a solvable puzzle layout for a game similar to 'The Witness'.
    The puzzle is on a square grid. The user draws a single, non-intersecting line from a start point to an end point.

    Grid Size: ${gridSize}x${gridSize}. This means there are ${gridSize} nodes horizontally and vertically. Node coordinates range from 0 to ${gridSize - 1}.
    There are ${gridSize-1}x${gridSize-1} square cells. Cell coordinates are referenced by their top-left node, ranging from 0 to ${gridSize - 2}.
    
    Rules for a solvable puzzle:
    1.  Start and End points must be on the edge of the grid. They cannot be the same.
    2.  Separation Rule: If there are black and white squares, the solution path must perfectly separate all black squares from all white squares into different regions. A region cannot contain both black and white squares.
    3.  Hexagon Rule: The solution path must pass through the center of every hexagon dot on the grid.
    
    Your task is to generate the layout of these elements. Make it a moderately challenging but solvable puzzle.
    - Start/End positions are NODE coordinates.
    - Hexagon positions are NODE coordinates.
    - Black/White Square positions are CELL coordinates (the top-left node of the cell).
    
    Generate a valid puzzle with at least two black squares, two white squares, and one hexagon.
    Ensure the start and end points are on the outer border of the grid.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: puzzleSchema,
      },
    });

    const jsonText = response.text.trim();
    const puzzleData = JSON.parse(jsonText);
    
    // Basic validation
    if (![5, 7].includes(puzzleData.gridSize)) {
        puzzleData.gridSize = gridSize;
    }

    return puzzleData as PuzzleDefinition;
  } catch (error) {
    console.error("Error generating puzzle:", error);
    // Fallback to a simple default puzzle on API error
    return {
      gridSize: 5,
      start: { x: 0, y: 4 },
      end: { x: 4, y: 0 },
      elements: [
        { type: PuzzleElementType.BlackSquare, position: { x: 0, y: 0 } },
        { type: PuzzleElementType.BlackSquare, position: { x: 1, y: 2 } },
        { type: PuzzleElementType.WhiteSquare, position: { x: 2, y: 1 } },
        { type: PuzzleElementType.WhiteSquare, position: { x: 3, y: 3 } },
        { type: PuzzleElementType.Hexagon, position: { x: 2, y: 2 } },
      ],
    };
  }
};
