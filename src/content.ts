import { createPopper, Instance } from "@popperjs/core";

let tooltip: HTMLDivElement;
let popperInstance: Instance | undefined;
let currentColors: ChessboardColours | null = null;

// For colour settings
interface ChessboardColours {
    evenBlock: string;
    oddBlock: string;
    piece: string;
    highlight: string;
}

const chessPieces = {
	king: "♔",
	queen: "♕",
	rook: "♖",
	bishop: "♗",
	knight: "♘",
	pawn: "♙"
};

const virtualChessBoard = [	
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♔", "♕", "♗", "♘", "♖"],
]

// SETTINGS

function updateColours(colours: ChessboardColours) {
    document.documentElement.style.setProperty('--even-block-colour', colours.evenBlock);
    document.documentElement.style.setProperty('--odd-block-colour', colours.oddBlock);
    document.documentElement.style.setProperty('--piece-colour', colours.piece);
    document.documentElement.style.setProperty('--highlight-colour', colours.highlight);
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
}

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
    if (!chessContainer) {
        return;
    }

    // Resetting Highlights
    const highlights = chessContainer.getElementsByClassName("cl-highlight");
    while (highlights.length > 0) {
        highlights[0].classList.remove("cl-highlight");
    }

    // New Valid Highlights
    for (const [row, col] of moves) {
        // Only if empty
        if (isSquareEmpty(row, col)) {
            const [vrow, vcol] = convertCoords(row, col);
            const cell = chessContainer.children[vrow].children[vcol] as HTMLElement;
            cell.classList.add("cl-highlight");
        }
    }
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
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
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
    const directions = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        addMove(moves, newRow, newCol);
    }
    return moves;
}

function getBishopMoves(row: number, col: number): [number, number][] {
    const moves: [number, number][] = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
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
    return getRookMoves(row, col).concat(getBishopMoves(row, col));  // todo: Still need to test this
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
    if (request.type === 'UPDATE_COLOURS') {
        currentColors = request.colours;
        updateColours(request.colours);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    tooltip = document.createElement("div");
    tooltip.id = "cl-tooltip";
    tooltip.role = "tooltip";
    tooltip.innerHTML = `<button id="cl-show-chessboard">♟</button>`;
    document.body.appendChild(tooltip);

    const chessBoard = document.createElement("div");
    chessBoard.id = "cl-chess-board";
    chessBoard.innerHTML = 
        `<div class="cl-chess-board-container">
            <div class="cl-header-container">
                <div class="cl-header">ChessLock</div>
                <div class="cl-button-container">
                    <button id="cl-cls-btn">✖</button>
                </div>
            </div>
            <div id="cl-chess-container">${`<div>${`<div></div>`.repeat(8)}</div>`.repeat(8)}</div>
        </div>`;
    document.body.appendChild(chessBoard);    

    if (currentColors) {
        updateColours(currentColors);
    } else {
        chrome.storage.sync.get('chessboardColours', (result: { [key: string]: any }) => {
            if (result['chessboardColours']) {
                updateColours(result['chessboardColours'] as ChessboardColours);
            }
        });
    }

    const chessContainer = document.getElementById("cl-chess-container");

    if(chessContainer) {
        for (let visualRow = 0; visualRow < 8; visualRow++) {
            for (let visualCol = 0; visualCol < 8; visualCol++) {
                const cell = chessContainer.children[visualRow].children[visualCol] as HTMLElement;
                const [logicalRow, logicalCol] = convertCoords(visualRow, visualCol);
                cell.innerHTML = `<span class="cl-chess-piece" id="cl-chesspiece-${logicalRow}-${logicalCol}">${virtualChessBoard[logicalRow][logicalCol]}</span>`;
                // Valid Moves
                cell.addEventListener("click", () => {
                    const piece = virtualChessBoard[logicalRow][logicalCol];
                    if (piece) {
                        const validMoves = getValidMoves(piece, logicalRow, logicalCol);
                        highlightValidMoves(validMoves);
                    }
                });
            }
        }
    }
    
    document.addEventListener("click", (e: MouseEvent) => {
        if (!e.target || !(e.target instanceof HTMLElement)) {
            return;
        }

        if (e.target.id === "cl-show-chessboard") {
            chessBoard.style.visibility = "visible";
        } else if (e.target instanceof HTMLInputElement && e.target.type === "password") {
            return;
        }

        if(e.target.id === "cl-cls-btn") {
            chessBoard.style.visibility = "hidden";
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