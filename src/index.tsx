import "./style.scss";

import { useState, useMemo } from "react";
import * as ReactDOM from "react-dom";

import { Player, Piece, Tile } from "./types";
import { getPieceImage } from "./piece-images";
import * as Board from "./board";
import { findAllMovesAndWinner, getOtherPlayer, performMove, performPawnPromotion } from "./game-logic"

/**
 * A local multiplayer chess game
 */
function ChessApp() {
	let a = 1;
	console.assert(a === 2);

	const [tiles, setTiles] = useState(Board.createStarterBoard);
	const [playerTurn, setPlayerTurn] = useState(Player.White);
	const [allPossibleMoves, winner] = useMemo(() => findAllMovesAndWinner(tiles, playerTurn), [tiles, playerTurn]);
	const [pawnPromotionModalCallback, setPawnPromotionModalCallback] = useState<((piece: Piece) => void) | null>(null);

	function onMovePiece(fromIdx: number, toIdx: number) {
		let [newTiles, pawnPromotionIdx] = performMove(fromIdx, toIdx, tiles);
		if (pawnPromotionIdx !== null) {
			let pawnIdx = pawnPromotionIdx;
			setPawnPromotionModalCallback(() => (piece: Piece) => {
				newTiles = performPawnPromotion(pawnIdx, piece, newTiles);
				setTiles(newTiles);
				setPlayerTurn(getOtherPlayer(playerTurn));
				setPawnPromotionModalCallback(null);
			});
		} else {
			setTiles(newTiles);
			setPlayerTurn(getOtherPlayer(playerTurn));
		}
	}

	function onRestartGame() {
		setTiles(Board.createStarterBoard());
		setPlayerTurn(Player.White);
	}

	let status;
	if (winner !== null) {
		status = <h2 className="status">{Player[winner]} Wins!</h2>;
	} else {
		status = <h2 className="status">{"Player Turn: " + Player[playerTurn]}</h2>
	}

	return (
		<div className="chess-app">
			<PawnPromotionModal player={playerTurn} onPieceSelected={pawnPromotionModalCallback}/>
			{status}
			<BoardView tiles={tiles} playerTurn={playerTurn} allPossibleMoves={allPossibleMoves} 
				onMovePiece={onMovePiece} onRestartGame={onRestartGame}/>
			<button className="restart" onClick={onRestartGame}>Restart</button>
		</div>
	);
}


interface BoardViewProps {
	tiles: ReadonlyMap<number,Tile>, 
	playerTurn: Player,
	allPossibleMoves: ReadonlyMap<number, Array<number>>
	onMovePiece: (fromIdx: number, toIdx: number) => void,
	onRestartGame: () => void
};

/**
 * A chess board that handles the logic for displaying the board and selecting tiles
 */
function BoardView({tiles, playerTurn, allPossibleMoves, onMovePiece, onRestartGame}: BoardViewProps) {
	const [selectedTileIdx, setSelectedTileIdx] = useState<number|null>(null);
	const selectedPossibleMoves = selectedTileIdx === null ? [] : allPossibleMoves.get(selectedTileIdx) || [];

	function onTileClick(idx: number) {
		if (selectedTileIdx !== null) {
			// Do the move if valid and unselect
			if (selectedPossibleMoves.includes(idx)) {
				onMovePiece(selectedTileIdx, idx);
			}
			setSelectedTileIdx(null);
		} else {
			// Select the tile if it has possible moves
			let possibleMoves = allPossibleMoves.get(idx);
			if (possibleMoves !== undefined && possibleMoves.length > 0) {
				setSelectedTileIdx(idx)
			}
		}
	}

	let tileViews: Array<Array<JSX.Element>> = [];
	for (let y = 0; y < Board.HEIGHT; y++) {
		tileViews[y] = [];
		for (let x = 0; x < Board.WIDTH; x++) {
			let idx = Board.coordToIdx(x, y);
			let tile = tiles.get(idx);
			let selected = selectedTileIdx === idx;
			let possibleMoves = allPossibleMoves.get(idx) || [];

			let highlighted;
			if (selectedTileIdx !== null) {
				highlighted = selectedPossibleMoves.includes(idx);
			} else {
				highlighted = possibleMoves.length > 0;
			}

			tileViews[y][x] = (
				<TileView key={x} tile={tile} idx={idx} selected={selected}
					highlighted={highlighted} onClick={onTileClick}
				/>
			);
		}
	}

	return (
		<div>
			<table className="board">
				<tbody>
					{tileViews.map((tileViewRow, y) => 
						<tr key={y}>
							{tileViewRow.map((tile, x) => tile)}
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}


interface TileViewProps {
	tile?: Tile,
	idx: number,
	selected: boolean,
	highlighted: boolean,
	onClick:(idx: number) => void
};

/**
 * A single tile on the chess board which may or may not have a piece on it
 */
function TileView({tile, idx, selected, highlighted, onClick}: TileViewProps) {
	let tileClass = "";

	// Add checkerboard pattern to tiles
	let [x, y] = Board.idxToCoord(idx);
	if (((y % 2) + x) % 2 === 0) {
		tileClass += "checkered ";
	}

	if (selected) {
		tileClass += "selected ";
	}

	if (highlighted) {
		tileClass += "highlighted "
	}

	if (tile === undefined) {
		return (<td className={tileClass} onClick={() => onClick(idx)} />);
	}

	let pieceImage = getPieceImage(tile.owner, tile.piece);
	return (
		<td className={tileClass} onClick={() => onClick(idx)}>
			<img className="piece" src={pieceImage}/>
		</td>
	);
}


interface PawnPromotionModalProps {
	player: Player, 
	onPieceSelected: ((piece: Piece) => void) | null
}

/**
 * A full screen dialog for the player to choose the piece to promote 
 * a pawn to when it reaches the oposite end of the board
 * 
 * @param onPieceSelected The dialog will show when this callback is not null
 */ 
function PawnPromotionModal({player, onPieceSelected}: PawnPromotionModalProps) {
	if (onPieceSelected === null) {
		return null;
	}

	let pieces = [Piece.Queen, Piece.Rook, Piece.Bishop, Piece.Knight];

	let modal = (
		<div className="modal">
			<div className="modal-content">
				{pieces.map(piece => 
					<img key={piece} className="piece" 
						src={getPieceImage(player, piece)} 
						onClick={() => onPieceSelected(piece)} />
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

ReactDOM.render(<ChessApp/>, document.querySelector("#app"));
