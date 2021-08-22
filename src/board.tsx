import { Player, Piece, Tile } from "./types";

export const WIDTH = 8;
export const HEIGHT = 8;

/**
 * Convert a board idx to an x and y coordinate
 */
export function idxToCoord(idx: number) {
	return [idx % WIDTH, Math.floor(idx / WIDTH)];
}

/**
 * Convert an x and y coordinate to a board idx
 */
export function coordToIdx(x: number, y: number) {
	return y * WIDTH + x;
}

/**
 * Is the x and y coordinate on the board?
 */
export function isValidCoord(x: number, y:number) {
	return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

/**
 * Is the idx on the board?
 */
export function isValidIdx(idx: number) {
	return idx >= 0 && idx < WIDTH * HEIGHT;
}

/**
 * And an x and y offset to the tile idx
 */
export function idxAdd(idx: number, xOffset: number, yOffset: number) {
	let [x, y] = idxToCoord(idx);
	x += xOffset;
	y += yOffset;

	if (!isValidCoord(x, y)) {
		return null;
	}

	return coordToIdx(x, y);
}

/**
 * And an x and y offset to the tile idx, so that positive y is forward 
 * and positive x is right from both player's perspectives
 */
export function idxAddRelative(idx: number, player: Player, xOffset: number, yOffset: number) {
	if (player === Player.White) {
		xOffset *= -1;
		yOffset *= -1;
	}

	return idxAdd(idx, xOffset, yOffset);
}

/**
 * Get the x and y difference between 2 board indexes
 */
export function idxSub(toIdx: number, fromIdx: number) {
	let [fromX, fromY] = idxToCoord(fromIdx);
	let [toX, toY]     = idxToCoord(toIdx);
	return [toX - fromX, toY - fromY];
}

/**
 * Create the tile map for the standard chess stating board
 */
export function createStarterBoard(): ReadonlyMap<number,Tile> {
	return new Map([
		// Black pieces at the top
		[ 0, {owner: Player.Black, piece: Piece.Rook,   hasMoved: false}],
		[ 1, {owner: Player.Black, piece: Piece.Knight, hasMoved: false}],
		[ 2, {owner: Player.Black, piece: Piece.Bishop, hasMoved: false}],
		[ 3, {owner: Player.Black, piece: Piece.Queen,  hasMoved: false}],
		[ 4, {owner: Player.Black, piece: Piece.King,   hasMoved: false}],
		[ 5, {owner: Player.Black, piece: Piece.Bishop, hasMoved: false}],
		[ 6, {owner: Player.Black, piece: Piece.Knight, hasMoved: false}],
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
		[57, {owner: Player.White, piece: Piece.Knight, hasMoved: false}],
		[58, {owner: Player.White, piece: Piece.Bishop, hasMoved: false}],
		[59, {owner: Player.White, piece: Piece.Queen,  hasMoved: false}],
		[60, {owner: Player.White, piece: Piece.King,   hasMoved: false}],
		[61, {owner: Player.White, piece: Piece.Bishop, hasMoved: false}],
		[62, {owner: Player.White, piece: Piece.Knight, hasMoved: false}],
		[63, {owner: Player.White, piece: Piece.Rook,   hasMoved: false}]
	]);
}
