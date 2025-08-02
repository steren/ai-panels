import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreatePanelSchema, SolutionSchema, Panel, Grid, Symbol, CellType, SymbolType, Color } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Generate a random panel
function generatePanel(width: number, height: number, difficulty: number): Panel {
  // Create basic grid structure
  const cells: CellType[][] = Array(height).fill(null).map(() => 
    Array(width).fill('empty' as CellType)
  );

  // Add walls randomly based on difficulty
  const wallDensity = Math.min(0.1 + (difficulty - 1) * 0.05, 0.3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.random() < wallDensity && !(x === 0 && y === 0) && !(x === width - 1 && y === height - 1)) {
        cells[y][x] = 'wall';
      }
    }
  }

  // Set start and end points
  const startX = 0;
  const startY = 0;
  const endX = width - 1;
  const endY = height - 1;
  
  cells[startY][startX] = 'start';
  cells[endY][endX] = 'end';

  const grid: Grid = {
    width,
    height,
    cells,
    startX,
    startY,
    endX,
    endY,
  };

  // Generate symbols based on difficulty
  const symbols: Symbol[] = [];
  const symbolCount = Math.floor(difficulty * 2 + Math.random() * 3);
  const colors: Color[] = ['white', 'black', 'red', 'blue', 'yellow'];
  const symbolTypes: SymbolType[] = ['dot', 'square', 'hexagon'];

  for (let i = 0; i < symbolCount; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    
    // Don't place symbols on walls or start/end
    if (cells[y][x] === 'wall' || (x === startX && y === startY) || (x === endX && y === endY)) {
      continue;
    }

    const symbolType = symbolTypes[Math.floor(Math.random() * symbolTypes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    symbols.push({
      type: symbolType,
      color,
      x,
      y,
    });
  }

  return {
    grid,
    symbols,
    difficulty,
  };
}

// API Routes
app.get("/api/panels", async (c) => {
  const db = c.env.DB;
  const result = await db.prepare("SELECT * FROM panels ORDER BY created_at DESC LIMIT 20").all();
  
  const panels = result.results.map((row: any) => ({
    id: row.id,
    name: row.name,
    grid: JSON.parse(row.grid_data),
    symbols: JSON.parse(row.symbols_data),
    solution: row.solution_path ? JSON.parse(row.solution_path) : null,
    difficulty: row.difficulty,
  }));

  return c.json({ panels });
});

app.post("/api/panels", zValidator("json", CreatePanelSchema), async (c) => {
  const { name, width, height, difficulty } = c.req.valid("json");
  const db = c.env.DB;

  const panel = generatePanel(width, height, difficulty);
  
  await db.prepare(`
    INSERT INTO panels (name, width, height, grid_data, symbols_data, difficulty)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    name || `Panel ${Date.now()}`,
    width,
    height,
    JSON.stringify(panel.grid),
    JSON.stringify(panel.symbols),
    difficulty
  ).run();

  return c.json({ success: true, panel });
});

app.get("/api/panels/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.env.DB;
  
  const result = await db.prepare("SELECT * FROM panels WHERE id = ?").bind(id).first();
  
  if (!result) {
    return c.json({ error: "Panel not found" }, 404);
  }

  const panel = {
    id: result.id,
    name: result.name,
    grid: JSON.parse(result.grid_data as string),
    symbols: JSON.parse(result.symbols_data as string),
    solution: result.solution_path ? JSON.parse(result.solution_path as string) : null,
    difficulty: result.difficulty,
  };

  return c.json({ panel });
});

app.post("/api/solutions", zValidator("json", SolutionSchema), async (c) => {
  const { panelId, path, solveTime } = c.req.valid("json");
  const db = c.env.DB;

  // Get the panel to validate the solution
  const panelResult = await db.prepare("SELECT * FROM panels WHERE id = ?").bind(panelId).first();
  
  if (!panelResult) {
    return c.json({ error: "Panel not found" }, 404);
  }

  const grid = JSON.parse(panelResult.grid_data as string);
  
  // Basic validation: check if path is valid (simplified)
  const isValid = validateSolution(grid, path);

  await db.prepare(`
    INSERT INTO user_solutions (panel_id, solution_path, is_correct, solve_time)
    VALUES (?, ?, ?, ?)
  `).bind(
    panelId,
    JSON.stringify(path),
    isValid ? 1 : 0,
    solveTime || null
  ).run();

  return c.json({ valid: isValid });
});

// Simplified solution validation
function validateSolution(grid: Grid, path: Array<{x: number, y: number}>): boolean {
  if (path.length < 2) return false;
  
  const start = path[0];
  const end = path[path.length - 1];
  
  // Check if path starts at start point and ends at end point
  if (start.x !== grid.startX || start.y !== grid.startY) return false;
  if (end.x !== grid.endX || end.y !== grid.endY) return false;
  
  // Check if path is continuous and doesn't go through walls
  for (let i = 1; i < path.length; i++) {
    const curr = path[i];
    const prev = path[i - 1];
    
    // Check bounds
    if (curr.x < 0 || curr.x >= grid.width || curr.y < 0 || curr.y >= grid.height) {
      return false;
    }
    
    // Check if current cell is a wall
    if (grid.cells[curr.y][curr.x] === 'wall') {
      return false;
    }
    
    // Check if movement is valid (adjacent cells only)
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // Valid move
    } else {
      return false;
    }
  }
  
  return true;
}

export default app;
