import { Player, Piece, TileData, GRID_WIDTH, GRID_HEIGHT } from "./constants"

export function idxToCoord(idx: number) {
	return [idx % GRID_WIDTH, Math.floor(idx / GRID_WIDTH)];
}

export function coordToIdx(x: number, y: number) {
	return y * GRID_WIDTH + x;
}

export function isValidCoord(x: number, y:number) {
	return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function isValidIdx(idx: number) {
	return idx >= 0 && idx < GRID_WIDTH * GRID_HEIGHT;
}

export function idxAdd(idx: number, xOffset: number, yOffset: number) {
	let [x, y] = idxToCoord(idx);
	x += xOffset;
	y += yOffset;

	if (!isValidCoord(x, y)) {
		return null;
	}

	return coordToIdx(x, y);
}

// White: Forward is up (negative), Black: Forward is down (positive)
export function idxAddRelative(idx: number, player: Player, xOffset: number, yOffset: number) {
	if (player === Player.White) {
		xOffset *= -1;
		yOffset *= -1;
	}

	return idxAdd(idx, xOffset, yOffset);
}

export function createInitialBoard(): Array<TileData|null> {
	return [
		{owner: Player.Black, piece: Piece.Rook,   hasMoved: false},
		{owner: Player.Black, piece: Piece.Bishop, hasMoved: false},
		{owner: Player.Black, piece: Piece.Knight, hasMoved: false},
		{owner: Player.Black, piece: Piece.Queen,  hasMoved: false},
		{owner: Player.Black, piece: Piece.King,   hasMoved: false},
		{owner: Player.Black, piece: Piece.Knight, hasMoved: false},
		{owner: Player.Black, piece: Piece.Bishop, hasMoved: false},
		{owner: Player.Black, piece: Piece.Rook,   hasMoved: false},

		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.Black, piece: Piece.Pawn, hasMoved: false},
	
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		{owner: Player.White, piece: Piece.Pawn, hasMoved: false},
		
		{owner: Player.White, piece: Piece.Rook,   hasMoved: false},
		{owner: Player.White, piece: Piece.Bishop, hasMoved: false},
		{owner: Player.White, piece: Piece.Knight, hasMoved: false},
		{owner: Player.White, piece: Piece.Queen,  hasMoved: false},
		{owner: Player.White, piece: Piece.King,   hasMoved: false},
		{owner: Player.White, piece: Piece.Knight, hasMoved: false},
		{owner: Player.White, piece: Piece.Bishop, hasMoved: false},
		{owner: Player.White, piece: Piece.Rook,   hasMoved: false}
	];
}