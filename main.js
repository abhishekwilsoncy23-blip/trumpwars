const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const uiLayer = document.getElementById("uiLayer");
const uiMessage = document.getElementById("uiMessage");
const uiButton = document.getElementById("uiButton");
const mainMenu = document.getElementById("mainMenu");

let currentLevel = null;
let animationId;
window.keys = {};

// Load your generic player image here (make sure t.png is in your folder)
let playerImg = new Image();
playerImg.src = "t.png"; 

// Keyboard Listeners
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

// Touch Listeners for Mobile Buttons
function setupTouch(id, keyStr) {
    const btn = document.getElementById(id);
    btn.addEventListener("touchstart", (e) => { e.preventDefault(); keys[keyStr] = true; });
    btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyStr] = false; });
    btn.addEventListener("mousedown", (e) => { e.preventDefault(); keys[keyStr] = true; });
    btn.addEventListener("mouseup", (e) => { e.preventDefault(); keys[keyStr] = false; });
}
setupTouch("btnLeft", "ArrowLeft");
setupTouch("btnRight", "ArrowRight");
setupTouch("btnAction", "Space");

// Core Game Functions
function checkCollision(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentLevel) {
        currentLevel.update();
        currentLevel.draw(ctx);
    }
    animationId = requestAnimationFrame(gameLoop);
}

function changeLevel(newLevel) {
    cancelAnimationFrame(animationId);
    uiLayer.style.display = "none";
    mainMenu.style.display = "none";
    currentLevel = newLevel;
    if (currentLevel) {
        currentLevel.init();
        gameLoop();
    }
}

function triggerGameOver(msg, retryCallback) {
    cancelAnimationFrame(animationId);
    currentLevel = null;
    uiLayer.style.display = "flex";
    uiMessage.innerHTML = `<span style="color:red; font-weight:bold;">GAME OVER</span><br><br>${msg}`;
    uiButton.innerText = "TRY AGAIN";
    uiButton.onclick = retryCallback;
}

function triggerVictory(msg, nextLevel) {
    cancelAnimationFrame(animationId);
    currentLevel = null;
    uiLayer.style.display = "flex";
    uiMessage.innerHTML = `<span style="color:lime; font-weight:bold;">SUCCESS!</span><br><br>${msg}`;
    
    if (nextLevel) {
        uiButton.innerText = "NEXT LEVEL";
        uiButton.onclick = () => changeLevel(nextLevel);
    } else {
        uiButton.innerText = "MAIN MENU";
        uiButton.onclick = () => { uiLayer.style.display = "none"; mainMenu.style.display = "flex"; };
    }
}

// Save & Load System
function loadSavedGame() {
    let savedLevel = parseInt(localStorage.getItem("myGame_savedLevel")) || 1;
    if (savedLevel === 3) changeLevel(Level3);
    else if (savedLevel === 2) changeLevel(Level2);
    else changeLevel(Level1);
}

function startNewGame() {
    localStorage.removeItem("myGame_savedLevel");
    changeLevel(Level1);
}

// Check if there's a save to show the Continue button
window.onload = () => {
    if (!localStorage.getItem("myGame_savedLevel")) {
        document.getElementById("continueBtn").style.display = "none";
    }
};
