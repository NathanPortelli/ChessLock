import { createPopper, Instance } from "@popperjs/core";

let tooltip: HTMLDivElement;
let popperInstance: Instance | undefined;
let currentColors: ChessboardColours | null = null;
let isDarkMode = false;
let isDefaultDarkMode = false;

// For colour settings
export interface ChessboardColours {
	darkBlock: string;
	lightBlock: string;
	piece: string;
	highlightValid: string;
	highlightInvalid: string;
	darkMode: boolean;
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

let virtualChessBoard = [
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
	["♖", "♘", "♗", "♔", "♕", "♗", "♘", "♖"]
];

let willResetBoard = false;

let hasKingMoved = false;
let hasRook1Moved = false;
let hasRook2Moved = false;

let focusedInput: HTMLInputElement;
let selectedPiece = "";
let selectedPieceRow = -1;
let selectedPieceCol = -1;

// SETTINGS

function updateColours(colours: ChessboardColours) {
	document.documentElement.style.setProperty("--dark-block-colour", colours.darkBlock);
	document.documentElement.style.setProperty("--light-block-colour", colours.lightBlock);
	document.documentElement.style.setProperty("--piece-colour", colours.piece);
	document.documentElement.style.setProperty("--highlight-valid-colour", colours.highlightValid);
	document.documentElement.style.setProperty("--highlight-invalid-colour", colours.highlightInvalid);
}

// SYMBOLS

let symbolIndex = 0;
let isSymbolModeActive = false;
const symbols = ["!", "?", "*", ")", "&", "$", "{", "£", "@", "}", "_", "[", "^", "#", "]", "("];

function toggleSymbolMode() {
    isSymbolModeActive = !isSymbolModeActive;
    const symbolBtn = document.getElementById("cl-symbol-btn");
    if (symbolBtn) {
        symbolBtn.className = isSymbolModeActive ? "cl-symbol-btn-on" : "cl-symbol-btn-off";
        symbolBtn.textContent = isSymbolModeActive ? "⁈ [On]" : "⁈";
    }
}

// RESET

function resetChessboard() {
	const initialBoard = [
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
		["♖", "♘", "♗", "♔", "♕", "♗", "♘", "♖"]
	];

	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			virtualChessBoard[i][j] = initialBoard[i][j];
		}
	}

	symbolIndex = 0;
	unselectPiece();
	paintBoard(false);
	if (focusedInput) {
		focusedInput.value = "";
	}

	hasKingMoved = false;
	hasRook1Moved = false;
	hasRook2Moved = false;
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

	if (focusedInput != e.target) {
		willResetBoard = true;
	} else {
		willResetBoard = false;
	}

	focusedInput = e.target;
	popperFactory(e.target);
	tooltip.setAttribute("data-show", "");
	popperInstance?.update();
};

// DARK MODE

function updateDarkMode() {
	const chessBoard = document.getElementById("cl-chess-board");
	if (chessBoard) {
		chessBoard.classList.toggle("dark-mode", isDarkMode);
	}
}

// HIGHLIGHTING

function isSquareEmpty(row: number, col: number): boolean {
	return virtualChessBoard[row][col] === "";
}

function unselectPiece() {
	selectedPiece = "";
	selectedPieceCol = -1;
	selectedPieceRow = -1;

	// Reset highlights
	resetHighlights();
}

function resetHighlights() {
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
}

function highlightValidMoves(moves: [number, number][]) {
	const chessContainer = document.getElementById("cl-chess-container");

	if (!chessContainer) return;

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
		validMoveBoard[row][col] = isSquareEmpty(row, col) ? MoveValidity.VALID : MoveValidity.INVALID;
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
			const newRow = row + i * dx; // To keep moving in that direction
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
			const newRow = row + i * dx; // To keep moving in that direction
			const newCol = col + i * dy;
			if (!addMove(moves, newRow, newCol)) break;
		}
	}
	return moves;
}

function getQueenMoves(row: number, col: number): [number, number][] {
	return getRookMoves(row, col).concat(getBishopMoves(row, col));
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

	let canCastleShort = false;
	let canCastleLong = false;

	if (!hasKingMoved) {
		if (!hasRook1Moved) {
			if (col === 3) {
				if (isSquareEmpty(row, 1) && isSquareEmpty(row, 2)) {
					canCastleShort = true;
				}
			} else if (col === 4) {
				if (isSquareEmpty(row, 1) && isSquareEmpty(row, 2) && isSquareEmpty(row, 3)) {
					canCastleLong = true;
				}
			}
		}

		if (!hasRook2Moved) {
			if (col === 3) {
				if (isSquareEmpty(row, 4) && isSquareEmpty(row, 5) && isSquareEmpty(row, 6)) {
					canCastleLong = true;
				}
			} else if (col === 4) {
				if (isSquareEmpty(row, 5) && isSquareEmpty(row, 6)) {
					canCastleShort = true;
				}
			}
		}

		if (canCastleShort) {
			addMove(moves, row, col === 3 ? 1 : 6);
		}

		if (canCastleLong) {
			addMove(moves, row, col === 3 ? 5 : 2);
		}
	}

	return moves;
}

function addMove(moves: [number, number][], row: number, col: number): boolean {
	// If within bounds
	if (row >= 0 && row < 8 && col >= 0 && col < 8) {
		moves.push([row, col]);

		if (!isSquareEmpty(row, col)) return false;
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

chrome.runtime.onMessage.addListener((request: { type: string; colours: ChessboardColours; darkMode: boolean; isDefaultDarkMode: boolean }) => {
	if (request.type === "UPDATE_COLOURS") {
		currentColors = request.colours;
		updateColours(request.colours);
		isDefaultDarkMode = request.isDefaultDarkMode;

		if (isDefaultDarkMode) {
			isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		} else {
			isDarkMode = request.darkMode;
		}
		
		updateDarkMode();
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
					<button class="cl-symbol-btn-off" id="cl-symbol-btn">⁈</button>
					<button class="cl-btn" id="cl-reset-btn">↺</button>
					<button class="cl-btn" id="cl-cls-btn">✖</button>
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
				const isDarkSquare = j % 2 === (i % 2 === 0 ? 1 : 0);
				const classesToAppend: string[] = [];

				if (isDarkSquare) {
					classesToAppend.push("cl-chess-piece-dark");
				} else {
					classesToAppend.push("cl-chess-piece-light");
				}

				if (validMoveBoard[i][j] !== MoveValidity.NONE) {
					classesToAppend.push(`cl-highlight-${validMoveBoard[i][j]}`);
				}

				const extraClasses = classesToAppend.join(" ");

				if (virtualChessBoard[i][j]) {
					chessContainer.children[i].children[j].innerHTML =
						`<span class="cl-chess-piece ${extraClasses}" id="cl-chesspiece-${i}-${j}" data-row="${i}" data-column="${j}">
                            ${virtualChessBoard[i][j]}
                        </span>`;
				} else {
					chessContainer.children[i].children[j].innerHTML =
						`<span class="${extraClasses}" id="cl-chesssquare-${i}-${j}" data-row="${i}" data-column="${j}"></span>`;
				}
			}
		}
	}
};

function getPieceNotation(pieceType: string) {
	switch (pieceType) {
		case chessPieces.king:
			return "K";
		case chessPieces.queen:
			return "Q";
		case chessPieces.knight:
			return "N";
		case chessPieces.bishop:
			return "B";
		case chessPieces.rook:
			return "R";
		case chessPieces.pawn:
			return "";
		default:
			throw new Error("Unknown piece");
	}
}

function getColumnNotation(column: number) {
	return String.fromCharCode(97 + column);
}

function getRowNotation(row: number) {
	return `${8 - row}`;
}

function getChessNotation(pieceType: string, newRow: number, newColumn: number) {
	let notation = "";

	notation += getPieceNotation(pieceType);
	notation += getColumnNotation(newColumn);
	notation += getRowNotation(newRow);

	if (isSymbolModeActive) {
		notation += symbols[symbolIndex];
		symbolIndex = (symbolIndex + 1) % symbols.length;
	}

	return notation;
}

document.addEventListener("DOMContentLoaded", () => {
	tooltip = document.createElement("div");
	tooltip.id = "cl-tooltip";
	tooltip.role = "tooltip";
	tooltip.innerHTML = `<button id="cl-show-chessboard">♟</button>`;
	document.body.appendChild(tooltip);

	const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  	isDarkMode = prefersDarkScheme.matches;

	prefersDarkScheme.addListener((e) => {
		if (isDefaultDarkMode) {
			isDarkMode = e.matches;
			updateDarkMode();
		}
	});

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

			if (willResetBoard) {
				resetChessboard();
			}
		} else if (e.target.id === "cl-cls-btn") {
			chessBoard.style.visibility = "hidden";
		} else if (e.target.id === "cl-reset-btn") {
			resetChessboard();
		} else if (e.target.id === "cl-symbol-btn") {
			toggleSymbolMode();
		} else if (e.target.id.startsWith("cl-chesspiece")) {
			const row = e.target.dataset["row"];
			const column = e.target.dataset["column"];

			if (row && column && Number.isInteger(parseInt(row)) && Number.isInteger(parseInt(column))) {
				const nrow = parseInt(row);
				const ncol = parseInt(column);

				const piece = virtualChessBoard[nrow][ncol];
				selectedPiece = piece;
				selectedPieceRow = nrow;
				selectedPieceCol = ncol;

				if (piece) {
					const validMoves = getValidMoves(piece, nrow, ncol);
					highlightValidMoves(validMoves);
				}
			}
		} else if (e.target.id.startsWith("cl-chesssquare")) {
			const row = e.target.dataset["row"];
			const column = e.target.dataset["column"];

			if (!focusedInput || !selectedPiece) return;

			if (row && column && Number.isInteger(parseInt(row)) && Number.isInteger(parseInt(column))) {
				const nrow = parseInt(row);
				const ncol = parseInt(column);

				if (validMoveBoard[nrow][ncol] == MoveValidity.VALID) {
					let isPromotion = false;
					let isCastleShort = false;
					let isCastleLong = false;

					if (selectedPiece === chessPieces.pawn && nrow === 0) {
						selectedPiece = chessPieces.queen;
						isPromotion = true;
					} else if (selectedPiece === chessPieces.king) {
						hasKingMoved = true;

						const difference = ncol - selectedPieceCol;

						if (Math.abs(difference) === 2) {
							// You are castling

							if (difference < 0) {
								// Rook 1
								virtualChessBoard[selectedPieceRow][0] = "";
								virtualChessBoard[selectedPieceRow][ncol + 1] = chessPieces.rook;
							} else {
								// Rook 2
								virtualChessBoard[selectedPieceRow][7] = "";
								virtualChessBoard[selectedPieceRow][ncol - 1] = chessPieces.rook;
							}

							if (
								(selectedPieceCol === 3 && difference < 0) ||
								(selectedPieceCol === 4 && difference > 0)
							)
								isCastleShort = true;
							if (
								(selectedPieceCol === 3 && difference > 0) ||
								(selectedPieceCol === 4 && difference < 0)
							)
								isCastleLong = true;
						}
					} else if (selectedPiece === chessPieces.rook) {
						if (selectedPieceRow === 7 && selectedPieceCol === 0) {
							hasRook1Moved = true;
						} else if (selectedPieceRow === 7 && selectedPieceCol === 7) {
							hasRook2Moved = true;
						}
					}

					virtualChessBoard[nrow][ncol] = selectedPiece;
					virtualChessBoard[selectedPieceRow][selectedPieceCol] = "";

					if (isPromotion) {
						focusedInput.value += `${getColumnNotation(ncol)}${getRowNotation(nrow)}=Q`;
					} else if (isCastleShort) {
						focusedInput.value += "O-O";
					} else if (isCastleLong) {
						focusedInput.value += "O-O-O";
					} else {
						focusedInput.value += getChessNotation(selectedPiece, nrow, ncol);
					}

					unselectPiece();
				}

				paintBoard(false);
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

	// Function to handle new input elements
	const handleNewInputElements: MutationCallback = (mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const element = node as Element;

					const inputs = element.querySelectorAll(`input[type="password"]`);

					inputs.forEach((input) => {
						if (input instanceof HTMLInputElement) {
							input.addEventListener("focus", handleFocus);
						}
					});
				}
			});
		});
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(handleNewInputElements);

	// Start observing the document for child nodes added
	observer.observe(document.body, { childList: true, subtree: true });
});
