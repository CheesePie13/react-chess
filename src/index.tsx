import { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import "./chess.scss";
import { Player, Piece, TileData, GRID_WIDTH, GRID_HEIGHT } from "./constants";
import { PieceImages } from "./chess-pieces";
import * as Utils from "./utils";
import { findAllPossibleMoves } from "./chess-moves"

function PawnPromotionModal({playerTurn, onPieceSelected}: {playerTurn: Player, onPieceSelected: ((piece: Piece) => void)|null}) {
	if (onPieceSelected === null) {
		return null;
	}

	let pieces = [Piece.Queen, Piece.Rook, Piece.Bishop, Piece.Knight];
	let pieceImages = PieceImages;

	let modal = (
		<div className="modal">
			<div className="modal-content">
				{pieces.map(piece => 
					<img className="piece" src={pieceImages.get(playerTurn)?.get(piece) || undefined} onClick={() => onPieceSelected(piece)} />
				)}
			</div>
		</div>
	);

	let modalContainer = document.getElementById("modal-container");
	if (modalContainer === null) {
		return null;
	}
	return ReactDOM.createPortal(modal, modalContainer);
}

function ChessApp() {
	const [tiles, setTiles] = useState(Utils.createInitialBoard);
	const [playerTurn, setPlayerTurn] = useState(Player.White);
	const [pawnPromotionModalCallback, setPawnPromotionModalCallback] = useState<((piece: Piece) => void)|null>(null);

	return (
		<div>
			<PawnPromotionModal playerTurn={playerTurn} onPieceSelected={pawnPromotionModalCallback}/>
			<Board 
				tiles={tiles} playerTurn={playerTurn} 
				onMovePiece={(fromIdx, toIdx) => {
					let tile = tiles.get(fromIdx);
					if (tile === undefined) {
						return;
					}

					let newTile = {...tile, hasMoved: true};
					let newTiles = new Map(tiles);
					
					newTiles.delete(fromIdx);
					newTiles.set(toIdx, newTile);

					// Check if castling
					let [toX, toY] = Utils.idxToCoord(toIdx);
					let [xDelta, yDelta] = Utils.idxSub(toIdx, fromIdx);
					if (tile.piece === Piece.King && Math.abs(xDelta) > 1) {
						if (xDelta > 1) {
							let rookTileIdx = Utils.coordToIdx(GRID_WIDTH - 1, toY);
							let rookTile = tiles.get(rookTileIdx);
							Utils.assertIsDefined(rookTile, "Rook is missing but castling move should have already been validate.");

							if (rookTile !== undefined) {
								let newRookTile = {...rookTile, hasMoved: true};
								let newRookTileIdx = Utils.coordToIdx(toX - 1, toY);
								newTiles.set(newRookTileIdx, newRookTile);
								newTiles.delete(rookTileIdx);
							}

						} else if (xDelta < 1) {
							let rookTileIdx = Utils.coordToIdx(0, toY);
							let rookTile = tiles.get(rookTileIdx);
							Utils.assertIsDefined(rookTile, "Rook is missing but castling move should have already been validate.");

							let newRookTile = {...rookTile, hasMoved: true};
							let newRookTileIdx = Utils.coordToIdx(toX + 1, toY);
							newTiles.set(newRookTileIdx, newRookTile);
							newTiles.delete(rookTileIdx);
						}
					}

					// Check if promoting pawn
					if (tile.piece === Piece.Pawn && Utils.idxAddRelative(toIdx, playerTurn, 0, 1) === null) {
						setPawnPromotionModalCallback(() => (piece: Piece) => {
							newTile.piece = piece;
							setTiles(newTiles);
							setPlayerTurn(playerTurn === Player.White ? Player.Black : Player.White);
							setPawnPromotionModalCallback(null);
						});
						return;
					}

					setTiles(newTiles);
					setPlayerTurn(playerTurn === Player.White ? Player.Black : Player.White);
				}}
			/>
			<div>{"Player Turn: " + Player[playerTurn]}</div>
			<button onClick={() => {
				setTiles(Utils.createInitialBoard());
				setPlayerTurn(Player.White);
			}}>
				Restart
			</button>
		</div>
	);
}

type BoardProps = {tiles: ReadonlyMap<number,TileData>, playerTurn: Player, onMovePiece: (fromIdx: number, toIdx: number) => void};
function Board({tiles, playerTurn, onMovePiece}: BoardProps) {
	const [selectedTileIdx, setSelectedTileIdx] = useState<number|null>(null);
	const allPossibleMoves = useMemo(() => findAllPossibleMoves(tiles, playerTurn), [tiles, playerTurn]);
	const selectedPossibleMoves = selectedTileIdx === null ? [] : allPossibleMoves.get(selectedTileIdx) || [];
	const winner = useMemo(() => {
		if ([...allPossibleMoves.values()].every(possibleMoves => possibleMoves.length === 0)) {
			return playerTurn === Player.White ? Player.Black : Player.White;
		}

		return null;
	}, [allPossibleMoves, tiles, playerTurn]);

	let tileRenders: Array<Array<JSX.Element>> = [];
	for (let y = 0; y < GRID_HEIGHT; y++) {
		tileRenders[y] = [];
		for (let x = 0; x < GRID_WIDTH; x++) {
			let idx = Utils.coordToIdx(x, y);
			let tile = tiles.get(idx);
			let selected = selectedTileIdx === idx;
			
			let selectable = selectedTileIdx != null 
				? selectedPossibleMoves.includes(idx) || selectedTileIdx === idx
				: tile?.owner === playerTurn;

			let possibleMoves = allPossibleMoves.get(idx);
			let highlighted = (selectedTileIdx !== null && selectedPossibleMoves.includes(idx)) 
				|| (selectedTileIdx === null && possibleMoves !== undefined && possibleMoves.length > 0);

			tileRenders[y][x] = (
				<Tile 
					key={x} tile={tile} idx={idx}
					selected={selected}
					clickable={selectable}
					highlighted={highlighted}
					onClick={() => {
						if (selectedTileIdx === idx) {
							setSelectedTileIdx(null);
						} else if (selectedTileIdx != null) {
							if (selectedPossibleMoves.includes(idx)) {
								onMovePiece(selectedTileIdx, idx);
							}
							setSelectedTileIdx(null);
						} else if (tile?.owner === playerTurn) {
							setSelectedTileIdx(idx);
						}
					}}
				/>
			);
		}
	}



	return (
		<div>
			{winner !== null && <div>{Player[winner]} Wins!</div>}
			<table className="board">
				<tbody>
					{tileRenders.map((tileRendersRow, y) => 
						<tr key={y}>
							{tileRendersRow.map((tile, x) => tile)}
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

type TileProps = {tile?: TileData|null, idx: number, selected: boolean, clickable: boolean, highlighted: boolean, onClick:() => void};
function Tile({tile, idx, selected, clickable, highlighted, onClick}: TileProps) {
	let tileClass = "";
	let [x, y] = Utils.idxToCoord(idx);
	if (((y % 2) + x) % 2 === 0) {
		tileClass += "checkered ";
	}

	if (selected) {
		tileClass += "selected ";
	}

	if (clickable) {
		tileClass += "clickable ";
	}

	if (highlighted) {
		tileClass += "highlighted "
	}

	if (tile != null) {
		let pieceImage = PieceImages.get(tile.owner)?.get(tile.piece);
		if (pieceImage != null) {
			return (
				<td className={tileClass} onClick={onClick}>
					<img className="piece" src={pieceImage}/>
				</td>
			);
		}
	}

	return (<td className={tileClass} onClick={onClick} />);
}

ReactDOM.render(<ChessApp/>, document.querySelector("#app"));
