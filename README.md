# ChessLock: Generate Strong Passwords with your Chess Moves

ChessLock is a unique password generator that creates secure passwords based on your chess moves. By making use of the complexity and unpredictability of chess, this Chrome extension can ensure that your passwords are both strong and memorable.

![ChessLock](https://github.com/user-attachments/assets/76aedae3-7179-4453-ac2f-085c6ae7c521)

## Links

Google Web Store: https://chromewebstore.google.com/detail/chesslock/ldbphmkpnipoelilehkniddbkdhhklli

Edge Add-ons: https://microsoftedge.microsoft.com/addons/detail/chesslock/odmjcndpggjagmcgegaafohoahgfdpbd

## Features

- **Secure Passwords**: Generates strong and secure passwords based on chess moves.
- **Customisable**: Allows you to customise the chessboard (board, pieces, highlights) and dark mode.
- **Additional Security**: Ability to add symbols in between notations.
- **Special Moves**: Allows for special moves such as castling and pawn promotions, and their respective notations.

## Local Installation

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

### Usage

To use ChessLock locally:

1. **Run the Application**:
    - Run ```npm run dev``` in your terminal. 
    - Afterwards, split the terminal and run ```npm run build```.

2. **Load the Extension**:
    - Open the extensions page in your Chrome-based browser ([Chrome](chrome://extensions/)/[Edge](edge://extensions/)).
    - Enable *Developer Mode*.
    - Click ```Load Unpacked```.
    - Select the ```dist``` folder within the ChessLock directory.
    - Enable the *ChessLock* extension

3. **Generate Password**:
    - Visit any website requiring a password.
    - Click the extension logo next to the password input to open the chessboard.
    - Move the pieces to generate your password based on chess notations.

4. **Change Settings**
    - Click the *Extensions* icon (🧩) on your web browser.
    - Select *ChessLock*.
    - This menu allows you to customize the board colours, pieces, highlights, and enable dark mode.
    - Pin the extension for ease of access.

## Password Examples

- With Symbols: _b4!Nf3?Ba3*d4&Qc3$_
- Without Symbols: _b4Nf3Ba3d4Qc3_

If you have any questions or feedback, please open an issue or contact us directly!
