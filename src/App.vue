<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { ChessboardColours } from "./content";

const darkBlockColour = ref<string>("#779556");
const lightBlockColour = ref<string>("#ffffff");
const pieceColour = ref<string>("#000000");
const highlightValidColour = ref<string>("#008000");
const highlightInvalidColour = ref<string>("#ff0000");

const darkMode = ref<boolean>(false);

const saveColours = () => {
	const colours: ChessboardColours = {
		darkBlock: darkBlockColour.value,
		lightBlock: lightBlockColour.value,
		piece: pieceColour.value,
		highlightValid: highlightValidColour.value.slice(0, 7) + "6b",
		highlightInvalid: highlightInvalidColour.value.slice(0, 7) + "6b",
		darkMode: darkMode.value
	};

	chrome.storage.sync.set({
		chessboardColours: colours,
		darkMode: darkMode.value
	});

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id!, {
			type: "UPDATE_COLOURS",
			colours: colours,
			darkMode: darkMode.value
		});
	});
};

const loadColours = () => {
	chrome.storage.sync.get(["chessboardColours", "darkMode"], (result: { [key: string]: any }) => {
		if (result["chessboardColours"]) {
			darkBlockColour.value = result["chessboardColours"].darkBlock;
			lightBlockColour.value = result["chessboardColours"].lightBlock;
			pieceColour.value = result["chessboardColours"].piece;
			highlightValidColour.value = result["chessboardColours"].highlightValid.slice(0, -2);
			highlightInvalidColour.value = result["chessboardColours"].highlightInvalid.slice(0, -2);

			// to send colours to content script
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id!, {
					type: "UPDATE_COLOURS",
					colours: result["chessboardColours"]
				});
			});

			let darkModeSet = false;

			if (result.hasOwnProperty("darkMode")) {
				const dark = result["darkMode"];

				if (dark !== undefined && dark !== null) {
					darkMode.value = dark;
					darkModeSet = true;
				}
			}

			if (!darkModeSet) {
				darkMode.value = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
			}

			// Send initial settings to content script
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				chrome.tabs.sendMessage(tabs[0].id!, {
					type: "UPDATE_COLOURS",
					colours: result["chessboardColours"] || {},
					darkMode: darkMode.value
				});
			});
		}
	});
};

watch(darkMode, (newValue) => {
	if (newValue) {
		document.body.classList.add("dark-mode");
	} else {
		document.body.classList.remove("dark-mode");
	}

	saveColours();
});

const resetColours = () => {
	darkBlockColour.value = "#779556";
	lightBlockColour.value = "#ffffff";
	pieceColour.value = "#000000";
	highlightValidColour.value = "#008000";
	highlightInvalidColour.value = "#ff0000";

	darkMode.value = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

	saveColours();
};

onMounted(() => {
	loadColours();

	if (darkMode.value) {
		document.body.classList.add("dark-mode");
	}
});

const version = `v.${import.meta.env.VITE_EXTENSION_VERSION}`;
</script>

<template>
	<div :class="{ 'dark-mode': darkMode }" class="cl-settings-container">
		<h1 style="margin-bottom: 0">ChessLock Settings</h1>
		<div style="margin-bottom: 15px">{{ version }}</div>
		<div class="cl-settings-card">
			<div class="cl-setting">
				<label for="dark-mode">
					<i class="fas fa-moon"></i>
					Dark Mode
				</label>
				<label class="cl-switch">
					<input type="checkbox" id="dark-mode" v-model="darkMode" />
					<span class="cl-slider"></span>
				</label>
			</div>
		</div>
		<div class="cl-settings-card">
			<div class="cl-setting">
				<label for="even-colour">
					<i class="fas fa-chess-board"></i>
					Even Blocks
				</label>
				<input type="color" id="even-colour" v-model="darkBlockColour" @change="saveColours" />
			</div>
			<div class="cl-setting">
				<label for="odd-colour">
					<i class="fas fa-chess-board"></i>
					Odd Blocks
				</label>
				<input type="color" id="odd-colour" v-model="lightBlockColour" @change="saveColours" />
			</div>
			<div class="cl-setting">
				<label for="piece-colour">
					<i class="fas fa-chess-pawn"></i>
					Pieces
				</label>
				<input type="color" id="piece-colour" v-model="pieceColour" @change="saveColours" />
			</div>
			<div class="cl-setting">
				<label for="highlight-valid-colour">
					<i class="fas fa-check-circle"></i>
					Valid Moves
				</label>
				<input type="color" id="highlight-valid-colour" v-model="highlightValidColour" @change="saveColours" />
			</div>
			<div class="cl-setting">
				<label for="highlight-invalid-colour">
					<i class="fas fa-times-circle"></i>
					Invalid Moves
				</label>
				<input
					type="color"
					id="highlight-invalid-colour"
					v-model="highlightInvalidColour"
					@change="saveColours"
				/>
			</div>
		</div>
		<button class="cl-reset-btn" @click="resetColours">Reset to Default</button>
		<a href="https://github.com/NathanPortelli/ChessLock" class="cl-github-btn" target="_blank"> View on GitHub </a>
	</div>
</template>
