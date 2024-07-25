# ChessLock

ChessLock is a unique password generator that creates secure passwords based on your chess moves. By making use of the complexity and unpredictability of chess, this Chrome extension can ensure that your passwords are both strong and memorable.

![ChessLock-Screenshot](https://github.com/user-attachments/assets/df2e35bb-f757-405f-8f59-138665d3a67a)

## Features

- **Secure Passwords**: Generates strong and secure passwords based on chess moves.
- **Customisable**: Allows you to customise the chessboard (board, pieces, highlights) and dark mode.
- **Additional Security**: Ability to add symbols in between notations.
- **Special Moves**: Allows for special moves such as castling and pawn promotions, and their respective notations.

## Installation

To install locally, follow these steps:

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/NathanPortelli/ChessLock.git
    ```

2. **Navigate to the Project Directory**:
    ```sh
    cd ChessLock
    ```

3. **Install Dependencies**:
    ```sh
    npm i
    ```

## Usage

To use ChessLock locally:

1. **Run the Application**:
    - Run ```npm run dev``` in your terminal. 
    - Afterwards, split the terminal and run ```npm run build```

2. **Open Your Browser**:
    - Navigate to the extensions in your Chrome-based web browser ([Chrome](chrome://extensions/)/[Edge](edge://extensions/)).
    - Turn on *Developer Mode*.
    - Click on ```Load Unpacked```.
    - Navigate to the *ChessLock* folder and select the ```dist``` folder.
    - Turn on *ChessLock* extension

3. **Generate Passwords**:
    - Go to any password input and select the **♙** icon to open the chess board.
    - Move the pieces to generate the password based on chess notations.

4. **Change Colours**
    - Click on the *Extensions* icon (🧩) on your web browser.
    - Click on *ChessLock*.
    - From this menu, you will be able to change the chess board's colours, chess pieces, the overlaying highlights, and change between dark and light mode.

## Password Examples

- With Symbols: _b4!Nf3?Ba3*d4&Qc3$_
- Without Symbols: _b4Nf3Ba3d4Qc3_

If you have any questions or feedback, please open an issue or contact us directly!