const Level2 = (function() {
    let player, level2Bullets, wallBricks;
    let mirrorWidth = 15;

    return {
        init: function() {
            canvas.style.backgroundColor = "#5d6d7e"; 
            document.getElementById("btnAction").innerText = "FIRE";
            keys["Space"] = false; keys["ArrowLeft"] = false; keys["ArrowRight"] = false;

            player = { x: 175, y: 500, width: 50, height: 80, aimAngle: -Math.PI / 2, cooldown: 0 };
            level2Bullets = [];
            wallBricks = [];

            let rows = 4;
            let cols = 10;
            let usableWidth = canvas.width - (mirrorWidth * 2);
            let brickWidth = usableWidth / cols; 
            let brickHeight = 40;

            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    let isBomb = (r === rows - 1 && c >= 4 && c <= 5) ? true : Math.random() < 0.05; 
                    wallBricks.push({ 
                        x: mirrorWidth + (c * brickWidth), y: 50 + (r * brickHeight), 
                        width: brickWidth - 2, height: brickHeight - 2, active: true, isBomb: isBomb
                    });
                }
            }
        },

        update: function() {
            if (keys["ArrowLeft"]) player.aimAngle -= 0.004;
            if (keys["ArrowRight"]) player.aimAngle += 0.004;

            if (player.aimAngle < -Math.PI + 0.15) player.aimAngle = -Math.PI + 0.15;
            if (player.aimAngle > -0.15) player.aimAngle = -0.15;

            if (keys["Space"] && player.cooldown <= 0) {
                let bulletSpeed = 8;
                level2Bullets.push({ 
                    x: player.x + player.width/2 - 5, y: player.y, width: 10, height: 10, 
                    vx: Math.cos(player.aimAngle) * bulletSpeed, vy: Math.sin(player.aimAngle) * bulletSpeed
                });
                player.cooldown = 15;
            }
            if (player.cooldown > 0) player.cooldown--;

            let safeBricksLeft = 0;

            level2Bullets.forEach((b, bIndex) => {
                b.x += b.vx; b.y += b.vy;

                if (b.x <= mirrorWidth) { b.x = mirrorWidth; b.vx *= -1; }
                else if (b.x + b.width >= canvas.width - mirrorWidth) { b.x = canvas.width - mirrorWidth - b.width; b.vx *= -1; }
                if (b.y <= 0) { b.y = 0; b.vy *= -1; }

                if (b.y > canvas.height) { level2Bullets.splice(bIndex, 1); return; }

                wallBricks.forEach(brick => {
                    if (brick.active && checkCollision(b, brick)) {
                        level2Bullets.splice(bIndex, 1); 
                        if (brick.isBomb) triggerGameOver("You hit a BOMB! The vault exploded.", () => changeLevel(Level2));
                        else brick.active = false; 
                    }
                });
            });

            wallBricks.forEach(brick => { if (brick.active && !brick.isBomb) safeBricksLeft++; });

            if (safeBricksLeft === 0) {
                localStorage.setItem("myGame_savedLevel", 3); // Save progress!
                triggerVictory("THE VAULT HAS FALLEN!", Level3); 
            }
        },

        draw: function(ctx) {
            ctx.fillStyle = "#00FFFF";
            ctx.fillRect(0, 0, mirrorWidth, canvas.height);
            ctx.fillRect(canvas.width - mirrorWidth, 0, mirrorWidth, canvas.height);
            
            ctx.fillStyle = "blue"; 
            ctx.fillRect(player.x, player.y, player.width, player.height);
            try { if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); } catch(e){}

            let startX = player.x + player.width / 2;
            let startY = player.y;
            let vx = Math.cos(player.aimAngle);
            let vy = Math.sin(player.aimAngle); 
            let t_mirror = (vx < 0) ? (mirrorWidth - startX) / vx : (canvas.width - mirrorWidth - startX) / vx;
            let t_ceil = (0 - startY) / vy; 

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.moveTo(startX, startY);

            let hitX, hitY;
            if (Math.abs(t_mirror) < Math.abs(t_ceil)) {
                hitX = startX + vx * t_mirror; hitY = startY + vy * t_mirror;
                ctx.lineTo(hitX, hitY); 
                let t_ceil_after_bounce = (0 - hitY) / vy;
                ctx.lineTo(hitX + (-vx) * t_ceil_after_bounce, 0); 
            } else {
                ctx.lineTo(startX + vx * t_ceil, 0);
            }
            ctx.stroke(); ctx.setLineDash([]);

            ctx.fillStyle = "yellow"; 
            level2Bullets.forEach(b => {
                ctx.beginPath(); ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width/2, 0, Math.PI * 2); ctx.fill();
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
            
            ctx.fillStyle = "white"; ctx.font = "14px Arial";
            ctx.fillText("Direct shots are blocked! Bounce off Cyan Mirrors.", 45, 580);
        }
    };
})();
