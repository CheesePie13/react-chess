import { coordToIdx } from "./board";
import { getOtherPlayer, performMove, performPawnPromotion, testingExports } from "./game-logic";
import { Piece, Player } from "./types";

test("getOtherPlayer()", () => {
	expect(getOtherPlayer(Player.White)).toBe(Player.Black);
	expect(getOtherPlayer(Player.Black)).toBe(Player.White);
});

test("performMove()", () => {
	let fromIdx = coordToIdx(5, 6);
	let toIdx = coordToIdx(5, 4);
	let tiles = new Map([
		[fromIdx, {owner: Player.White, piece: Piece.Pawn, hasMoved: false}]
	]);

	let expectedTiles = new Map([
		[toIdx, {owner: Player.White, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(performMove(fromIdx, toIdx, tiles)).toStrictEqual([expectedTiles, null]);
});

test("performMove() - pawn promotion", () => {
	let fromIdx = coordToIdx(3, 1);
	let toIdx = coordToIdx(3, 0);
	let tiles = new Map([
		[fromIdx, {owner: Player.White, piece: Piece.Pawn, hasMoved: true}]
	]);

	let expectedTiles = new Map([
		[toIdx, {owner: Player.White, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(performMove(fromIdx, toIdx, tiles)).toStrictEqual([expectedTiles, toIdx]);
});

test("performMove() - castling", () => {
	let fromIdx = coordToIdx(4, 7);
	let toIdx = coordToIdx(2, 7);
	let tiles = new Map([
		[fromIdx,          {owner: Player.White, piece: Piece.King, hasMoved: false}],
		[coordToIdx(0, 7), {owner: Player.White, piece: Piece.Rook, hasMoved: false}]
	]);

	let expectedTiles = new Map([
		[toIdx,            {owner: Player.White, piece: Piece.King, hasMoved: true}],
		[coordToIdx(3, 7), {owner: Player.White, piece: Piece.Rook, hasMoved: true}]
	]);

	expect(performMove(fromIdx, toIdx, tiles)).toStrictEqual([expectedTiles, null]);
});

test("performPawnPromotion()", () => {
	let pawnIdx = coordToIdx(3, 0);
	let tiles = new Map([
		[pawnIdx, {owner: Player.White, piece: Piece.Pawn, hasMoved: true}]
	]);

	let expectedTiles = new Map([
		[pawnIdx, {owner: Player.White, piece: Piece.Queen, hasMoved: true}]
	]);

	expect(performPawnPromotion(pawnIdx, Piece.Queen, tiles)).toStrictEqual(expectedTiles);
});

test("findPossiblePawnMoves()", () => {
	let tileIdx = coordToIdx(2, 6);
	let tile = {owner: Player.White, piece: Piece.Pawn, hasMoved: false};
	let tiles = new Map([
		[tileIdx, tile],
		[coordToIdx(1, 5), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(3, 5), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(testingExports.findPossiblePawnMoves(tileIdx, tile, tiles).sort()).toStrictEqual([
		coordToIdx(2, 5),
		coordToIdx(2, 4),
		coordToIdx(1, 5),
		coordToIdx(3, 5)
	].sort())
});

test("findPossibleBishopMoves()", () => {
	let tileIdx = coordToIdx(2, 6);
	let tile = {owner: Player.White, piece: Piece.Bishop, hasMoved: true};
	let tiles = new Map([
		[tileIdx, tile],
		[coordToIdx(0, 4), {owner: Player.White, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(4, 4), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(testingExports.findPossibleBishopMoves(tileIdx, tile, tiles).sort()).toStrictEqual([
		coordToIdx(3, 5),
		coordToIdx(3, 7),
		coordToIdx(1, 7),
		coordToIdx(1, 5),
		coordToIdx(4, 4)
	].sort())
});

test("findPossibleKnightMoves()", () => {
	let tileIdx = coordToIdx(1, 7);
	let tile = {owner: Player.White, piece: Piece.Knight, hasMoved: true};
	let tiles = new Map([
		[tileIdx, tile],
		[coordToIdx(0, 5), {owner: Player.White, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(2, 5), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(testingExports.findPossibleKnightMoves(tileIdx, tile, tiles).sort()).toStrictEqual([
		coordToIdx(2, 5),
		coordToIdx(3, 6)
	].sort())
});

test("findPossibleRookMoves()", () => {
	let tileIdx = coordToIdx(1, 6);
	let tile = {owner: Player.White, piece: Piece.Rook, hasMoved: true};
	let tiles = new Map([
		[tileIdx, tile],
		[coordToIdx(1, 4), {owner: Player.White, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(3, 6), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(testingExports.findPossibleRookMoves(tileIdx, tile, tiles).sort()).toStrictEqual([
		coordToIdx(2, 6),
		coordToIdx(1, 7),
		coordToIdx(0, 6),
		coordToIdx(1, 5),
		coordToIdx(3, 6)
	].sort())
});

test("findPossibleQueenMoves()", () => {
	let tileIdx = coordToIdx(1, 6);
	let tile = {owner: Player.White, piece: Piece.Rook, hasMoved: true};
	let tiles = new Map([
		[tileIdx, tile],
		[coordToIdx(1, 4), {owner: Player.White, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(3, 4), {owner: Player.White, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(3, 6), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}]
	]);

	expect(testingExports.findPossibleQueenMoves(tileIdx, tile, tiles).sort()).toStrictEqual([
		coordToIdx(2, 6),
		coordToIdx(2, 7),
		coordToIdx(1, 7),
		coordToIdx(0, 7),
		coordToIdx(0, 6),
		coordToIdx(0, 5),
		coordToIdx(1, 5),
		coordToIdx(2, 5),
		coordToIdx(3, 6)
	].sort())
});

test("findPossibleKingMoves()", () => {
	let tileIdx = coordToIdx(4, 7);
	let tile = {owner: Player.White, piece: Piece.Rook, hasMoved: false};
	let tiles = new Map([
		[tileIdx, tile],
		[coordToIdx(4, 6), {owner: Player.White, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(3, 6), {owner: Player.Black, piece: Piece.Pawn, hasMoved: true}],
		[coordToIdx(7, 7), {owner: Player.White, piece: Piece.Rook, hasMoved: false}]
	]);

	expect(testingExports.findPossibleKingMoves(tileIdx, tile, tiles).sort()).toStrictEqual([
		coordToIdx(3, 7),
		coordToIdx(3, 6),
		coordToIdx(5, 6),
		coordToIdx(5, 7),
		coordToIdx(6, 7) // Castling
	].sort())
});
