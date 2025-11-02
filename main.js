/**
 * Script principal - Punto de entrada del juego
 */

let game = null;

// Referencias a elementos DOM
const canvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('startScreen');
const gameControls = document.getElementById('gameControls');
const hud = document.getElementById('hud');
const btnStart = document.getElementById('btnStart');

// Nuevos botones de control
const btnOptions = document.getElementById('btnOptions');
const btnRestart = document.getElementById('btnRestart');
const btnHome = document.getElementById('btnHome');

// Pantallas modales
const optionsScreen = document.getElementById('optionsScreen');
const restartConfirmScreen = document.getElementById('restartConfirmScreen');

// Botones de opciones
const btnOptionsClose = document.getElementById('btnOptionsClose');
const btnOptionsToMenu = document.getElementById('btnOptionsToMenu');

// Botones de confirmación de reinicio
const btnRestartConfirm = document.getElementById('btnRestartConfirm');
const btnRestartCancel = document.getElementById('btnRestartCancel');

/**
 * Inicia el juego
 */
function startGame() {
    // Ocultar pantalla de inicio
    startScreen.classList.add('hidden');
    
    // Mostrar controles y HUD
    gameControls.classList.remove('hidden');
    hud.classList.remove('hidden');
    
    // Crear e iniciar el juego
    if (!game) {
        game = new Game(canvas);
    }
    
    game.start();
}

/**
 * Detiene el juego y vuelve al menú principal
 */
function stopGame() {
    if (game) {
        game.stop();
    }
    
    // Mostrar pantalla de inicio
    startScreen.classList.remove('hidden');
    
    // Ocultar controles y HUD
    gameControls.classList.add('hidden');
    hud.classList.add('hidden');
    
    // Ocultar modales si están abiertos
    optionsScreen.classList.add('hidden');
    restartConfirmScreen.classList.add('hidden');
}

/**
 * Reinicia el juego actual
 */
function restartGame() {
    if (game) {
        game.stop();
    }
    
    // Reiniciar el juego sin volver al menú
    game = new Game(canvas);
    game.start();
    
    // Cerrar modal de confirmación
    restartConfirmScreen.classList.add('hidden');
}

/**
 * Muestra la pantalla de opciones
 */
function showOptions() {
    optionsScreen.classList.remove('hidden');
}

/**
 * Oculta la pantalla de opciones
 */
function hideOptions() {
    optionsScreen.classList.add('hidden');
}

/**
 * Muestra la confirmación de reinicio
 */
function showRestartConfirm() {
    restartConfirmScreen.classList.remove('hidden');
}

/**
 * Oculta la confirmación de reinicio
 */
function hideRestartConfirm() {
    restartConfirmScreen.classList.add('hidden');
}

// Event listeners para botones principales
btnStart.addEventListener('click', startGame);

// Event listeners para botones de control del juego
btnOptions.addEventListener('click', showOptions);
btnRestart.addEventListener('click', showRestartConfirm);
btnHome.addEventListener('click', stopGame);

// Event listeners para pantalla de opciones
btnOptionsClose.addEventListener('click', hideOptions);
btnOptionsToMenu.addEventListener('click', () => {
    hideOptions();
    stopGame();
});

// Event listeners para confirmación de reinicio
btnRestartConfirm.addEventListener('click', restartGame);
btnRestartCancel.addEventListener('click', hideRestartConfirm);

// Prevenir comportamiento por defecto del canvas
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('dragstart', (e) => e.preventDefault());

console.log('🎯 Juego cargado');
console.log('📝 Presiona "Iniciar Juego" para comenzar');