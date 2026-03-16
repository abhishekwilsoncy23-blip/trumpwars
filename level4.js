const Level4 = (function() {
    let player, phone, desks, guards;
    let timer;
    let frameCount;

    return {
        init: function() {
            canvas.style.backgroundColor = "#1e3799"; // Royal blue Command Center carpet
            
            // If playing on mobile, let's change the "FIRE" button text to "SPRINT"
            let actionBtn = document.getElementById("btnAction");
            if(actionBtn) actionBtn.innerText = "SPRINT";

            // Reset keys
            window.keys["ArrowLeft"] = false; window.keys["ArrowRight"] = false;
            window.keys["ArrowUp"] = false; window.keys["ArrowDown"] = false;
            window.keys["Space"] = false;

            // Start at the bottom doors
            player = { x: 175, y: 520, width: 40, height: 40, speed: 4, color: "#00ff00" };
            
            // The Doomsday Phone at the top
            phone = { x: 180, y: 20, width: 40, height: 40 };

            // 15 seconds to reach the phone!
            timer = 15; 
            frameCount = 0;

            // Office Desks (Walls)
            desks = [
                { x: 0, y: 400, width: 150, height: 40 },
                { x: 250, y: 400, width: 150, height: 40 },
                { x: 100, y: 250, width: 200, height: 40 },
                { x: 0, y: 100, width: 120, height: 40 },
                { x: 280, y: 100, width: 120, height: 40 }
            ];

            // Patrolling Guards
            guards = [
                { x: 160, y: 450, width: 30, height: 30, speed: 3, dirX: 1, dirY: 0, rangeLeft: 50, rangeRight: 320 },
                { x: 50, y: 310, width: 30, height: 30, speed: 4, dirX: 1, dirY: 0, rangeLeft: 10, rangeRight: 360 },
                { x: 185, y: 160, width: 30, height: 30, speed: 5, dirX: 1, dirY: 0, rangeLeft: 130, rangeRight: 240 }
            ];
        },

        update: function() {
            // Timer countdown logic (60 frames per second)
            frameCount++;
            if (frameCount >= 60) {
                timer--;
                frameCount = 0;
            }

            if (timer <= 0) {
                triggerGameOver("TIME RAN OUT!<br>The Doomsday protocols activated.", () => changeLevel(Level4));
                return;
            }

            // Sprinting Mechanic (Hold Action/Space to run faster)
            let currentSpeed = window.keys["Space"] ? player.speed * 1.5 : player.speed;

            // Store old position for collision slide off
            let oldX = player.x;
            let oldY = player.y;

            // 4-Way Movement (Includes W/S or Up/Down arrows)
            if (window.keys["ArrowLeft"] || window.keys["KeyA"]) player.x -= currentSpeed;
            if (window.keys["ArrowRight"] || window.keys["KeyD"]) player.x += currentSpeed;
            if (window.keys["ArrowUp"] || window.keys["KeyW"]) player.y -= currentSpeed;
            if (window.keys["ArrowDown"] || window.keys["KeyS"]) player.y += currentSpeed;

            // Screen Boundaries
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
            if (player.y < 0) player.y = 0;
            if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

            // Desk Collisions (Act as solid walls)
            desks.forEach(desk => {
                if (checkCollision(player, desk)) {
                    // Simple bounce back to prevent walking through desks
                    player.x = oldX;
                    player.y = oldY;
                }
            });

            // Guard Movement & Collision
            guards.forEach(guard => {
                guard.x += guard.speed * guard.dirX;
                
                // Patrol limits
                if (guard.x <= guard.rangeLeft || guard.x + guard.width >= guard.rangeRight) {
                    guard.dirX *= -1;
                }

                if (checkCollision(player, guard)) {
                    triggerGameOver("Caught by Command Center Security!", () => changeLevel(Level4));
                }
            });

            // Victory Condition: Touch the Phone!
            if (checkCollision(player, phone)) {
                // Game completely beaten! 
                triggerVictory("HOTLINE ANSWERED!<br>World Saved. Mission Accomplished.", null);
            }
        },

        draw: function(ctx) {
            // Draw Player
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            // If you have a top-down sprite, draw it here:
            try { if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); } catch(e){}

            // Draw Desks
            ctx.fillStyle = "#8e44ad"; // Dark purple/mahogany desks
            desks.forEach(desk => {
                ctx.fillRect(desk.x, desk.y, desk.width, desk.height);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(desk.x, desk.y, desk.width, desk.height);
            });

            // Draw Guards
            ctx.fillStyle = "black";
            guards.forEach(guard => {
                ctx.fillRect(guard.x, guard.y, guard.width, guard.height);
                ctx.font = "20px Arial";
                ctx.fillText("🕶️", guard.x + 1, guard.y + 22);
            });

            // Draw The Phone (Make it flash!)
            if (Math.floor(frameCount / 15) % 2 === 0) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fillRect(phone.x, phone.y, phone.width, phone.height);
            ctx.fillStyle = "black";
            ctx.font = "30px Arial";
            ctx.fillText("☎️", phone.x + 4, phone.y + 30);

            // Draw Timer HUD
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, 0, canvas.width, 50);
            
            ctx.fillStyle = timer <= 5 ? "red" : "white"; // Turn red if under 5 seconds
            ctx.font = "24px Arial";
            ctx.fillText("TIME: 00:" + (timer < 10 ? "0" + timer : timer), 130, 33);
        }
    };
})();
