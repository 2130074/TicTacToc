// ==================== CONSTANTS ==================== //
const STATUS_DISPLAY = document.querySelector('.game-notification');
const GAME_STATE = ["", "", "", "", "", "", "", "", ""];
const WINNINGS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
const LEADERBOARD_LIST = document.getElementById('leaderboardList');
const DRAW_MESSAGE = "¡El juego ha terminado en un empate!";
const TIME_DISPLAY = document.getElementById('timeDisplay');

// ==================== VARIABLES ==================== //
let gameActive = false;
let startTime;
let endTime;
let elapsedTime;
let timerInterval;

// ==================== FUNCTIONS ==================== //

function main() {
    handleStatusDisplay("");
    listeners();
    displayScores();
}

function listeners() {
    document.querySelector('.game-container').addEventListener('click', handleCellClick);
    document.querySelector('.restart').addEventListener('click', handleRestartGame);
    document.querySelector('.start').addEventListener('click', handleStartGame);
}

function handleStatusDisplay(message) {
    STATUS_DISPLAY.textContent = message;
}

function handleRestartGame() {
    gameActive = false;
    clearInterval(timerInterval);
    startTime = null;
    endTime = null;
    restartGameState();
    handleStatusDisplay("");
    document.querySelectorAll('.game-cell').forEach(cell => cell.innerHTML = "");
    TIME_DISPLAY.textContent = "Tiempo: 00:00";
}

function handleStartGame() {
    if (!gameActive) {
        gameActive = true;
        startTime = new Date().getTime();
        updateTimeDisplay();
        timerInterval = setInterval(updateTimeDisplay, 1000);
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    if (clickedCell.classList.contains('game-cell')) {
        const clickedCellIndex = Array.from(clickedCell.parentNode.children).indexOf(clickedCell);
        if (GAME_STATE[clickedCellIndex] !== '' || !gameActive) {
            return false;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        if (checkWin() || checkDraw()) {
            return;
        }

        handleComputerMove();
        if (checkWin() || checkDraw()) {
            return;
        }
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    GAME_STATE[clickedCellIndex] = "X";
    clickedCell.innerHTML = "X";
}

function checkWin() {
    for (let i = 0; i < WINNINGS.length; i++) {
        const [a, b, c] = WINNINGS[i];
        if (GAME_STATE[a] && GAME_STATE[a] === GAME_STATE[b] && GAME_STATE[a] === GAME_STATE[c]) {
            const winner = GAME_STATE[a];
            const winMessage = winner === "X" ? `¡El jugador ha ganado!` : `¡La máquina ha ganado!`;
            endGame(winMessage, winner);
            return true;
        }
    }
    return false;
}

function checkDraw() {
    if (!GAME_STATE.includes('')) {
        endGame(DRAW_MESSAGE, null);
        return true;
    }
    return false;
}

function endGame(message, winner) {
    handleStatusDisplay(message);
    gameActive = false;
    endTime = new Date().getTime();
    clearInterval(timerInterval);
    elapsedTime = (endTime - startTime) / 1000;
    TIME_DISPLAY.textContent = `Tiempo: ${formatTime(elapsedTime)}`;
    if (winner === "X") {
        const playerName = prompt("¡Has ganado! Ingresa tu nombre para el registro:");
        if (playerName) {
            saveScore({ name: playerName, time: elapsedTime });
        }
    }
}

function handleComputerMove() {
    // Primero, intenta bloquear el jugador si puede ganar en el siguiente movimiento
    for (let i = 0; i < WINNINGS.length; i++) {
        const [a, b, c] = WINNINGS[i];
        if (GAME_STATE[a] === "X" && GAME_STATE[b] === "X" && GAME_STATE[c] === "") {
            GAME_STATE[c] = "O";
            document.getElementById(`cell-${c}`).innerHTML = "O";
            return;
        } else if (GAME_STATE[a] === "X" && GAME_STATE[c] === "X" && GAME_STATE[b] === "") {
            GAME_STATE[b] = "O";
            document.getElementById(`cell-${b}`).innerHTML = "O";
            return;
        } else if (GAME_STATE[b] === "X" && GAME_STATE[c] === "X" && GAME_STATE[a] === "") {
            GAME_STATE[a] = "O";
            document.getElementById(`cell-${a}`).innerHTML = "O";
            return;
        }
    }

    // Si no hay movimientos para bloquear al jugador, intenta forzar un empate
    const emptyCells = GAME_STATE.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
    if (emptyCells.length > 1) {
        const center = 4; // Suponiendo que el centro es la celda 4
        if (GAME_STATE[center] === '') {
            GAME_STATE[center] = "O";
            document.getElementById(`cell-${center}`).innerHTML = "O";
            return;
        }
    }

    // Si no hay manera de bloquear o forzar un empate, selecciona una celda aleatoria
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cellIndex = emptyCells[randomIndex];
    GAME_STATE[cellIndex] = "O";
    document.getElementById(`cell-${cellIndex}`).innerHTML = "O";
}

function restartGameState() {
    for (let i = 0; i < GAME_STATE.length; i++) {
        GAME_STATE[i] = '';
    }
}

function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push(score);
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10); // Limita a los 10 mejores tiempos
    localStorage.setItem('scores', JSON.stringify(scores));
    displayScores();
}

function displayScores() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos resultados

    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.sort((a, b) => a.time - b.time); // Ordenar por tiempo
    scores = scores.slice(0, 10); // Limitar a los 10 mejores tiempos

    scores.forEach((score, index) => {
        const row = document.createElement('li');
        row.textContent = `${index + 1}. ${score.name} - ${formatTime(score.time)}`;
        leaderboardList.appendChild(row);
    });
}

function updateTimeDisplay() {
    if (gameActive) {
        const currentTime = new Date().getTime();
        const elapsedTime = (currentTime - startTime) / 1000;
        TIME_DISPLAY.textContent = `Tiempo: ${formatTime(elapsedTime)}`;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${padTime(minutes)}:${padTime(remainingSeconds)}`;
}

function padTime(time) {
    return time < 10 ? `0${time}` : time;
}

main();
displayScores();