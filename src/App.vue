<script setup lang="ts">
	import { ref, onMounted, watch } from "vue";
	import { ChessboardColours } from "./content";

	const darkBlockColour = ref("#779556");
	const lightBlockColour = ref("#ffffff");
	const pieceColour = ref("#000000");
	const highlightValidColour = ref("#008000");
	const highlightInvalidColour = ref("#ff0000");
	const darkMode = ref(false);
	const isDefaultDarkMode = ref(true);
	const hasUserChangedDarkMode = ref(false);

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
			isDefaultDarkMode: isDefaultDarkMode.value
		});

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id!, {
				type: "UPDATE_COLOURS",
				colours: colours,
				darkMode: darkMode.value,
				isDefaultDarkMode: isDefaultDarkMode.value
			});
		});
	};
	
	const loadColours = () => {
		chrome.storage.sync.get(["chessboardColours", "darkMode", "isDefaultDarkMode"], (result: { [key: string]: any }) => {
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

				if (result.hasOwnProperty("isDefaultDarkMode")) {
					isDefaultDarkMode.value = result["isDefaultDarkMode"] as boolean;
				}

				if (result.hasOwnProperty("hasUserChangedDarkMode")) {
					hasUserChangedDarkMode.value = result["hasUserChangedDarkMode"] as boolean;
				}

				if (isDefaultDarkMode.value) {
					darkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
				} else if (result.hasOwnProperty("darkMode")) {
					darkMode.value = result["darkMode"] as boolean;
				}

				// Send initial settings to content script
				chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id!, {
						type: "UPDATE_COLOURS",
						colours: result["chessboardColours"] || {},
						darkMode: darkMode.value,
						isDefaultDarkMode: isDefaultDarkMode.value
					});
				});
			}
		});
	};

	watch(darkMode, (newValue) => {
		if (newValue) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}

		if (!hasUserChangedDarkMode.value) {
			hasUserChangedDarkMode.value = true;
			isDefaultDarkMode.value = false;
		}
		saveColours();
	});

	const resetColours = () => {
		darkBlockColour.value = "#779556";
		lightBlockColour.value = "#ffffff";
		pieceColour.value = "#000000";
		highlightValidColour.value = "#008000";
		highlightInvalidColour.value = "#ff0000";
		
		isDefaultDarkMode.value = true;
		hasUserChangedDarkMode.value = false;
		darkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		saveColours();
	};

	onMounted(() => {
		loadColours();
		
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addListener(() => {
			if (isDefaultDarkMode.value) {
			darkMode.value = mediaQuery.matches;
			saveColours();
			}
		});

		if (darkMode.value) {
			document.body.classList.add('dark-mode');
		}
	});
</script>

<template>
	<div :class="{ 'dark-mode': darkMode }" class="cl-settings-container">
		<h1>ChessLock Settings</h1>
		<div class="cl-settings-card">
			<div class="cl-setting">
				<label for="dark-mode">
					<i class="fas fa-moon"></i>
					Dark Mode
				</label>
				<label class="cl-switch">
					<input type="checkbox" id="dark-mode" v-model="darkMode" @change="hasUserChangedDarkMode = true; isDefaultDarkMode = false;">
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
				<input type="color" id="even-colour" v-model="darkBlockColour" @change="saveColours">
			</div>
			<div class="cl-setting">
				<label for="odd-colour">
					<i class="fas fa-chess-board"></i>
					Odd Blocks
				</label>
				<input type="color" id="odd-colour" v-model="lightBlockColour" @change="saveColours">
			</div>
			<div class="cl-setting">
				<label for="piece-colour">
					<i class="fas fa-chess-pawn"></i>
					Pieces
				</label>
				<input type="color" id="piece-colour" v-model="pieceColour" @change="saveColours">
			</div>
			<div class="cl-setting">
				<label for="highlight-valid-colour">
					<i class="fas fa-check-circle"></i>
					Valid Moves
				</label>
				<input type="color" id="highlight-valid-colour" v-model="highlightValidColour" @change="saveColours">
			</div>
			<div class="cl-setting">
				<label for="highlight-invalid-colour">
					<i class="fas fa-times-circle"></i>
					Invalid Moves
				</label>
				<input type="color" id="highlight-invalid-colour" v-model="highlightInvalidColour" @change="saveColours">
			</div>
		</div>
		<button class="cl-reset-btn" @click="resetColours">Reset to Default</button>
		<a href="https://github.com/NathanPortelli/ChessLock" class="cl-github-btn" target="_blank">
			View on GitHub
		</a>
	</div>
</template>