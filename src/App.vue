<script setup lang="ts">
import { ref, onMounted } from 'vue';

const evenBlockColour = ref('#779556');
const oddBlockColour = ref('#ffffff');
const pieceColour = ref('#000000');

const saveColours = () => {
  const colours = {
    evenBlock: evenBlockColour.value,
    oddBlock: oddBlockColour.value,
    piece: pieceColour.value
  };
  chrome.storage.sync.set({ chessboardColours: colours });
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id!, {
      type: 'UPDATE_COLOURS',
      colours: colours
    });
  });
};

const loadColours = () => {
  chrome.storage.sync.get('chessboardColours', (result: { [key: string]: any }) => {
    if (result['chessboardColours']) {
      evenBlockColour.value = result['chessboardColours'].evenBlock;
      oddBlockColour.value = result['chessboardColours'].oddBlock;
      pieceColour.value = result['chessboardColours'].piece;
    }
  });
};

const resetColours = () => {
  evenBlockColour.value = '#779556';
  oddBlockColour.value = '#ffffff';
  pieceColour.value = '#000000';
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
		<input type="color" id="even-colour" v-model="evenBlockColour" @change="saveColours">
	</div>
	<div>
		<label for="odd-colour">Odd Blocks:</label>
		<input type="color" id="odd-colour" v-model="oddBlockColour" @change="saveColours">
	</div>
	<div>
		<label for="piece-colour">Pieces:</label>
		<input type="color" id="piece-colour" v-model="pieceColour" @change="saveColours">
	</div>
	<div>
		<button class="cl-reset-btn" @click="resetColours">Reset to Default</button>
	</div>
	<div>
		<a href="https://github.com/NathanPortelli/ChessLock" class="cl-github-btn" target="_blank">View on GitHub</a>
	</div>
</div>
</template>