import { Player, Piece, TileData, GRID_WIDTH } from "./constants";
import { coordToIdx, idxAdd, idxAddRelative, idxSub, idxToCoord } from "./utils"

function findPossibleMoves(selectedTileIdx: number|null, tiles: ReadonlyMap<number,TileData>) {
	if (selectedTileIdx == null) {
		return [];
	}
	
	let selectedTile = tiles.get(selectedTileIdx);
	if (selectedTile === undefined) {
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

export function findAllPossibleMoves(tiles: ReadonlyMap<number,TileData>, playerTurn: Player) {
	console.log("Find");

	let allMoves: Map<number,Array<number>> = new Map();

	for (let [idx, tile] of tiles.entries()) {
		if (tile.owner !== playerTurn) {
			continue;
		}

		let moves = findPossibleMoves(idx, tiles).filter(move => isValidMove(idx, move, tiles, playerTurn));
		allMoves.set(idx, moves);
	}

	return allMoves as ReadonlyMap<number,Array<number>>;
}

function isValidMove(fromIdx: number, toIdx: number, tiles: ReadonlyMap<number,TileData>, playerTurn: Player) {
	let tile = tiles.get(fromIdx);
	if (tile === undefined) {
		return false;
	}

	let [xDelta, yDelta] = idxSub(toIdx, fromIdx);
	if (tile.piece === Piece.King && Math.abs(xDelta) > 1) {
		return isValidCastlingMove(fromIdx, toIdx, tiles, playerTurn);
	}

	let newTiles = new Map(tiles);
	newTiles.set(toIdx, tile);
	newTiles.delete(fromIdx);

	let isValid = !isInCheck(newTiles, playerTurn);
	// let [fromX, fromY] = idxToCoord(fromIdx);
	// let [toX, toY] = idxToCoord(toIdx);
	// if (isValid) {
	// 	console.log("  valid from (" + fromX + ", " + fromY + ") to (" + toX + ", " + toY + ")");
	// } else {
	// 	console.log("Invalid from (" + fromX + ", " + fromY + ") to (" + toX + ", " + toY + ")");
	// }

	return isValid;
}

function isValidCastlingMove(fromIdx: number, toIdx: number, tiles: ReadonlyMap<number,TileData>, playerTurn: Player) {
	let tile = tiles.get(fromIdx);
	if (tile === undefined) {
		return false;
	}

	let [fromX, fromY] = idxToCoord(fromIdx);
	let [toX, toY]     = idxToCoord(toIdx);

	if (fromY !== toY) {
		return false;
	}

	let dir = toX > fromX ? 1 : -1;

	let y = fromY;
	let x = fromX;
	while (x !== toX) {
		x += dir;

		let newTiles = new Map(tiles);
		let idx = coordToIdx(x, y);
		newTiles.set(idx, tile);
		newTiles.delete(fromIdx);

		if (isInCheck(newTiles, playerTurn)) {
			return false;
		}
	}

	return true;
}

function isInCheck(tiles: ReadonlyMap<number,TileData>, playerTurn: Player) {
	for (let [idx, tile] of tiles.entries()) {
		if (tile.owner === playerTurn) {
			continue;
		}

		let moves = findPossibleMoves(idx, tiles);
		let check = moves.some(move => {
			let tile = tiles.get(move);
			return tile !== undefined && tile.owner === playerTurn && tile.piece === Piece.King
		});

		if (check) {
			return true;
		}
	}

	return false;
}

// Find moves going in a single direction (horizontal, vertical or diagonal)
function findPossibleMovesInDirection(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>, xDir: number, yDir: number) {
	let moves: Array<number> = [];
	
	let x = xDir;
	let y = yDir;

	let idx = idxAdd(selectedTileIdx, x, y);
	while (idx != null) {
		let tile = tiles.get(idx);
		if (tile !== undefined) {
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

function findPossibleMove(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>, xRelative: number, yRelative: number) {
	let idx = idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles.get(idx);
	return tile === undefined || tile.owner !== selectedTile.owner ? [idx] : [];
}

function findPossibleMoveAttack(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>, xRelative: number, yRelative: number) {
	let idx = idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles.get(idx);
	return tile !== undefined && tile.owner !== selectedTile.owner ? [idx] : [];
}

function findPossibleMoveNoAttack(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>, xRelative: number, yRelative: number) {
	let idx = idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles.get(idx);
	return tile === undefined ? [idx] : [];
}

function findPossiblePawnMoves(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>) {
	let moves: Array<number> = [];
			
	// One tile forward
	moves.push(...findPossibleMoveNoAttack(selectedTileIdx, selectedTile, tiles, 0, 1));
	
	// Pawns that haven't moved yet can move 2 spaces forward
	if (moves.length > 0 && !selectedTile.hasMoved) {
		moves.push(...findPossibleMoveNoAttack(selectedTileIdx, selectedTile, tiles, 0, 2));
	}
	
	moves.push(...findPossibleMoveAttack(selectedTileIdx, selectedTile, tiles,   1, 1));
	moves.push(...findPossibleMoveAttack(selectedTileIdx, selectedTile, tiles,  -1, 1));

	return moves;
}

function findPossibleBishopMoves(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1, -1));

	return moves;
}

function findPossibleKnightMoves(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>) {
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

function findPossibleRookMoves(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findPossibleMovesInDirection(selectedTileIdx, selectedTile, tiles,  0, -1));

	return moves;
}

function findPossibleQueenMoves(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>) {
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

function findPossibleKingMoves(selectedTileIdx: number, selectedTile: TileData, tiles: ReadonlyMap<number,TileData>) {
	let moves: Array<number> = [];

	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  0, -1));

	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findPossibleMove(selectedTileIdx, selectedTile, tiles, -1, -1));

	// Castling
	if (!selectedTile.hasMoved) {
		let [selectedTileX, selectedTileY] = idxToCoord(selectedTileIdx);

		let leftRookIdx = coordToIdx(0, selectedTileY);
		let leftRookTile = tiles.get(leftRookIdx);
		if (leftRookTile !== undefined 
				&& leftRookTile.hasMoved === false 
				&& leftRookTile.owner === selectedTile.owner 
				&& leftRookTile.piece === Piece.Rook) {
			
			// Check that spaces between are empty
			let canMove = true;
			for (let x = 1; x < selectedTileX; x++) {
				let idx = coordToIdx(x, selectedTileY);
				if (tiles.get(idx) !== undefined) {
					canMove = false;
					break;
				}
			}

			if (canMove) {
				let moveIdx = idxAdd(selectedTileIdx, -2, 0);
				if (moveIdx !== null) {
					moves.push(moveIdx);
				}
			}
		}

		let rightRookIdx = coordToIdx(GRID_WIDTH - 1, selectedTileY);
		let rightRookTile = tiles.get(rightRookIdx);
		if (rightRookTile !== undefined 
				&& rightRookTile.hasMoved === false 
				&& rightRookTile.owner === selectedTile.owner 
				&& rightRookTile.piece === Piece.Rook) {
			
			// Check that spaces between are empty
			let canMove = true;
			for (let x = selectedTileX + 1; x < GRID_WIDTH - 1; x++) {
				let idx = coordToIdx(x, selectedTileY);
				if (tiles.get(idx) !== undefined) {
					canMove = false;
					break;
				}
			}

			if (canMove) {
				let moveIdx = idxAdd(selectedTileIdx, 2, 0);
				if (moveIdx !== null) {
					moves.push(moveIdx);
				}
			}
		}
	}

	return moves;
}