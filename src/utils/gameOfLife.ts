export class GameOfLife {
    private activeCells: Array<[number, number]>;

    constructor() {
        this.activeCells = [];
    }

    addCell(x: number, y: number): void {
        this.activeCells.push([x, y]);
    }

    removeCell(x: number, y: number): void {
        this.activeCells = this.activeCells.filter(([cx, cy]) => cx !== x || cy !== y);
    }

    isActive(x: number, y: number): boolean {
        return this.activeCells.some(([cx, cy]) => cx === x && cy === y);
    }

    private getNeighbors(x: number, y: number): Array<[number, number]> {
        const neighbors: Array<[number, number]> = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                neighbors.push([x + dx, y + dy]);
            }
        }
        return neighbors;
    }

    private countActiveNeighbors(x: number, y: number): number {
        return this.getNeighbors(x, y).reduce(
            (count, [nx, ny]) => count + (this.isActive(nx, ny) ? 1 : 0),
            0
        );
    }

    step(): void {
        const toEvaluate = new Set<string>();
        const nextState: Array<[number, number]> = [];

        this.activeCells.forEach(([x, y]) => {
            toEvaluate.add(`${x},${y}`);
            this.getNeighbors(x, y).forEach(([nx, ny]) => {
                toEvaluate.add(`${nx},${ny}`);
            });
        });

        toEvaluate.forEach((cell: string) => {
            const [x, y] = cell.split(",").map(Number);
            const isActive = this.isActive(x, y);
            const activeNeighbors = this.countActiveNeighbors(x, y);
            if (
                (isActive && (activeNeighbors === 2 || activeNeighbors === 3)) ||
                (!isActive && activeNeighbors === 3)
            ) {
                nextState.push([x, y]);
            }
        });

        this.activeCells = nextState;
    }
}