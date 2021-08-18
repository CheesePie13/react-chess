import WhitePawnImg from "./chess-piece-images/white-pawn.svg";
import WhiteBishopImg from "./chess-piece-images/white-bishop.svg";
import WhiteKnightImg from "./chess-piece-images/white-knight.svg";
import WhiteRookImg from "./chess-piece-images/white-rook.svg";
import WhiteQueenImg from "./chess-piece-images/white-queen.svg";
import WhiteKingImg from "./chess-piece-images/white-king.svg";

import BlackPawnImg from "./chess-piece-images/black-pawn.svg";
import BlackBishopImg from "./chess-piece-images/black-bishop.svg";
import BlackKnightImg from "./chess-piece-images/black-knight.svg";
import BlackRookImg from "./chess-piece-images/black-rook.svg";
import BlackQueenImg from "./chess-piece-images/black-queen.svg";
import BlackKingImg from "./chess-piece-images/black-king.svg";

import { Player, Piece } from "./constants"

const WhitePieceImages: ReadonlyMap<Piece, string|null> = new Map([
	[Piece.Pawn, WhitePawnImg], 
	[Piece.Bishop, WhiteBishopImg], 
	[Piece.Knight, WhiteKnightImg], 
	[Piece.Rook, WhiteRookImg], 
	[Piece.Queen, WhiteQueenImg], 
	[Piece.King, WhiteKingImg]
]);

const BlackPieceImages: ReadonlyMap<Piece, string|null> = new Map([
	[Piece.Pawn, BlackPawnImg], 
	[Piece.Bishop, BlackBishopImg], 
	[Piece.Knight, BlackKnightImg], 
	[Piece.Rook, BlackRookImg], 
	[Piece.Queen, BlackQueenImg], 
	[Piece.King, BlackKingImg]
]);

export const PieceImages: ReadonlyMap<Player, ReadonlyMap<Piece, string | null>> = new Map([
	[Player.White, WhitePieceImages],
	[Player.Black, BlackPieceImages]
]);
