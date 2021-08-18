export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 8;

export enum Player {
	White,
	Black
}

export enum Piece {
	Pawn,
	Bishop,
	Knight,
	Rook,
	Queen,
	King
}

export interface TileData {
	readonly owner: Player,
	readonly piece: Piece,
	readonly hasMoved: boolean
}
