import { Player, Piece, Tile } from "./types";
import * as Board from "./board"
import { assertIsDefined } from "./utils";

export function getOtherPlayer(player: Player) {
	return player === Player.White ? Player.Black : Player.White
}

/**
 * Return the new tiles after a move
 * 
 * @return [tiles after move, idx of pawn to promote or null]
 */
export function performMove(fromIdx: number, toIdx: number, tiles: ReadonlyMap<number,Tile>) {
	let tile = tiles.get(fromIdx);
	assertIsDefined(tile);

	let newTile = {...tile, hasMoved: true};
	let newTiles = new Map(tiles);
	
	newTiles.delete(fromIdx);
	newTiles.set(toIdx, newTile);

	// Check if castling so we can move the rook too
	if (tile.piece === Piece.King) {
		let [xDelta, yDelta] = Board.idxSub(toIdx, fromIdx);
		if (xDelta > 1) {
			let [toX, toY] = Board.idxToCoord(toIdx);
			let rookTileIdx = Board.coordToIdx(Board.WIDTH - 1, toY);
			let rookTile = tiles.get(rookTileIdx);
			assertIsDefined(rookTile, "Rook is missing but castling move should have already been validate.");

			if (rookTile !== undefined) {
				let newRookTile = {...rookTile, hasMoved: true};
				let newRookTileIdx = Board.coordToIdx(toX - 1, toY);
				newTiles.set(newRookTileIdx, newRookTile);
				newTiles.delete(rookTileIdx);
			}

		} else if (xDelta < -1) {
			let [toX, toY] = Board.idxToCoord(toIdx);
			let rookTileIdx = Board.coordToIdx(0, toY);
			let rookTile = tiles.get(rookTileIdx);
			assertIsDefined(rookTile, "Rook is missing but castling move should have already been validate.");

			let newRookTile = {...rookTile, hasMoved: true};
			let newRookTileIdx = Board.coordToIdx(toX + 1, toY);
			newTiles.set(newRookTileIdx, newRookTile);
			newTiles.delete(rookTileIdx);
		}
	}

	// Check if pawn promotion needed
	if (tile.piece === Piece.Pawn && Board.idxAddRelative(toIdx, tile.owner, 0, 1) === null) {
		return [newTiles, toIdx] as [ReadonlyMap<number,Tile>, number | null];
	}

	return [newTiles, null] as [ReadonlyMap<number,Tile>, number | null];
}

/**
 * Promote a pawn to the given new piece and return the new tiles
 */
export function performPawnPromotion(pawnIdx: number, newPiece: Piece, tiles: ReadonlyMap<number,Tile>) {
	let tile = tiles.get(pawnIdx);
	assertIsDefined(tile);
	
	let newTile = {...tile, piece: newPiece};
	let newTiles = new Map(tiles);
	
	newTiles.set(pawnIdx, newTile);
	return newTiles;
}

/**
 * Find all the available moves for the current player
 * 
 * @return [all possible moves, the player who won or null if no one has one yet]
 */
export function findAllMovesAndWinner(tiles: ReadonlyMap<number,Tile>, playerTurn: Player) {
	let allMoves: Map<number,Array<number>> = new Map();
	let moveCount = 0;

	for (let [idx, tile] of tiles.entries()) {
		if (tile.owner !== playerTurn) {
			continue;
		}

		let moves = findTileMoves(idx, tiles)
				.filter(move => !willMoveCauseSelfCheck(idx, move, tiles, playerTurn));
				
		moveCount += moves.length;

		allMoves.set(idx, moves);
	}

	let winner = moveCount === 0 ? getOtherPlayer(playerTurn) : null;
	return [allMoves, winner] as [ReadonlyMap<number,Array<number>>, Player | null];
}

/**
 * Is the given move a castling move?
 */
function isCastlingMove(fromIdx: number, toIdx: number, tile: Tile) {
	if (tile.piece !== Piece.King) {
		return false;
	}

	// Check if horizontal move is greater than 1
	let [xDelta, yDelta] = Board.idxSub(toIdx, fromIdx);
	return Math.abs(xDelta) > 1;
}

/**
 * Find all the moves a piece on the given tile can make 
 * (does not check if moves will put the player into check)
 * 
 * @return An array of tile idx that the given tile can move to
 */
function findTileMoves(selectedTileIdx: number|null, tiles: ReadonlyMap<number,Tile>) {
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

/**
 * Check if a move will put the player into check
 */
function willMoveCauseSelfCheck(fromIdx: number, toIdx: number, tiles: ReadonlyMap<number,Tile>, playerTurn: Player) {
	let tile = tiles.get(fromIdx);
	assertIsDefined(tile);

	// Castling check is different
	if (isCastlingMove(fromIdx, toIdx, tile)) {
		return willCastlingMoveCauseSelfCheck(fromIdx, toIdx, tiles, playerTurn);
	}

	let newTiles = new Map(tiles);
	newTiles.set(toIdx, tile);
	newTiles.delete(fromIdx);

	

	return isPlayerInCheck(newTiles, playerTurn);
}

/**
 * Check if a castling move will put the player into check
 */
function willCastlingMoveCauseSelfCheck(fromIdx: number, toIdx: number, tiles: ReadonlyMap<number,Tile>, playerTurn: Player) {
	let tile = tiles.get(fromIdx);
	assertIsDefined(tile);

	let [fromX, fromY] = Board.idxToCoord(fromIdx);
	let [toX, toY]     = Board.idxToCoord(toIdx);
	console.assert(fromY === toY);

	let dir = toX > fromX ? 1 : -1;

	let y = fromY;
	let x = fromX;
	while (x !== toX) {
		x += dir;
		let idx = Board.coordToIdx(x, y);

		let newTiles = new Map(tiles);
		newTiles.set(idx, tile);
		newTiles.delete(fromIdx);

		if (isPlayerInCheck(newTiles, playerTurn)) {
			return true;
		}
	}

	return false;
}

/**
 * Check if the player is in check
 */
function isPlayerInCheck(tiles: ReadonlyMap<number,Tile>, player: Player) {
	for (let [idx, tile] of tiles.entries()) {
		if (tile.owner === player) {
			continue;
		}

		let moves = findTileMoves(idx, tiles);
		let check = moves.some(move => {
			let tile = tiles.get(move);
			return tile !== undefined && tile.owner === player && tile.piece === Piece.King
		});

		if (check) {
			return true;
		}
	}

	return false;
}

/**
 * Find moves by stepping in a single direction until another piece or the edge of the board is reached
 */
function findMovesInDirection(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>, xDir: number, yDir: number) {
	let moves: Array<number> = [];
	
	let x = xDir;
	let y = yDir;

	let idx = Board.idxAdd(selectedTileIdx, x, y);
	while (idx != null) {
		let tile = tiles.get(idx);
		if (tile !== undefined) {
			// Include the tile if it's an opponent's piece
			if (tile.owner !== selectedTile.owner) {
				moves.push(idx);
			}
			break;
		}

		moves.push(idx)

		x += xDir;
		y += yDir;
		idx = Board.idxAdd(selectedTileIdx, x, y);
	}

	return moves;
}

/**
 * Check if there is a possible move to the relative offset (the tile is empty or an opponents piece is there)
 */
function findMove(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>, xRelative: number, yRelative: number) {
	let idx = Board.idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles.get(idx);
	return tile === undefined || tile.owner !== selectedTile.owner ? [idx] : [];
}

/**
 * Check if there is a possible attack move to the relative offset (an opponents piece is there)
 */
function findPossibleMoveAttack(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>, xRelative: number, yRelative: number) {
	let idx = Board.idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles.get(idx);
	return tile !== undefined && tile.owner !== selectedTile.owner ? [idx] : [];
}

/**
 * Check if there is a possible non-attack move to the relative offset (the tile is empty)
 */
function findPossibleMoveNoAttack(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>, xRelative: number, yRelative: number) {
	let idx = Board.idxAddRelative(selectedTileIdx, selectedTile.owner, xRelative, yRelative);
	if (idx == null) {
		return [];
	}

	let tile = tiles.get(idx);
	return tile === undefined ? [idx] : [];
}

/**
 * Find all the possible moves for a pawn a the given idx
 */
function findPossiblePawnMoves(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>) {
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

/**
 * Find all the possible moves for a bishop a the given idx
 */
function findPossibleBishopMoves(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>) {
	let moves: Array<number> = [];

	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles, -1, -1));

	return moves;
}

/**
 * Find all the possible moves for a knight a the given idx
 */
function findPossibleKnightMoves(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>) {
	let moves: Array<number> = [];

	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  1,   2));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  1,  -2));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  2,   1));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  2,  -1));

	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -1,   2));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -1,  -2));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -2,   1));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -2,  -1));

	return moves;
}

/**
 * Find all the possible moves for a rook a the given idx
 */
function findPossibleRookMoves(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>) {
	let moves: Array<number> = [];

	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  0, -1));

	return moves;
}

/**
 * Find all the possible moves for a queen a the given idx
 */
function findPossibleQueenMoves(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>) {
	let moves: Array<number> = [];

	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  0, -1));

	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findMovesInDirection(selectedTileIdx, selectedTile, tiles, -1, -1));

	return moves;
}

/**
 * Find all the possible moves for a king a the given idx
 */
function findPossibleKingMoves(selectedTileIdx: number, selectedTile: Tile, tiles: ReadonlyMap<number,Tile>) {
	let moves: Array<number> = [];

	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  1,  0));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  0,  1));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -1,  0));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  0, -1));

	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  1,  1));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles,  1, -1));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -1,  1));
	moves.push(...findMove(selectedTileIdx, selectedTile, tiles, -1, -1));

	// Castling
	if (!selectedTile.hasMoved) {
		let [selectedTileX, selectedTileY] = Board.idxToCoord(selectedTileIdx);

		let leftRookIdx = Board.coordToIdx(0, selectedTileY);
		let leftRookTile = tiles.get(leftRookIdx);
		if (leftRookTile !== undefined 
				&& leftRookTile.hasMoved === false 
				&& leftRookTile.owner === selectedTile.owner 
				&& leftRookTile.piece === Piece.Rook) {
			
			// Check that spaces between are empty
			let canMove = true;
			for (let x = 1; x < selectedTileX; x++) {
				let idx = Board.coordToIdx(x, selectedTileY);
				if (tiles.get(idx) !== undefined) {
					canMove = false;
					break;
				}
			}

			if (canMove) {
				let moveIdx = Board.idxAdd(selectedTileIdx, -2, 0);
				if (moveIdx !== null) {
					moves.push(moveIdx);
				}
			}
		}

		let rightRookIdx = Board.coordToIdx(Board.WIDTH - 1, selectedTileY);
		let rightRookTile = tiles.get(rightRookIdx);
		if (rightRookTile !== undefined 
				&& rightRookTile.hasMoved === false 
				&& rightRookTile.owner === selectedTile.owner 
				&& rightRookTile.piece === Piece.Rook) {
			
			// Check that spaces between are empty
			let canMove = true;
			for (let x = selectedTileX + 1; x < Board.WIDTH - 1; x++) {
				let idx = Board.coordToIdx(x, selectedTileY);
				if (tiles.get(idx) !== undefined) {
					canMove = false;
					break;
				}
			}

			if (canMove) {
				let moveIdx = Board.idxAdd(selectedTileIdx, 2, 0);
				if (moveIdx !== null) {
					moves.push(moveIdx);
				}
			}
		}
	}

	return moves;
}

export const testingExports = {
	findPossiblePawnMoves,
	findPossibleBishopMoves,
	findPossibleKnightMoves,
	findPossibleRookMoves,
	findPossibleQueenMoves,
	findPossibleKingMoves
}