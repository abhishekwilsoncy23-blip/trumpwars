// Global Game Variables accessible by all levels
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const uiLayer = document.getElementById("uiLayer");
const uiMessage = document.getElementById("uiMessage");
const btnRestart = document.getElementById("btnRestart");
const btnNextLevel = document.getElementById("btnNextLevel");

// Global Assets
const playerImg = new Image(); playerImg.src = 't.png';
const satImg = new Image(); satImg.src = 'satellite.png'; 

// Input State
const keys = {};
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

function bindTouch(elementId, keyCode) {
    const el = document.getElementById(elementId);
    el.addEventListener("touchstart", (e) => { e.preventDefault(); keys[keyCode] = true; });
    el.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyCode] = false; });
}
bindTouch("btnLeft", "ArrowLeft");
bindTouch("btnRight", "ArrowRight");
const btnAction = document.getElementById("btnAction");
btnAction.addEventListener("touchstart", (e) => { e.preventDefault(); keys["Space"] = true; keys["ArrowUp"] = true; });
btnAction.addEventListener("touchend", (e) => { e.preventDefault(); keys["Space"] = false; keys["ArrowUp"] = false; });

// Level Manager (State Machine)
let currentLevel = null;
let isPlaying = false;

function changeLevel(newLevel) {
    currentLevel = newLevel;
    currentLevel.init();
}

// Global UI Helpers
function triggerGameOver(reason, retryCallback) {
    isPlaying = false;
    uiLayer.style.display = "flex"; 
    uiMessage.style.color = "#e74c3c";
    uiMessage.innerHTML = "GAME OVER<br><span style='font-size: 0.5em; color: white'>" + reason + "</span>";
    btnRestart.style.display = "block"; 
    btnNextLevel.style.display = "none";
    btnRestart.onclick = () => {
        isPlaying = true;
        retryCallback();
    };
}

function triggerVictory(message, nextLevelObject) {
    isPlaying = false;
    uiLayer.style.display = "flex"; 
    uiMessage.style.color = "#2ecc71";
    uiMessage.innerHTML = message;
    btnRestart.style.display = "none";
    
    if (nextLevelObject) {
        btnNextLevel.style.display = "block";
        btnNextLevel.innerText = "Start Next Level";
        btnNextLevel.onclick = () => {
            isPlaying = true;
            changeLevel(nextLevelObject);
        };
    } else {
        btnNextLevel.style.display = "none";
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

// Main Game Loop
function gameLoop() {
    if (isPlaying && currentLevel) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentLevel.update();
        currentLevel.draw(ctx);
    }
    requestAnimationFrame(gameLoop);
}

// Start Screen Logic
const startScreen = document.getElementById("startScreen");
startScreen.addEventListener("click", () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) docElm.requestFullscreen();
    else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
    else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    
    startScreen.style.display = "none";
    isPlaying = true;
    
    // Start Level 1! (Make sure Level1 is loaded via HTML script tag)
    changeLevel(Level1); 
    gameLoop();
});
