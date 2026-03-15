const Level2 = (function() {
    // Private Level 2 Variables
    let trumpPlayer, level2Bullets, wallBricks;
    let mirrorWidth = 15;

    return {
        init: function() {
            uiLayer.style.display = "none"; 
            canvas.style.backgroundColor = "#5d6d7e"; // Moody grey sky
            document.getElementById("btnAction").innerText = "FIRE";const Level2 = (function() {
    // Private Level 2 Variables
    let trumpPlayer, level2Bullets, wallBricks;
    let mirrorWidth = 15;

    return {
        init: function() {
            uiLayer.style.display = "none"; 
            canvas.style.backgroundColor = "#5d6d7e"; // Moody grey sky
            document.getElementById("btnAction").innerText = "FIRE";
            document.getElementById("btnAction").style.opacity = "1";
            keys["Space"] = false; keys["ArrowUp"] = false;

            trumpPlayer = { x: 375, y: 500, width: 50, height: 80, aimAngle: -Math.PI / 2, cooldown: 0 };
            level2Bullets = [];
            wallBricks = [];

            let rows = 4;
            let cols = 10;
            let usableWidth = canvas.width - (mirrorWidth * 2);
            let brickWidth = usableWidth / cols; 
            let brickHeight = 40;

            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    let isBomb = false;
                    
                    if (r === rows - 1 && c >= 4 && c <= 5) {
                        isBomb = true;
                    } else {
                        isBomb = Math.random() < 0.05; 
                    }
                    
                    wallBricks.push({ 
                        x: mirrorWidth + (c * brickWidth), 
                        y: 50 + (r * brickHeight), 
                        width: brickWidth - 2, 
                        height: brickHeight - 2, 
                        active: true,
                        isBomb: isBomb
                    });
                }
            }
        },

        update: function() {
            // ---> REDUCED SENSITIVITY TO 0.004 for super fine aiming <---
            if (keys["ArrowLeft"]) { trumpPlayer.aimAngle -= 0.004; }
            if (keys["ArrowRight"]) { trumpPlayer.aimAngle += 0.004; }

            if (trumpPlayer.aimAngle < -Math.PI + 0.15) trumpPlayer.aimAngle = -Math.PI + 0.15;
            if (trumpPlayer.aimAngle > -0.15) trumpPlayer.aimAngle = -0.15;

            if (keys["Space"] && trumpPlayer.cooldown <= 0) {
                let bulletSpeed = 8;
                level2Bullets.push({ 
                    x: trumpPlayer.x + trumpPlayer.width/2 - 5, 
                    y: trumpPlayer.y, 
                    width: 10, height: 10, 
                    vx: Math.cos(trumpPlayer.aimAngle) * bulletSpeed,
                    vy: Math.sin(trumpPlayer.aimAngle) * bulletSpeed
                });
                trumpPlayer.cooldown = 12;
            }
            if (trumpPlayer.cooldown > 0) trumpPlayer.cooldown--;

            let safeBricksLeft = 0;

            level2Bullets.forEach((b, bIndex) => {
                b.x += b.vx;
                b.y += b.vy;

                if (b.x <= mirrorWidth) { b.x = mirrorWidth; b.vx *= -1; }
                else if (b.x + b.width >= canvas.width - mirrorWidth) { b.x = canvas.width - mirrorWidth - b.width; b.vx *= -1; }
                if (b.y <= 0) { b.y = 0; b.vy *= -1; }

                if (b.y > canvas.height) {
                    level2Bullets.splice(bIndex, 1);
                    return;
                }

                wallBricks.forEach(brick => {
                    if (brick.active && checkCollision(b, brick)) {
                        level2Bullets.splice(bIndex, 1); 
                        if (brick.isBomb) triggerGameOver("You shot a BOMB! The wall exploded.", () => changeLevel(Level2));
                        else brick.active = false; 
                    }
                });
            });

            wallBricks.forEach(brick => { if (brick.active && !brick.isBomb) safeBricksLeft++; });

            if (safeBricksLeft === 0) {
                // If you build a Level 3, replace 'null' with 'Level3'
                triggerVictory("THE WALL HAS FALLEN!<br>You mastered the mirrors!", null); 
            }
        },

        draw: function(ctx) {
            ctx.fillStyle = "#00FFFF";
            ctx.fillRect(0, 0, mirrorWidth, canvas.height);
            ctx.fillRect(canvas.width - mirrorWidth, 0, mirrorWidth, canvas.height);
            
            ctx.fillStyle = "blue"; 
            ctx.fillRect(trumpPlayer.x, trumpPlayer.y, trumpPlayer.width, trumpPlayer.height);
            try { 
                if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, trumpPlayer.x, trumpPlayer.y, trumpPlayer.width, trumpPlayer.height); 
            } catch(e){}

            // Predictive line
            let startX = trumpPlayer.x + trumpPlayer.width / 2;
            let startY = trumpPlayer.y;
            let vx = Math.cos(trumpPlayer.aimAngle);
            let vy = Math.sin(trumpPlayer.aimAngle); 

            let t_mirror = (vx < 0) ? (mirrorWidth - startX) / vx : (canvas.width - mirrorWidth - startX) / vx;
            let t_ceil = (0 - startY) / vy; 

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.moveTo(startX, startY);

            let hitX, hitY;
            if (Math.abs(t_mirror) < Math.abs(t_ceil)) {
                hitX = startX + vx * t_mirror;
                hitY = startY + vy * t_mirror;
                ctx.lineTo(hitX, hitY); 
                
                let remaining_dy = 0 - hitY;
                let t_ceil_after_bounce = remaining_dy / vy;
                let finalX = hitX + (-vx) * t_ceil_after_bounce; 
                ctx.lineTo(finalX, 0); 
            } else {
                hitX = startX + vx * t_ceil;
                ctx.lineTo(hitX, 0);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "yellow"; 
            level2Bullets.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width/2, 0, Math.PI * 2);
                ctx.fill();
            });

            wallBricks.forEach(brick => {
                if (brick.active) {
                    if (brick.isBomb) {
                        ctx.fillStyle = "#c0392b"; ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                        ctx.fillStyle = "black"; ctx.font = "20px Arial"; ctx.fillText("💣", brick.x + brick.width/2 - 12, brick.y + brick.height/2 + 7);
                    } else {
                        ctx.fillStyle = "#aab7b8"; ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                    }
                    ctx.strokeStyle = "#7f8c8d"; ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
                }
            });
            
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = "18px Arial";
            ctx.fillText("Aim: Left/Right | Shoot: FIRE | Direct shots are blocked! Bounce off Cyan Mirrors.", 70, 580);
        }
    };
})();
            document.getElementById("btnAction").style.opacity = "1";
            keys["Space"] = false; keys["ArrowUp"] = false;

            trumpPlayer = { x: 375, y: 500, width: 50, height: 80, aimAngle: -Math.PI / 2, cooldown: 0 };
            level2Bullets = [];
            wallBricks = [];

            let rows = 4;
            let cols = 10;
            let usableWidth = canvas.width - (mirrorWidth * 2);
            let brickWidth = usableWidth / cols; 
            let brickHeight = 40;

            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    let isBomb = false;
                    
                    if (r === rows - 1 && c >= 4 && c <= 5) {
                        isBomb = true;
                    } else {
                        isBomb = Math.random() < 0.05; 
                    }
                    
                    wallBricks.push({ 
                        x: mirrorWidth + (c * brickWidth), 
                        y: 50 + (r * brickHeight), 
                        width: brickWidth - 2, 
                        height: brickHeight - 2, 
                        active: true,
                        isBomb: isBomb
                    });
                }
            }
        },

        update: function() {
            // ---> REDUCED SENSITIVITY HERE (Changed 0.04 to 0.015) <---
            if (keys["ArrowLeft"]) { trumpPlayer.aimAngle -= 0.015; }
            if (keys["ArrowRight"]) { trumpPlayer.aimAngle += 0.015; }

            if (trumpPlayer.aimAngle < -Math.PI + 0.15) trumpPlayer.aimAngle = -Math.PI + 0.15;
            if (trumpPlayer.aimAngle > -0.15) trumpPlayer.aimAngle = -0.15;

            if (keys["Space"] && trumpPlayer.cooldown <= 0) {
                let bulletSpeed = 8;
                level2Bullets.push({ 
                    x: trumpPlayer.x + trumpPlayer.width/2 - 5, 
                    y: trumpPlayer.y, 
                    width: 10, height: 10, 
                    vx: Math.cos(trumpPlayer.aimAngle) * bulletSpeed,
                    vy: Math.sin(trumpPlayer.aimAngle) * bulletSpeed
                });
                trumpPlayer.cooldown = 12;
            }
            if (trumpPlayer.cooldown > 0) trumpPlayer.cooldown--;

            let safeBricksLeft = 0;

            level2Bullets.forEach((b, bIndex) => {
                b.x += b.vx;
                b.y += b.vy;

                if (b.x <= mirrorWidth) { b.x = mirrorWidth; b.vx *= -1; }
                else if (b.x + b.width >= canvas.width - mirrorWidth) { b.x = canvas.width - mirrorWidth - b.width; b.vx *= -1; }
                if (b.y <= 0) { b.y = 0; b.vy *= -1; }

                if (b.y > canvas.height) {
                    level2Bullets.splice(bIndex, 1);
                    return;
                }

                wallBricks.forEach(brick => {
                    if (brick.active && checkCollision(b, brick)) {
                        level2Bullets.splice(bIndex, 1); 
                        if (brick.isBomb) triggerGameOver("You shot a BOMB! The wall exploded.", () => changeLevel(Level2));
                        else brick.active = false; 
                    }
                });
            });

            wallBricks.forEach(brick => { if (brick.active && !brick.isBomb) safeBricksLeft++; });

            if (safeBricksLeft === 0) {
                triggerVictory("THE WALL HAS FALLEN!<br>You mastered the mirrors!", null); 
            }
        },

        draw: function(ctx) {
            ctx.fillStyle = "#00FFFF";
            ctx.fillRect(0, 0, mirrorWidth, canvas.height);
            ctx.fillRect(canvas.width - mirrorWidth, 0, mirrorWidth, canvas.height);
            
            ctx.fillStyle = "blue"; 
            ctx.fillRect(trumpPlayer.x, trumpPlayer.y, trumpPlayer.width, trumpPlayer.height);
            try { 
                if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, trumpPlayer.x, trumpPlayer.y, trumpPlayer.width, trumpPlayer.height); 
            } catch(e){}

            // Predictive line
            let startX = trumpPlayer.x + trumpPlayer.width / 2;
            let startY = trumpPlayer.y;
            let vx = Math.cos(trumpPlayer.aimAngle);
            let vy = Math.sin(trumpPlayer.aimAngle); 

            let t_mirror = (vx < 0) ? (mirrorWidth - startX) / vx : (canvas.width - mirrorWidth - startX) / vx;
            let t_ceil = (0 - startY) / vy; 

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.moveTo(startX, startY);

            let hitX, hitY;
            if (Math.abs(t_mirror) < Math.abs(t_ceil)) {
                hitX = startX + vx * t_mirror;
                hitY = startY + vy * t_mirror;
                ctx.lineTo(hitX, hitY); 
                
                let remaining_dy = 0 - hitY;
                let t_ceil_after_bounce = remaining_dy / vy;
                let finalX = hitX + (-vx) * t_ceil_after_bounce; 
                ctx.lineTo(finalX, 0); 
            } else {
                hitX = startX + vx * t_ceil;
                ctx.lineTo(hitX, 0);
            }
            
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "yellow"; 
            level2Bullets.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width/2, 0, Math.PI * 2);
                ctx.fill();
            });

            wallBricks.forEach(brick => {
                if (brick.active) {
                    if (brick.isBomb) {
                        ctx.fillStyle = "#c0392b"; ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                        ctx.fillStyle = "black"; ctx.font = "20px Arial"; ctx.fillText("💣", brick.x + brick.width/2 - 12, brick.y + brick.height/2 + 7);
                    } else {
                        ctx.fillStyle = "#aab7b8"; ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                    }
                    ctx.strokeStyle = "#7f8c8d"; ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
                }
            });
            
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = "18px Arial";
            ctx.fillText("Aim: Left/Right | Shoot: FIRE | Direct shots are blocked! Bounce off Cyan Mirrors.", 70, 580);
        }
    };
})();
