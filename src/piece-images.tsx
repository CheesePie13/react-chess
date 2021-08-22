import WhitePawnImg from "./piece-images/white-pawn.svg";
import WhiteBishopImg from "./piece-images/white-bishop.svg";
import WhiteKnightImg from "./piece-images/white-knight.svg";
import WhiteRookImg from "./piece-images/white-rook.svg";
import WhiteQueenImg from "./piece-images/white-queen.svg";
import WhiteKingImg from "./piece-images/white-king.svg";

import BlackPawnImg from "./piece-images/black-pawn.svg";
import BlackBishopImg from "./piece-images/black-bishop.svg";
import BlackKnightImg from "./piece-images/black-knight.svg";
import BlackRookImg from "./piece-images/black-rook.svg";
import BlackQueenImg from "./piece-images/black-queen.svg";
import BlackKingImg from "./piece-images/black-king.svg";

import { Player, Piece } from "./types"
import { assertIsDefined } from "./utils";

const WhitePieceImages: ReadonlyMap<Piece, string> = new Map([
	[Piece.Pawn, WhitePawnImg], 
	[Piece.Bishop, WhiteBishopImg], 
	[Piece.Knight, WhiteKnightImg], 
	[Piece.Rook, WhiteRookImg], 
	[Piece.Queen, WhiteQueenImg], 
	[Piece.King, WhiteKingImg]
]);

const BlackPieceImages: ReadonlyMap<Piece, string> = new Map([
	[Piece.Pawn, BlackPawnImg], 
	[Piece.Bishop, BlackBishopImg], 
	[Piece.Knight, BlackKnightImg], 
	[Piece.Rook, BlackRookImg], 
	[Piece.Queen, BlackQueenImg], 
	[Piece.King, BlackKingImg]
]);

const PieceImages: ReadonlyMap<Player, ReadonlyMap<Piece, string | null>> = new Map([
	[Player.White, WhitePieceImages],
	[Player.Black, BlackPieceImages]
]);

/**
 * Get the chess piece image source url for the piece and player
 */
export function getPieceImage(player: Player, piece: Piece) {
	let playerPieceImages = PieceImages.get(player);
	assertIsDefined(playerPieceImages, "All players should have piece images.");

	let pieceImage = playerPieceImages.get(piece);
	assertIsDefined(pieceImage, "All pieces should have an image.");

	return pieceImage;
}
