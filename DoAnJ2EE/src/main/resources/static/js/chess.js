// Chess Game Logic

class ChessGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.currentScore = 0;
        this.soundEnabled = true;
        
        // Game settings
        this.boardSize = 400;
        this.squareSize = this.boardSize / 8;
        this.currentPlayer = 'white'; // white or black
        this.playerColor = 'white'; // Player's color
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.gameTime = 0;
        this.gameTimer = null;
        this.gameState = 'playing'; // playing, check, checkmate, stalemate
        this.isPlayerTurn = true;
        this.boardFlipped = false;
        
        // Board state
        this.board = this.initializeBoard();
        
        // Piece values for scoring
        this.pieceValues = {
            'pawn': 1,
            'rook': 5,
            'knight': 3,
            'bishop': 3,
            'queen': 9,
            'king': 0
        };
        
        // Audio elements
        this.moveSound = null;
        this.captureSound = null;
        this.checkSound = null;
        this.gameOverSound = null;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createAudioElements();
        this.setupEventListeners();
        this.drawBoard();
        this.updateDisplay();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('chessCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = this.boardSize;
        this.canvas.height = this.boardSize;
    }
    
    createAudioElements() {
        // Create simple audio tones using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Move sound (gentle click)
        this.moveSound = this.createTone(audioContext, 600, 0.1);
        
        // Capture sound (sharp sound)
        this.captureSound = this.createTone(audioContext, 800, 0.2);
        
        // Check sound (warning tone)
        this.checkSound = this.createTone(audioContext, 400, 0.3);
        
        // Game over sound (final tone)
        this.gameOverSound = this.createTone(audioContext, 300, 0.5);
    }
    
    createTone(audioContext, frequency, duration) {
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const saveBtn = document.getElementById('saveBtn');
        const soundBtn = document.getElementById('soundBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveScore());
        if (soundBtn) soundBtn.addEventListener('click', () => this.toggleSound());
        
        // Player color selection
        const playerColorInputs = document.querySelectorAll('input[name="playerColor"]');
        playerColorInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handlePlayerColorChange(e.target.value));
        });
        
        // Canvas click events
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
    }
    
    handleCanvasClick(e) {
        if (!this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let col = Math.floor(x / this.squareSize);
        let row = Math.floor(y / this.squareSize);
        
        // If board is flipped, adjust coordinates
        if (this.boardFlipped) {
            col = 7 - col;
            row = 7 - row;
        }
        
        this.handleSquareClick(row, col);
    }
    
    handleSquareClick(row, col) {
        // Only allow player moves on their turn
        if (!this.isPlayerTurn) return;
        
        const piece = this.board[row][col];
        
        // If no piece is selected and clicked square has a piece of current player's color
        if (!this.selectedPiece && piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
            this.validMoves = this.getValidMoves(row, col);
            this.drawBoard();
        }
        // If a piece is selected and clicked square is a valid move
        else if (this.selectedPiece && this.isValidMove(row, col)) {
            this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            this.selectedPiece = null;
            this.validMoves = [];
            this.drawBoard();
            
            // After player move, let bot make a move
            if (this.gameRunning && this.gameState !== 'checkmate') {
                setTimeout(() => this.makeBotMove(), 500);
            }
        }
        // Deselect current piece
        else {
            this.selectedPiece = null;
            this.validMoves = [];
            this.drawBoard();
        }
    }
    
    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }
    
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Initialize pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
            board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Initialize other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false };
            board[7][col] = { type: pieceOrder[col], color: 'white', hasMoved: false };
        }
        
        return board;
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves.push(...this.getPawnMoves(row, col));
                break;
            case 'rook':
                moves.push(...this.getRookMoves(row, col));
                break;
            case 'knight':
                moves.push(...this.getKnightMoves(row, col));
                break;
            case 'bishop':
                moves.push(...this.getBishopMoves(row, col));
                break;
            case 'queen':
                moves.push(...this.getQueenMoves(row, col));
                break;
            case 'king':
                moves.push(...this.getKingMoves(row, col));
                break;
        }
        
        return moves;
    }
    
    getPawnMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Forward move
        const newRow = row + direction;
        if (newRow >= 0 && newRow < 8 && !this.board[newRow][col]) {
            moves.push({ row: newRow, col: col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Diagonal captures
        const captureCols = [col - 1, col + 1];
        for (const captureCol of captureCols) {
            if (captureCol >= 0 && captureCol < 8) {
                const targetPiece = this.board[newRow][captureCol];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({ row: newRow, col: captureCol });
                }
            }
        }
        
        return moves;
    }
    
    getRookMoves(row, col) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        }
        
        return moves;
    }
    
    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        }
        
        return moves;
    }
    
    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }
    
    getKingMoves(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Play sound
        if (capturedPiece) {
            if (this.captureSound) this.captureSound();
            // Nếu ăn được vua thì kết thúc ván đấu
            if (capturedPiece.type === 'king') {
                this.board[toRow][toCol] = piece;
                this.board[fromRow][fromCol] = null;
                piece.hasMoved = true;
                const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece);
                this.moveHistory.push(moveNotation);
                this.gameState = 'checkmate';
                this.updateDisplay();
                this.gameOver('player'); // Pass 'player' as winner
                return;
            }
        } else {
            if (this.moveSound) this.moveSound();
        }
        
        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.hasMoved = true;
        
        // Add to move history
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece);
        this.moveHistory.push(moveNotation);
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check game state
        this.checkGameState();
        
        this.updateDisplay();
    }
    
    checkGameState() {
        const currentColor = this.currentPlayer;
        const opponentColor = currentColor === 'white' ? 'black' : 'white';
        
        // Check for checkmate
        if (this.isCheckmate(opponentColor)) {
            this.gameState = 'checkmate';
            this.gameOver('bot'); // Pass 'bot' as winner
            return;
        }
        
        // Check for stalemate
        if (this.isStalemate(opponentColor)) {
            this.gameState = 'stalemate';
            this.gameOver('bot'); // Pass 'bot' as winner
            return;
        }
        
        // Check for check
        if (this.isCheck(opponentColor)) {
            this.gameState = 'check';
            if (this.checkSound) this.checkSound();
        } else {
            this.gameState = 'playing';
        }
        
        this.updateGameStatus();
    }
    
    updateGameStatus() {
        const checkStatus = document.getElementById('checkStatus');
        const checkmateStatus = document.getElementById('checkmateStatus');
        const gameStateElement = document.getElementById('gameState');
        
        // Hide all status messages
        if (checkStatus) checkStatus.style.display = 'none';
        if (checkmateStatus) checkmateStatus.style.display = 'none';
        
        // Show appropriate status
        if (this.gameState === 'check') {
            if (checkStatus) {
                checkStatus.style.display = 'block';
                checkStatus.className = 'status-item check';
            }
            if (gameStateElement) gameStateElement.textContent = 'Chiếu!';
        } else if (this.gameState === 'checkmate') {
            if (checkmateStatus) {
                checkmateStatus.style.display = 'block';
                checkmateStatus.className = 'status-item checkmate';
            }
            if (gameStateElement) gameStateElement.textContent = 'Chiếu hết!';
        } else {
            if (gameStateElement) gameStateElement.textContent = 'Đang chơi';
        }
    }
    
    getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece) {
        const piece = this.board[toRow][toCol];
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        let notation = '';
        
        if (piece.type !== 'pawn') {
            notation += piece.type.charAt(0).toUpperCase();
        }
        
        if (capturedPiece) {
            if (piece.type === 'pawn') {
                notation += files[fromCol];
            }
            notation += 'x';
        }
        
        notation += files[toCol] + ranks[toRow];
        
        return notation;
    }
    
    handlePlayerColorChange(color) {
        if (color === 'random') {
            this.playerColor = Math.random() > 0.5 ? 'white' : 'black';
        } else {
            this.playerColor = color;
        }
        
        // Update board orientation
        this.boardFlipped = (this.playerColor === 'black');
        this.updateBoardOrientation();
        
        // Update display
        this.updatePlayerDisplay();
        this.updatePlayerColorDisplay();
    }
    
    updateBoardOrientation() {
        const boardContainer = document.querySelector('.chess-board');
        if (this.boardFlipped) {
            boardContainer.classList.add('board-flipped');
        } else {
            boardContainer.classList.remove('board-flipped');
        }
    }
    
    updatePlayerColorDisplay() {
        const playerColorElement = document.getElementById('playerColor');
        if (playerColorElement) {
            playerColorElement.textContent = this.playerColor === 'white' ? 'Trắng' : 'Đen';
        }
    }
    
    updatePlayerDisplay() {
        const currentPlayerElement = document.getElementById('currentPlayer');
        if (currentPlayerElement) {
            if (this.currentPlayer === 'white') {
                currentPlayerElement.className = 'current-player player-white';
                currentPlayerElement.innerHTML = '<i class="fas fa-chess-king me-2"></i>Lượt Trắng';
            } else {
                currentPlayerElement.className = 'current-player player-black';
                currentPlayerElement.innerHTML = '<i class="fas fa-chess-king me-2"></i>Lượt Đen';
            }
        }
    }
    
    isCheck(color) {
        // Find king position
        let kingRow, kingCol;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        // Check if any opponent piece can attack the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.some(move => move.row === kingRow && move.col === kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    isCheckmate(color) {
        if (!this.isCheck(color)) return false;
        
        // Check if any move can get out of check
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        // Try the move
                        const tempPiece = this.board[move.row][move.col];
                        this.board[move.row][move.col] = piece;
                        this.board[row][col] = null;
                        
                        const stillInCheck = this.isCheck(color);
                        
                        // Undo the move
                        this.board[row][col] = piece;
                        this.board[move.row][move.col] = tempPiece;
                        
                        if (!stillInCheck) {
                            return false; // Found a move that gets out of check
                        }
                    }
                }
            }
        }
        
        return true; // No moves can get out of check
    }
    
    isStalemate(color) {
        if (this.isCheck(color)) return false;
        
        // Check if any legal moves exist
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return false; // Found a legal move
                    }
                }
            }
        }
        
        return true; // No legal moves
    }
    
    makeBotMove() {
        if (!this.gameRunning || this.gameState === 'checkmate') return;
        this.isPlayerTurn = false;
        // Bot ưu tiên ăn vua trước
        const allMoves = [];
        const captureKingMoves = [];
        const captureMoves = [];
        const checkMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    for (const move of moves) {
                        const moveData = { fromRow: row, fromCol: col, toRow: move.row, toCol: move.col, piece };
                        // Nếu nước đi này ăn được vua của người chơi
                        const target = this.board[move.row][move.col];
                        if (target && target.type === 'king' && target.color === this.playerColor) {
                            captureKingMoves.push(moveData);
                        } else if (target && target.color !== this.currentPlayer) {
                            captureMoves.push(moveData);
                        }
                        // Check nếu là nước chiếu
                        const tempPiece = this.board[move.row][move.col];
                        this.board[move.row][move.col] = piece;
                        this.board[row][col] = null;
                        const isCheck = this.isCheck(this.playerColor);
                        this.board[row][col] = piece;
                        this.board[move.row][move.col] = tempPiece;
                        if (isCheck) {
                            checkMoves.push(moveData);
                        }
                        allMoves.push(moveData);
                    }
                }
            }
        }
        let selectedMove;
        if (captureKingMoves.length > 0) {
            selectedMove = captureKingMoves[0]; // Ưu tiên ăn vua
        } else if (checkMoves.length > 0) {
            selectedMove = checkMoves[Math.floor(Math.random() * checkMoves.length)];
        } else if (captureMoves.length > 0) {
            selectedMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else if (allMoves.length > 0) {
            selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }
        if (selectedMove) {
            this.makeMove(selectedMove.fromRow, selectedMove.fromCol, selectedMove.toRow, selectedMove.toCol);
        }
        this.isPlayerTurn = true;
        this.drawBoard();
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            if (this.soundEnabled) {
                soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        }
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.currentPlayer = 'white';
            this.gameState = 'playing';
            this.isPlayerTurn = true;
            this.selectedPiece = null;
            this.validMoves = [];
            this.moveHistory = [];
            this.gameTime = 0;
            this.board = this.initializeBoard();
            
            // Set player color if random
            if (this.playerColor === 'random') {
                this.playerColor = Math.random() > 0.5 ? 'white' : 'black';
            }
            
            // Update board orientation
            this.boardFlipped = (this.playerColor === 'black');
            this.updateBoardOrientation();
            this.updatePlayerColorDisplay();
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Đang Chạy';
            }
            
            const gameOver = document.getElementById('gameOver');
            if (gameOver) gameOver.style.display = 'none';
            
            // Hide status messages
            const checkStatus = document.getElementById('checkStatus');
            const checkmateStatus = document.getElementById('checkmateStatus');
            if (checkStatus) checkStatus.style.display = 'none';
            if (checkmateStatus) checkmateStatus.style.display = 'none';
            
            this.startTimer();
            this.updateDisplay();
            this.drawBoard();
            
            // If player is black, bot goes first
            if (this.playerColor === 'black') {
                setTimeout(() => this.makeBotMove(), 1000);
            }
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.currentPlayer = 'white';
        this.gameState = 'playing';
        this.isPlayerTurn = true;
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.gameTime = 0;
        this.board = this.initializeBoard();
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'none';
        
        // Hide status messages
        const checkStatus = document.getElementById('checkStatus');
        const checkmateStatus = document.getElementById('checkmateStatus');
        if (checkStatus) checkStatus.style.display = 'none';
        if (checkmateStatus) checkmateStatus.style.display = 'none';
        
        this.updateDisplay();
        this.drawBoard();
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameRunning) {
                this.gameTime++;
                this.updateDisplay();
            }
        }, 1000);
    }
    
    gameOver(winner) {
        this.gameRunning = false;
        if (this.gameOverSound) this.gameOverSound();
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        const gameOver = document.getElementById('gameOver');
        const finalScore = document.getElementById('finalScore');
        const resultMsg = document.getElementById('gameResultMsg');
        if (gameOver) {
            if (finalScore) finalScore.textContent = this.moveHistory.length;
            if (resultMsg) {
                if (winner === 'player') {
                    resultMsg.textContent = 'Chúc mừng, bạn đã chiến thắng!';
                } else if (winner === 'bot') {
                    resultMsg.textContent = 'Bạn đã thua, chúc may mắn lần sau!';
                } else {
                    resultMsg.textContent = 'Ván đấu kết thúc.';
                }
            }
            gameOver.style.display = 'block';
        }
    }
    
    updateDisplay() {
        const whitePiecesElement = document.getElementById('whitePieces');
        const blackPiecesElement = document.getElementById('blackPieces');
        const moveCountElement = document.getElementById('moveCount');
        const gameTimeElement = document.getElementById('gameTime');
        const currentPlayerElement = document.getElementById('currentPlayer');
        const moveHistoryElement = document.getElementById('moveHistory');
        
        if (whitePiecesElement) whitePiecesElement.textContent = this.countPieces('white');
        if (blackPiecesElement) blackPiecesElement.textContent = this.countPieces('black');
        if (moveCountElement) moveCountElement.textContent = this.moveHistory.length;
        if (gameTimeElement) gameTimeElement.textContent = this.formatTime(this.gameTime);
        
        if (currentPlayerElement) {
            if (this.currentPlayer === 'white') {
                currentPlayerElement.className = 'current-player player-white';
                currentPlayerElement.innerHTML = '<i class="fas fa-chess-king me-2"></i>Lượt Trắng';
            } else {
                currentPlayerElement.className = 'current-player player-black';
                currentPlayerElement.innerHTML = '<i class="fas fa-chess-king me-2"></i>Lượt Đen';
            }
        }
        
        if (moveHistoryElement) {
            moveHistoryElement.innerHTML = this.moveHistory.map(move => 
                `<div class="move-item">${move}</div>`
            ).join('');
            moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
        }
    }
    
    countPieces(color) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].color === color) {
                    count++;
                }
            }
        }
        return count;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    drawBoard() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        
        // Draw squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let x = col * this.squareSize;
                let y = row * this.squareSize;
                
                // If board is flipped, adjust coordinates
                if (this.boardFlipped) {
                    x = (7 - col) * this.squareSize;
                    y = (7 - row) * this.squareSize;
                }
                
                const isLight = (row + col) % 2 === 0;
                
                // Draw square
                this.ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
                this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
                
                // Highlight selected piece
                if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                    this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
                }
                
                // Highlight valid moves
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
                }
            }
        }
        
        // Draw pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    this.drawPiece(row, col, piece);
                }
            }
        }
        
        // Draw coordinates
        this.drawCoordinates();
    }
    
    drawPiece(row, col, piece) {
        let x = col * this.squareSize + this.squareSize / 2;
        let y = row * this.squareSize + this.squareSize / 2;
        
        // If board is flipped, adjust coordinates
        if (this.boardFlipped) {
            x = (7 - col) * this.squareSize + this.squareSize / 2;
            y = (7 - row) * this.squareSize + this.squareSize / 2;
        }
        
        const size = this.squareSize * 0.4;
        
        this.ctx.save();
        this.ctx.fillStyle = piece.color === 'white' ? '#ffffff' : '#000000';
        this.ctx.strokeStyle = piece.color === 'white' ? '#000000' : '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Draw piece base
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw piece symbol
        this.ctx.fillStyle = piece.color === 'white' ? '#000000' : '#ffffff';
        this.ctx.font = `bold ${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const symbols = {
            'king': '♔',
            'queen': '♕',
            'rook': '♖',
            'bishop': '♗',
            'knight': '♘',
            'pawn': '♙'
        };
        
        this.ctx.fillText(symbols[piece.type], x, y);
        this.ctx.restore();
    }
    
    drawCoordinates() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        // Draw file coordinates (a-h)
        for (let col = 0; col < 8; col++) {
            let x = col * this.squareSize + this.squareSize / 2;
            let y = this.boardSize - 5;
            
            if (this.boardFlipped) {
                x = (7 - col) * this.squareSize + this.squareSize / 2;
                y = 5;
            }
            
            this.ctx.fillText(String.fromCharCode(97 + col), x, y);
        }
        
        // Draw rank coordinates (1-8)
        for (let row = 0; row < 8; row++) {
            let x = 10;
            let y = row * this.squareSize + this.squareSize / 2;
            
            if (this.boardFlipped) {
                x = this.boardSize - 10;
                y = (7 - row) * this.squareSize + this.squareSize / 2;
            }
            
            this.ctx.fillText(8 - row, x, y);
        }
    }
    
    saveScore() {
        const gameId = document.getElementById('saveBtn')?.getAttribute('data-game-id');
        if (!gameId) return;
        
        fetch('/game/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `gameId=${gameId}&score=${this.currentScore}`
        })
        .then(response => response.text())
        .then(data => {
            alert('Điểm số đã được lưu thành công!');
            setTimeout(() => {
                location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi lưu điểm số!');
        });
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new ChessGame();
}); 