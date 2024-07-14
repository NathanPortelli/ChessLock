import { createPopper, Instance } from "@popperjs/core";

let tooltip: HTMLDivElement;
let popperInstance: Instance | undefined;

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

// const chessPiecesWhite = {
// 	king: "♔",
// 	queen: "♕",
// 	rook: "♖",
// 	bishop: "♗",
// 	knight: "♘",
// 	pawn: "♙"
// };

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

document.addEventListener("DOMContentLoaded", () => {
	tooltip = document.createElement("div");
	tooltip.id = "cl-tooltip";
	tooltip.role = "tooltip";
	tooltip.innerHTML = `<button id="cl-show-chessboard">♟</button>`;
	document.body.appendChild(tooltip);

	const chessBoard = document.createElement("div");
	chessBoard.id = "cl-chess-board";
	chessBoard.innerHTML = `<div><button id="cl-cls-btn">x</button><div id="cl-chess-container">${`<div>${`<div></div>`.repeat(8)}</div>`.repeat(8)}</div></div>`;
	document.body.appendChild(chessBoard);

	const chessContainer = document.getElementById("cl-chess-container");

	if(chessContainer) {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				chessContainer.children[i].children[j].innerHTML = `<span class="cl-chess-piece" id="cl-chesspiece-${i}-${j}">${virtualChessBoard[i][j]}</span>`
			}
		}
	}
	
	document.addEventListener("click", (e: MouseEvent) => {
		if (!e.target || !(e.target instanceof HTMLElement)) {
			return;
		}

		if (e.target.id === "cl-show-chessboard") {
			chessBoard.style.visibility = "visible";
		} else if (
			e.target instanceof HTMLInputElement &&
			e.target.type === "password"
		) {
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
