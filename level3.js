const Level3 = (function() {
    // Private Level 3 Variables
    let player, bullets, mibs, mibBullets, alien;
    let mibDirection = 1;
    let mibSpeed = 1.5;
    let phase = 1; // Phase 1 = Shoot MiBs, Phase 2 = Catch Alien

    return {
        init: function() {
            uiLayer.style.display = "none"; 
            canvas.style.backgroundColor = "#c0392b"; // Red desert night at Area 51
            document.getElementById("btnAction").innerText = "FIRE";
            document.getElementById("btnAction").style.opacity = "1";
            keys["Space"] = false; keys["ArrowUp"] = false;

            player = { x: 375, y: 500, width: 50, height: 80, speed: 6, cooldown: 0, color: "blue" };
            bullets = [];
            mibBullets = [];
            mibs = [];
            phase = 1;

            // Spawn the Alien at the top
            alien = { x: 375, y: 20, width: 40, height: 40, speed: 3, direction: 1 };

            // Spawn a grid of Men in Black
            let rows = 3;
            let cols = 8;
            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    mibs.push({ 
                        x: 100 + (c * 70), 
                        y: 80 + (r * 50), 
                        width: 40, 
                        height: 40 
                    });
                }
            }
        },

        update: function() {
            // Player Movement
            if (keys["ArrowLeft"] && player.x > 0) { player.x -= player.speed; }
            if (keys["ArrowRight"] && player.x + player.width < canvas.width) { player.x += player.speed; }

            if (phase === 1) {
                // Phase 1: Shooting Mechanics
                if (keys["Space"] && player.cooldown <= 0) {
                    bullets.push({ 
                        x: player.x + player.width/2 - 5, 
                        y: player.y, 
                        width: 10, height: 20, speed: 8 
                    });
                    player.cooldown = 15; // Shoot delay
                }
                if (player.cooldown > 0) player.cooldown--;

                // Move Player Bullets
                bullets.forEach((b, bIndex) => {
                    b.y -= b.speed;
                    if (b.y < 0) bullets.splice(bIndex, 1);
                    
                    // Did we accidentally shoot the Alien?
                    if (checkCollision(b, alien)) {
                        triggerGameOver("You shot the Alien! Mission Failed.", () => changeLevel(Level3));
                    }
                });

                // Move Men in Black (Space Invaders style)
                let hitEdge = false;
                mibs.forEach(mib => {
                    mib.x += mibSpeed * mibDirection;
                    if (mib.x <= 10 || mib.x + mib.width >= canvas.width - 10) {
                        hitEdge = true;
                    }
                    
                    // Randomly shoot at player
                    if (Math.random() < 0.005) {
                        mibBullets.push({ x: mib.x + mib.width/2 - 5, y: mib.y + mib.height, width: 8, height: 15, speed: 5 });
                    }
                });

                if (hitEdge) {
                    mibDirection *= -1;
                    mibs.forEach(mib => mib.y += 20); // Move down when hitting the edge
                }

                // Check Bullet Collisions against MiBs
                bullets.forEach((b, bIndex) => {
                    mibs.forEach((mib, mIndex) => {
                        if (checkCollision(b, mib)) {
                            bullets.splice(bIndex, 1);
                            mibs.splice(mIndex, 1);
                        }
                    });
                });

                // Move MiB Bullets & check hitting player
                mibBullets.forEach((mb, mbIndex) => {
                    mb.y += mb.speed;
                    if (mb.y > canvas.height) mibBullets.splice(mbIndex, 1);
                    if (checkCollision(mb, player)) {
                        triggerGameOver("Neutralized by the Men in Black!", () => changeLevel(Level3));
                    }
                });

                // Check if MiBs reach the player
                mibs.forEach(mib => {
                    if (mib.y + mib.height >= player.y) {
                        triggerGameOver("The Men in Black got you!", () => changeLevel(Level3));
                    }
                });

                // Check if Phase 1 is done
                if (mibs.length === 0) {
                    phase = 2; // Transition to Catch phase!
                    document.getElementById("btnAction").innerText = "CATCH!";
                }

            } else if (phase === 2) {
                // Phase 2: Catch the dropping Alien!
                alien.y += alien.speed + 2; // Alien falls fast!
                
                // Keep moving side to side slightly while falling
                alien.x += alien.speed * alien.direction;
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) alien.direction *= -1;

                if (checkCollision(player, alien)) {
                    // VICTORY!
                    triggerVictory("AREA 51 RAID SUCCESS!<br>Alien Secured.", null); // Change null to Level4 later
                } else if (alien.y > canvas.height) {
                    triggerGameOver("Oh no! The Alien escaped into the desert!", () => changeLevel(Level3));
                }
            }

            // Keep Alien pacing back and forth in Phase 1
            if (phase === 1) {
                alien.x += alien.speed * alien.direction;
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
                    alien.direction *= -1;
                }
            }
        },

        draw: function(ctx) {
            // Draw Player
            ctx.fillStyle = player.color; 
            ctx.fillRect(player.x, player.y, player.width, player.height);
            try { 
                if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); 
            } catch(e){}

            // Draw Alien
            ctx.font = "40px Arial";
            ctx.fillText("👽", alien.x, alien.y + 35);

            if (phase === 1) {
                // Draw MiBs
                mibs.forEach(mib => {
                    ctx.fillStyle = "black";
                    ctx.fillRect(mib.x, mib.y, mib.width, mib.height);
                    ctx.font = "30px Arial";
                    ctx.fillText("🕶️", mib.x + 5, mib.y + 30);
                });

                // Draw Bullets
                ctx.fillStyle = "yellow"; 
                bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
                
                ctx.fillStyle = "lime"; // MiB lasers are green
                mibBullets.forEach(mb => ctx.fillRect(mb.x, mb.y, mb.width, mb.height));
                
                // Instructions
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.font = "18px Arial";
                ctx.fillText("Shoot the Men in Black! DON'T shoot the Alien!", 200, 580);
            } else {
                // Phase 2 Instructions
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.font = "24px Arial";
                ctx.fillStyle = "lime";
                ctx.fillText("CATCH THE ALIEN!", 280, 580);
            }
        }
    };
})();
