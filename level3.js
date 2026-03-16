const Level3 = (function() {
    let player, bullets, mibs, mibBullets, alien;
    let mibDirection = 1; 
    let mibSpeed = 0.7; // VERY SLOW movement
    let phase = 1; 

    return {
        init: function() {
            canvas.style.backgroundColor = "#c0392b"; 
            document.getElementById("btnAction").innerText = "FIRE";
            
            window.keys["Space"] = false; 
            window.keys["ArrowLeft"] = false; 
            window.keys["ArrowRight"] = false;

            // Player is now FASTER (speed 8)
            player = { x: 175, y: 500, width: 50, height: 80, speed: 8, cooldown: 0, color: "blue" };
            bullets = []; mibBullets = []; mibs = []; phase = 1;
            alien = { x: 175, y: 20, width: 40, height: 40, speed: 2, direction: 1 };

            for(let r = 0; r < 3; r++) {
                for(let c = 0; c < 5; c++) {
                    mibs.push({ x: 50 + (c * 60), y: 80 + (r * 50), width: 40, height: 40 });
                }
            }
        },

        update: function() {
            if (window.keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
            if (window.keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

            if (phase === 1) {
                // RAPID FIRE: Cooldown reduced to 8
                if (window.keys["Space"] && player.cooldown <= 0) {
                    bullets.push({ x: player.x + player.width/2 - 5, y: player.y, width: 10, height: 20, speed: 10 });
                    player.cooldown = 8; 
                }
                if (player.cooldown > 0) player.cooldown--;

                bullets.forEach((b, bIndex) => {
                    b.y -= b.speed;
                    if (b.y < 0) bullets.splice(bIndex, 1);
                    if (checkCollision(b, alien)) triggerGameOver("Oops! Watch your fire, don't hit the alien!", () => changeLevel(Level3));
                });

                let hitEdge = false;
                mibs.forEach(mib => {
                    mib.x += mibSpeed * mibDirection;
                    if (mib.x <= 10 || mib.x + mib.width >= canvas.width - 10) hitEdge = true;
                    
                    // ULTRA NERF: 0.001 chance to shoot (they almost never fire)
                    if (Math.random() < 0.001) {
                        mibBullets.push({ 
                            x: mib.x + mib.width/2 - 4, 
                            y: mib.y + mib.height, 
                            width: 8, 
                            height: 15, 
                            speed: 2 // Very slow bullets
                        });
                    }
                });

                if (hitEdge) {
                    mibDirection *= -1;
                    mib.y += 5; // Barely moves down
                }

                // Bullet collisions
                bullets.forEach((b, bIndex) => {
                    mibs.forEach((mib, mIndex) => {
                        if (checkCollision(b, mib)) { 
                            bullets.splice(bIndex, 1); 
                            mibs.splice(mIndex, 1); 
                        }
                    });
                });

                mibBullets.forEach((mb, mbIndex) => {
                    mb.y += mb.speed;
                    if (mb.y > canvas.height) mibBullets.splice(mbIndex, 1);
                    if (checkCollision(mb, player)) triggerGameOver("You got hit! Try to dodge those green lasers.", () => changeLevel(Level3));
                });

                if (mibs.length === 0) { 
                    phase = 2; 
                    if(document.getElementById("btnAction")) document.getElementById("btnAction").innerText = "CATCH!"; 
                }

                alien.x += alien.speed * alien.direction;
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) alien.direction *= -1;

            } else if (phase === 2) {
                // SLOW FALL: Only 1.2 speed increase
                alien.y += 2; 
                alien.x += 1 * alien.direction;
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) alien.direction *= -1;

                if (checkCollision(player, alien)) {
                    localStorage.setItem("myGame_savedLevel", 4); 
                    triggerVictory("AREA 51 SECURED!<br>Great job, Agent.", Level4); 
                } else if (alien.y > canvas.height) {
                    triggerGameOver("The alien floated away! Move faster to catch it.", () => changeLevel(Level3));
                }
            }
        },

        draw: function(ctx) {
            ctx.fillStyle = player.color; 
            ctx.fillRect(player.x, player.y, player.width, player.height);
            try { if(playerImg.complete) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); } catch(e){}

            ctx.font = "35px Arial";
            ctx.fillText("👽", alien.x, alien.y + 35);

            if (phase === 1) {
                mibs.forEach(mib => {
                    ctx.fillStyle = "black"; ctx.fillRect(mib.x, mib.y, mib.width, mib.height);
                    ctx.font = "30px Arial"; ctx.fillText("🕶️", mib.x + 5, mib.y + 30);
                });
                ctx.fillStyle = "yellow"; bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
                ctx.fillStyle = "lime"; mibBullets.forEach(mb => ctx.fillRect(mb.x, mb.y, mb.width, mb.height));
            } else {
                ctx.fillStyle = "lime"; ctx.font = "24px Arial";
                ctx.fillText("CATCH THE ALIEN!", 90, 580);
            }
        }
    };
})();
