import { createPopper, Instance } from "@popperjs/core";

let tooltip: HTMLDivElement;
let popperInstance: Instance | undefined;
let currentColors: ChessboardColours | null = null;

// For colour settings
export interface ChessboardColours {
	evenBlock: string;
	oddBlock: string;
	piece: string;
}

const chessPieces = {
	king: "♔",
	queen: "♕",
	rook: "♖",
	bishop: "♗",
	knight: "♘",
	pawn: "♙"
};

enum MoveValidity {
	NONE = 0,
	VALID = 1,
	INVALID = 2
}

let validMoveBoard = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0]
];

const virtualChessBoard = [
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
	["♖", "♘", "♗", "♔", "♕", "♗", "♘", "♖"]
];

// SETTINGS

function updateColours(colours: ChessboardColours) {
	document.documentElement.style.setProperty("--even-block-colour", colours.evenBlock);
	document.documentElement.style.setProperty("--odd-block-colour", colours.oddBlock);
	document.documentElement.style.setProperty("--piece-colour", colours.piece);
}

// CHESSBOARD

const popperFactory = (element: Element) => {
	popperInstance = createPopper(element, tooltip, {
		placement: "right",
		strategy: "fixed",
		modifiers: [
			{
				name: "offset",
				options: {
					offset: [0, -40]
				}
			}
		]
	});
};

const handleFocus = (e: FocusEvent) => {
	if (!e.target || !(e.target instanceof HTMLInputElement)) {
		return;
	}

	popperFactory(e.target);
	tooltip.setAttribute("data-show", "");
	popperInstance?.update();
};

// HIGHLIGHTING

// Due to how the even & odd chessboard are currently displayed
function convertCoords(row: number, col: number): [number, number] {
	if (row % 2 === 0) {
		return [row, col];
	} else {
		return [row, 7 - col];
	}
}

function isSquareEmpty(row: number, col: number): boolean {
	return virtualChessBoard[row][col] === "";
}

function highlightValidMoves(moves: [number, number][]) {
	const chessContainer = document.getElementById("cl-chess-container");

	if (!chessContainer) return;

	// Resetting Highlights#
	validMoveBoard = [
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0]
	];

	// New Valid Highlights
	for (const [row, col] of moves) {
		const [vrow, vcol] = convertCoords(row, col);

		validMoveBoard[vrow][vcol] = isSquareEmpty(vrow, vcol) ? MoveValidity.VALID : MoveValidity.INVALID;
	}

	paintBoard(false);
}

function getPawnMoves(row: number, col: number): [number, number][] {
	const moves: [number, number][] = [];
	if (row > 0 && isSquareEmpty(row - 1, col)) {
		moves.push([row - 1, col]);
		// Starting position, allows 2 steps
		if (row === 6 && isSquareEmpty(row - 2, col)) {
			moves.push([row - 2, col]);
		}
	}
	return moves;
}

function getRookMoves(row: number, col: number): [number, number][] {
	const moves: [number, number][] = [];
	const directions = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1]
	];
	for (const [dx, dy] of directions) {
		for (let i = 1; i < 8; i++) {
			const newRow = row + i * dx; // To keep moving in that direction --test
			const newCol = col + i * dy;
			if (!addMove(moves, newRow, newCol)) {
				break;
			}
		}
	}
	return moves;
}

function getKnightMoves(row: number, col: number): [number, number][] {
	const moves: [number, number][] = [];
	const directions = [
		[-2, -1],
		[-2, 1],
		[-1, -2],
		[-1, 2],
		[1, -2],
		[1, 2],
		[2, -1],
		[2, 1]
	];
	for (const [dx, dy] of directions) {
		const newRow = row + dx;
		const newCol = col + dy;
		addMove(moves, newRow, newCol);
	}
	return moves;
}

function getBishopMoves(row: number, col: number): [number, number][] {
	const moves: [number, number][] = [];
	const directions = [
		[1, 1],
		[1, -1],
		[-1, 1],
		[-1, -1]
	];
	for (const [dx, dy] of directions) {
		for (let i = 1; i < 8; i++) {
			const newRow = row + i * dx; // To keep moving in that direction --test
			const newCol = col + i * dy;
			if (!addMove(moves, newRow, newCol)) break;
		}
	}
	return moves;
}

function getQueenMoves(row: number, col: number): [number, number][] {
	return getRookMoves(row, col).concat(getBishopMoves(row, col)); // todo: Still need to test this
}

function getKingMoves(row: number, col: number): [number, number][] {
	const moves: [number, number][] = [];
	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
			if (dx !== 0 || dy !== 0) {
				addMove(moves, row + dx, col + dy); // Only one step in any direction
			}
		}
	}
	return moves;
}

function addMove(moves: [number, number][], row: number, col: number): boolean {
	// If within bounds and empty
	if (row >= 0 && row < 8 && col >= 0 && col < 8 && isSquareEmpty(row, col)) {
		moves.push([row, col]);
		return true;
	}
	return false;
}

function getValidMoves(piece: string, row: number, col: number): [number, number][] {
	switch (piece) {
		case chessPieces.pawn:
			return getPawnMoves(row, col);
		case chessPieces.rook:
			return getRookMoves(row, col);
		case chessPieces.knight:
			return getKnightMoves(row, col);
		case chessPieces.bishop:
			return getBishopMoves(row, col);
		case chessPieces.queen:
			return getQueenMoves(row, col);
		case chessPieces.king:
			return getKingMoves(row, col);
		default:
			return [];
	}
}

// INIT

chrome.runtime.onMessage.addListener((request: { type: string; colours: ChessboardColours }) => {
	if (request.type === "UPDATE_COLOURS") {
		currentColors = request.colours;
		updateColours(request.colours);
	}
});

const paintBoard = (firstTime?: boolean) => {
	if (firstTime) {
		const chessBoard = document.createElement("div");
		chessBoard.id = "cl-chess-board";
		chessBoard.innerHTML = `<div class="cl-chess-board-container">
                <div class="cl-header-container">
                    <div class="cl-header">ChessLock</div>
                    <div class="cl-button-container">
                        <button id="cl-cls-btn">✖</button>
                    </div>
                </div>
                <div id="cl-chess-container">${`<div>${`<div></div>`.repeat(8)}</div>`.repeat(8)}</div>
            </div>`;
		document.body.appendChild(chessBoard);
	}

	const chessContainer = document.getElementById("cl-chess-container");

	if (chessContainer) {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (virtualChessBoard[i][j]) {
					chessContainer.children[i].children[j].innerHTML =
						`<span class="cl-chess-piece${validMoveBoard[i][j] != MoveValidity.NONE ? ` cl-highlight-${validMoveBoard[i][j]}` : ""}" id="cl-chesspiece-${i}-${j}" data-row="${i}" data-column="${j}">
                            ${virtualChessBoard[i][j]}
                        </span>`;
				} else {
					chessContainer.children[i].children[j].innerHTML =
						`<span id="cl-chessquare-${i}-${j}" data-row="${i}" data-column="${j}"></span>`;
				}
			}
		}
	}
};

document.addEventListener("DOMContentLoaded", () => {
	console.log("Loading ChessLock extension...");

	tooltip = document.createElement("div");
	tooltip.id = "cl-tooltip";
	tooltip.role = "tooltip";
	tooltip.innerHTML = `<button id="cl-show-chessboard">♟</button>`;
	document.body.appendChild(tooltip);

	paintBoard(true);

	if (currentColors) {
		updateColours(currentColors);
	} else {
		chrome.storage.sync.get("chessboardColours", (result: { [key: string]: any }) => {
			if (result["chessboardColours"]) {
				updateColours(result["chessboardColours"] as ChessboardColours);
			}
		});
	}

	document.addEventListener("click", (e: MouseEvent) => {
		if (!e.target || !(e.target instanceof HTMLElement)) {
			return;
		}

		const chessBoard = document.getElementById("cl-chess-board");

		if (!chessBoard) return;

		if (e.target.id === "cl-show-chessboard") {
			chessBoard.style.visibility = "visible";
		} else if (e.target.id === "cl-cls-btn") {
			chessBoard.style.visibility = "hidden";
		} else if (e.target.id.startsWith("cl-chesspiece")) {
			const row = e.target.dataset["row"];
			const column = e.target.dataset["column"];

			if (row && column && Number.isInteger(parseInt(row)) && Number.isInteger(parseInt(column))) {
				const nrow = parseInt(row);
				const ncol = parseInt(column);

				const piece = virtualChessBoard[nrow][ncol];

				if (piece) {
					const validMoves = getValidMoves(piece, nrow, ncol);
					highlightValidMoves(validMoves);
				}
			}
		} else if (e.target.id.startsWith("cl-chessquare")) {
			const row = e.target.dataset["row"];
			const column = e.target.dataset["column"];

			if (row && column && Number.isInteger(parseInt(row)) && Number.isInteger(parseInt(column))) {
				const nrow = parseInt(row);
				const ncol = parseInt(column);

				const piece = virtualChessBoard[nrow][ncol];

				if (piece) {
					const validMoves = getValidMoves(piece, nrow, ncol);

					// TODO if is valid move, move it
				}
			}
		} else if (e.target instanceof HTMLInputElement && e.target.type === "password") {
			return;
		}

		tooltip.removeAttribute("data-show");
	});

	const inputElements = document.getElementsByTagName("input");

	for (const inputElement of inputElements) {
		if (inputElement.type === "password") {
			inputElement.addEventListener("focus", handleFocus);
		}
	}
});
