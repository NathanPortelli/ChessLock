<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ChessboardColours } from "./content";

const darkBlockColour = ref("#779556");
const lightBlockColour = ref("#ffffff");
const pieceColour = ref("#000000");

const saveColours = () => {
	const colours: ChessboardColours = {
		darkBlock: darkBlockColour.value,
		lightBlock: lightBlockColour.value,
		piece: pieceColour.value
	};

	chrome.storage.sync.set({ chessboardColours: colours });

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id!, {
			type: "UPDATE_COLOURS",
			colours: colours
		});
	});
};

const loadColours = () => {
	chrome.storage.sync.get("chessboardColours", (result: { [key: string]: any }) => {
		if (result["chessboardColours"]) {
			darkBlockColour.value = result["chessboardColours"].darkBlock;
			lightBlockColour.value = result["chessboardColours"].lightBlock;
			pieceColour.value = result["chessboardColours"].piece;

			// to send colours to content script
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id!, {
					type: "UPDATE_COLOURS",
					colours: result["chessboardColours"]
				});
			});
		}
	});
};

const resetColours = () => {
	darkBlockColour.value = "#779556";
	lightBlockColour.value = "#ffffff";
	pieceColour.value = "#000000";
	saveColours();
};

onMounted(() => {
	loadColours();
});
</script>

<template>
	<div class="cl-settings-container">
		<h2>ChessLock Settings</h2>
		<div>
			<label for="even-colour">Even Blocks:</label>
			<input type="color" id="even-colour" v-model="darkBlockColour" @change="saveColours" />
		</div>
		<div>
			<label for="odd-colour">Odd Blocks:</label>
			<input type="color" id="odd-colour" v-model="lightBlockColour" @change="saveColours" />
		</div>
		<div>
			<label for="piece-colour">Pieces:</label>
			<input type="color" id="piece-colour" v-model="pieceColour" @change="saveColours" />
		</div>
		<div>
			<button class="cl-reset-btn" @click="resetColours">Reset to Default</button>
		</div>
		<div>
			<a href="https://github.com/NathanPortelli/ChessLock" class="cl-github-btn" target="_blank"
				>View on GitHub</a
			>
		</div>
	</div>
</template>
