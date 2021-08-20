import { Player, Piece, TileData, GRID_WIDTH, GRID_HEIGHT } from "./constants"

export function assertIsDefined<T>(val: T, msg?: string): asserts val is NonNullable<T> {
	if (val === undefined || val === null) {
		throw `Expected to be defined, but received ${val}. ` + msg;
	}
}

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

export function idxSub(toIdx: number, fromIdx: number) {
	let [fromX, fromY] = idxToCoord(fromIdx);
	let [toX, toY]     = idxToCoord(toIdx);
	return [toX - fromX, toY - fromY];
}

export function createInitialBoard(): ReadonlyMap<number,TileData> {
	return new Map([
		// Black pieces at the top
		[ 0, {owner: Player.Black, piece: Piece.Rook,   hasMoved: false}],
		[ 1, {owner: Player.Black, piece: Piece.Bishop, hasMoved: false}],
		[ 2, {owner: Player.Black, piece: Piece.Knight, hasMoved: false}],
		[ 3, {owner: Player.Black, piece: Piece.Queen,  hasMoved: false}],
		[ 4, {owner: Player.Black, piece: Piece.King,   hasMoved: false}],
		[ 5, {owner: Player.Black, piece: Piece.Knight, hasMoved: false}],
		[ 6, {owner: Player.Black, piece: Piece.Bishop, hasMoved: false}],
		[ 7, {owner: Player.Black, piece: Piece.Rook,   hasMoved: false}],

		[ 8, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[ 9, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[10, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[11, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[12, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[13, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[14, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],
		[15, {owner: Player.Black, piece: Piece.Pawn,   hasMoved: false}],

		// White pieces on the bottom
		[48, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[49, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[50, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[51, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[52, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[53, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[54, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		[55, {owner: Player.White, piece: Piece.Pawn,   hasMoved: false}],
		
		[56, {owner: Player.White, piece: Piece.Rook,   hasMoved: false}],
		[57, {owner: Player.White, piece: Piece.Bishop, hasMoved: false}],
		[58, {owner: Player.White, piece: Piece.Knight, hasMoved: false}],
		[59, {owner: Player.White, piece: Piece.Queen,  hasMoved: false}],
		[60, {owner: Player.White, piece: Piece.King,   hasMoved: false}],
		[61, {owner: Player.White, piece: Piece.Knight, hasMoved: false}],
		[62, {owner: Player.White, piece: Piece.Bishop, hasMoved: false}],
		[63, {owner: Player.White, piece: Piece.Rook,   hasMoved: false}]
	]);
}