import { coordToIdx, createStarterBoard, idxAdd, idxAddRelative, idxSub, idxToCoord, isValidCoord, isValidIdx } from "./board"
import { Player } from "./types";

test("idxToCoord()", () => {
	expect(idxToCoord(0)).toStrictEqual([0, 0]);
	expect(idxToCoord(35)).toStrictEqual([3, 4]);
	expect(idxToCoord(63)).toStrictEqual([7, 7]);
});

test("coordToIdx()", () => {
	expect(coordToIdx(0, 0)).toBe(0);
	expect(coordToIdx(3, 4)).toBe(35);
	expect(coordToIdx(7, 7)).toBe(63);
});

test("isValidCoord()", () => {
	expect(isValidCoord( 0,  0)).toBe(true);
	expect(isValidCoord( 3,  4)).toBe(true);
	expect(isValidCoord( 7,  7)).toBe(true);
	expect(isValidCoord(-1,  4)).toBe(false);
	expect(isValidCoord( 8,  4)).toBe(false);
	expect(isValidCoord( 4, -1)).toBe(false);
	expect(isValidCoord( 4,  8)).toBe(false);
});

test("isValidIdx()", () => {
	expect(isValidIdx( 0)).toBe(true);
	expect(isValidIdx(35)).toBe(true);
	expect(isValidIdx(63)).toBe(true);
	expect(isValidIdx(-1)).toBe(false);
	expect(isValidIdx(64)).toBe(false);
});

test("idxAdd()", () => {
	expect(idxAdd(coordToIdx(3, 3), 2, -2)).toBe(coordToIdx(5, 1));
	expect(idxAdd(coordToIdx(3, 3), 5, -2)).toBe(null);
	expect(idxAdd(coordToIdx(3, 3), 2, -4)).toBe(null);
});

test("idxAddRelative()", () => {
	expect(idxAddRelative(coordToIdx(3, 3), Player.Black, 2, -2)).toBe(coordToIdx(5, 1));
	expect(idxAddRelative(coordToIdx(3, 3), Player.Black, 5, -2)).toBe(null);
	expect(idxAddRelative(coordToIdx(3, 3), Player.Black, 2, -4)).toBe(null);

	expect(idxAddRelative(coordToIdx(3, 3), Player.White, 2, -2)).toBe(coordToIdx(1, 5));
	expect(idxAddRelative(coordToIdx(3, 3), Player.White, -5, 2)).toBe(null);
	expect(idxAddRelative(coordToIdx(3, 3), Player.White, -2, 4)).toBe(null);
});

test("idxSub()", () => {
	expect(idxSub(7, 5)).toStrictEqual([2, 0]);
	expect(idxSub(11, 19)).toStrictEqual([0, -1]);
	expect(idxSub(20, 32)).toStrictEqual([4, -2]);
});

test("createStarterBoard()", () => {
	expect(createStarterBoard().size).toBe(32); // Chess board should have 32 pieces
});
