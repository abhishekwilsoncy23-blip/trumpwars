const Level3 = (function() {
    let player, bullets, mibs, mibBullets, alien;
    let mibDirection = 1; 
    let mibSpeed = 1.2; // Slightly slower horizontal movement
    let phase = 1; 

    return {
        init: function() {
            canvas.style.backgroundColor = "#c0392b"; 
            document.getElementById("btnAction").innerText = "FIRE";
            
            // Sync with your new window.keys system
            window.keys["Space"] = false; 
            window.keys["ArrowLeft"] = false; 
            window.keys["ArrowRight"] = false;

            player = { x: 175, y: 500, width: 50, height: 80, speed: 6, cooldown: 0, color: "blue" };
            bullets = []; mibBullets = []; mibs = []; phase = 1;
            alien = { x: 175, y: 20, width: 40, height: 40, speed: 3, direction: 1 };

            for(let r = 0; r < 3; r++) {
                for(let c = 0; c < 5; c++) {
                    mibs.push({ x: 50 + (c * 60), y: 80 + (r * 50), width: 40, height: 40 });
                }
            }
        },

        update: function() {
            // Updated to use window.keys
            if (window.keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
            if (window.keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

            if (phase === 1) {
                if (window.keys["Space"] && player.cooldown <= 0) {
                    bullets.push({ x: player.x + player.width/2 - 5, y: player.y, width: 10, height: 20, speed: 8 });
                    player.cooldown = 15; 
                }
                if (player.cooldown > 0) player.cooldown--;

                bullets.forEach((b, bIndex) => {
                    b.y -= b.speed;
                    if (b.y < 0) bullets.splice(bIndex, 1);
                    if (checkCollision(b, alien)) triggerGameOver("You shot the Alien! Mission Failed.", () => changeLevel(Level3));
                });

                let hitEdge = false;
                mibs.forEach(mib => {
                    mib.x += mibSpeed * mibDirection;
                    if (mib.x <= 10 || mib.x + mib.width >= canvas.width - 10) hitEdge = true;
                    
                    // NERF: Reduced shooting chance from 0.01 to 0.004 (much slower fire rate)
                    if (Math.random() < 0.004) {
                        mibBullets.push({ 
                            x: mib.x + mib.width/2 - 4, 
                            y: mib.y + mib.height, 
                            width: 8, 
                            height: 15, 
                            speed: 3.5 // NERF: Slower bullet speed (was 5)
                        });
                    }
                });

                if (hitEdge) {
                    mibDirection *= -1;
                    mibs.forEach(mib => mib.y += 10); // NERF: Slower descent (was 20)
                }

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
                    if (checkCollision(mb, player)) triggerGameOver("Neutralized by the Men in Black!", () => changeLevel(Level3));
                });

                mibs.forEach(mib => { 
                    if (mib.y + mib.height >= player.y) triggerGameOver("The Men in Black caught you!", () => changeLevel(Level3)); 
                });

                if (mibs.length === 0) { 
                    phase = 2; 
                    let actionBtn = document.getElementById("btnAction");
                    if(actionBtn) actionBtn.innerText = "CATCH!"; 
                }

                alien.x += alien.speed * alien.direction;
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) alien.direction *= -1;

            } else if (phase === 2) {
                alien.y += alien.speed + 1.5; // Slightly slower alien fall
                alien.x += alien.speed * alien.direction;
                if (alien.x <= 0 || alien.x + alien.width >= canvas.width) alien.direction *= -1;

                if (checkCollision(player, alien)) {
                    localStorage.setItem("myGame_savedLevel", 4); // SAVE PROGRESS TO LEVEL 4
                    triggerVictory("AREA 51 RAID SUCCESS!<br>Alien Secured.", Level4); 
                } else if (alien.y > canvas.height) {
                    triggerGameOver("Oh no! The Alien escaped into the desert!", () => changeLevel(Level3));
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
                
                ctx.fillStyle = "white"; ctx.font = "16px Arial";
                ctx.fillText("Clear the MiBs! Watch for the alien overhead!", 50, 580);
            } else {
                ctx.fillStyle = "lime"; ctx.font = "24px Arial";
                ctx.fillText("CATCH THE ALIEN!", 90, 580);
            }
        }
    };
})();
