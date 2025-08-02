import z from "zod";

// Grid cell types
export const CellTypeSchema = z.enum(['empty', 'wall', 'start', 'end']);
export type CellType = z.infer<typeof CellTypeSchema>;

// Symbol types for puzzle mechanics
export const SymbolTypeSchema = z.enum(['dot', 'square', 'hexagon', 'triangle', 'star', 'elimination']);
export type SymbolType = z.infer<typeof SymbolTypeSchema>;

// Colors for symbols
export const ColorSchema = z.enum(['white', 'black', 'red', 'blue', 'yellow', 'green', 'orange', 'purple']);
export type Color = z.infer<typeof ColorSchema>;

// Individual symbol definition
export const SymbolSchema = z.object({
  type: SymbolTypeSchema,
  color: ColorSchema.optional(),
  value: z.number().optional(), // For triangles (error count)
  x: z.number(),
  y: z.number(),
});
export type Symbol = z.infer<typeof SymbolSchema>;

// Grid definition
export const GridSchema = z.object({
  width: z.number().min(3).max(20),
  height: z.number().min(3).max(20),
  cells: z.array(z.array(CellTypeSchema)),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
});
export type Grid = z.infer<typeof GridSchema>;

// Panel definition
export const PanelSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  grid: GridSchema,
  symbols: z.array(SymbolSchema),
  solution: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  difficulty: z.number().min(1).max(10).default(1),
});
export type Panel = z.infer<typeof PanelSchema>;

// API schemas
export const CreatePanelSchema = z.object({
  name: z.string().optional(),
  width: z.number().min(3).max(20),
  height: z.number().min(3).max(20),
  difficulty: z.number().min(1).max(10).default(1),
});

export const SolutionSchema = z.object({
  panelId: z.number(),
  path: z.array(z.object({ x: z.number(), y: z.number() })),
  solveTime: z.number().optional(),
});

export type CreatePanelRequest = z.infer<typeof CreatePanelSchema>;
export type SolutionRequest = z.infer<typeof SolutionSchema>;
