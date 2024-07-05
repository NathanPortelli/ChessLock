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
					offset: [0, -50]
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

document.addEventListener("DOMContentLoaded", () => {
	tooltip = document.createElement("div");
	tooltip.id = "tooltip";
	tooltip.role = "tooltip";
	tooltip.innerHTML = `<button id="show-chessboard">Chess icon</button>`;
	document.body.appendChild(tooltip);

	const chessBoard = document.createElement("div");
	chessBoard.id = "chess-board";
	chessBoard.innerHTML = `<div id="chess-container">${`<div>${`<div></div>`.repeat(8)}</div>`.repeat(8)}</div>`;
	document.body.appendChild(chessBoard);

	document.addEventListener("click", (e: MouseEvent) => {
		if (!e.target || !(e.target instanceof HTMLElement)) {
			return;
		}

		if (e.target.id === "show-chessboard") {
			chessBoard.style.visibility = "visible";
		} else if (
			e.target instanceof HTMLInputElement &&
			e.target.type === "password"
		) {
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
