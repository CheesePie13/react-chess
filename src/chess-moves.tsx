import { Piece, TileData } from "./constants";
import { idxAdd, idxAddRelative } from "./utils"

export function findPossibleMoves(selectedTileIdx: number|null, tiles: Array<TileData|null>) {
	if (selectedTileIdx == null) {
		return [];
	}
	
	let selectedTile = tiles[selectedTileIdx];
	if (selectedTile == null) {
		return [];
	}
	
	switch (selectedTile.piece) {
		case Piece.Pawn:   return findPossiblePawnMoves(selectedTileIdx, selectedTile, tiles);
		case Piece.Bishop: return findPossibleBishopMoves(selectedTileIdx, selectedTile, tiles);
		case Piece.Knight: return findPossibleKnightMoves(selectedTileIdx, selectedTile, tiles);
		case Piece.Rook:   return findPossibleRookMoves(selectedTileIdx, selectedTile, tiles);
		case Piece.Queen:  return findPossibleQueenMoves(selectedTileIdx, selectedTile, tiles);
		case Piece.King:   return findPossibleKingMoves(selectedTileIdx, selectedTile, tiles);
		default:           return [];
	}
}

// Find moves going in a single direction (horizontal, vertical or diagonal)
function findPossibleMovesInDirection(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>, xDir: number, yDir: number) {
	let moves: Array<number> = [];
	
	let x = xDir;
	let y = yDir;

	let idx = idxAdd(selectedTileIdx, x, y);
	while (idx != null) {
		let tile = tiles[idx];
		if (tile != null) {
			if (tile.owner !== selectedTile.owner) {
				moves.push(idx);
			}
			break;
		}

		moves.push(idx)

		x += xDir;
		y += yDir;
		idx = idxAdd(selectedTileIdx, x, y);
	}

	return moves;
}

function findPossibleMove(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>, xRelative: number, yRelative: number) {
	let idx = idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles[idx];
	return tile == null || tile.owner !== selectedTile.owner ? [idx] : [];
}

function findPossibleMoveAttack(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>, xRelative: number, yRelative: number) {
	let idx = idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles[idx];
	return tile != null && tile.owner !== selectedTile.owner ? [idx] : [];
}

function findPossibleMoveNoAttack(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>, xRelative: number, yRelative: number) {
	let idx = idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles[idx];
	return tile == null ? [idx] : [];
}

function findPossiblePawnMoves(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>) {
	let moves: Array<number> = [];
			
	// One tile forward
	moves.push(...findPossibleMoveNoAttack(selectedTileIdx, selectedTile, tiles, 0, 1));
	moves.push(...findPossibleMoveAttack(selectedTileIdx, selectedTile, tiles,   1, 1));
	moves.push(...findPossibleMoveAttack(selectedTileIdx, selectedTile, tiles,  -1, 1));
	
	// Pawns that haven't moved yet can move 2 spaces forward
	if (!selectedTile.hasMoved) {
		moves.push(...findPossibleMoveNoAttack(selectedTileIdx, selectedTile, tiles, 0, 2));
	}

	return moves;
}

function findPossibleBishopMoves(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1, -1));

	return moves;
}

function findPossibleKnightMoves(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1,   2));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1,  -2));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  2,   1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  2,  -1));

	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1,   2));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1,  -2));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -2,   1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -2,  -1));

	return moves;
}

function findPossibleRookMoves(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>) {
	debugger;
	let moves: Array<number> = [];

	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  0, -1));

	return moves;
}

function findPossibleQueenMoves(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  0, -1));

	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1, -1));

	return moves;
}

function findPossibleKingMoves(selectedTileIdx: number, selectedTile: TileData, tiles: Array<TileData|null>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  0, -1));

	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1, -1));

	return moves;
}