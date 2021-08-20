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
