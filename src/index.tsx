import { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import update from 'immutability-helper';
import "./chess.scss";
import { Player, Piece, TileData, GRID_WIDTH, GRID_HEIGHT } from "./constants";
import { PieceImages } from "./chess-pieces";
import * as Utils from "./utils";
import { findPossibleMoves } from "./chess-moves"

function ChessApp() {
	const [tiles, setTiles] = useState(Utils.createInitialBoard);
	const [playerTurn, setPlayerTurn] = useState(Player.White);

	return (
		<div>
			<Board 
				tiles={tiles} playerTurn={playerTurn} 
				onMovePiece={(fromIdx, toIdx) => {
					// Get tile with hasMoved as true
					let tile = update(tiles[fromIdx], {hasMoved: {$set: true}});

					// Move tile in grid
					setTiles(update(tiles, {
						[fromIdx]: {$set: null}, 
						[toIdx]: {$set: tile}
					}));
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

type BoardProps = {tiles: Array<TileData|null>, playerTurn: Player, onMovePiece: (fromIdx: number, toIdx: number) => void};
function Board({tiles, playerTurn, onMovePiece}: BoardProps) {
	const [selectedTileIdx, setSelectedTileIdx] = useState<number|null>(null);
	const possibleMoves = useMemo(() => findPossibleMoves(selectedTileIdx, tiles), [selectedTileIdx, tiles])

	let tileRenders: Array<Array<JSX.Element>> = [];
	for (let y = 0; y < GRID_HEIGHT; y++) {
		tileRenders[y] = [];
		for (let x = 0; x < GRID_WIDTH; x++) {
			let idx = Utils.coordToIdx(x, y);
			let tile = tiles[idx];
			let selected = selectedTileIdx === idx;
			
			let selectable = selectedTileIdx != null 
				? possibleMoves.includes(idx) || selectedTileIdx === idx
				: tile?.owner === playerTurn;

			let highlighted = selectedTileIdx != null && possibleMoves.includes(idx);

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
							if (possibleMoves.includes(idx)) {
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
		<table className="board">
			<tbody>
				{tileRenders.map((tileRendersRow, y) => 
					<tr key={y}>
						{tileRendersRow.map((tile, x) => tile)}
					</tr>
				)}
			</tbody>
		</table>
	);
}

type TileProps = {tile: TileData|null, idx: number, selected: boolean, clickable: boolean, highlighted: boolean, onClick:() => void};
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
