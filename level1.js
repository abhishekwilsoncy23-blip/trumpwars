const Level1 = (function() {
    // Private Level 1 Variables
    let player, bullets, enemyBullets, satellites, rocket, moon;
    let phase = 1; // 1 = shooting, 2 = rocket

    return {
        init: function() {
            phase = 1;
            canvas.style.backgroundColor = "#87CEEB"; 
            uiLayer.style.display = "none";
            document.getElementById("btnAction").innerText = "FIRE";
            document.getElementById("btnAction").style.opacity = "1";

            player = { x: 375, y: 500, width: 50, height: 80, speed: 5, color: "blue", cooldown: 0 };
            bullets = []; enemyBullets = []; satellites = [];
            
            for (let i = 0; i < 5; i++) {
                satellites.push({
                    x: 100 + (i * 120), y: 50, width: 60, height: 40, 
                    speed: 2 + Math.random(), direction: 1
                });
            }

            rocket = { 
                x: 50, y: 500, width: 30, height: 60, vx: 0, vy: 0, gravity: 0.2, 
                angle: -Math.PI / 4, power: 0, maxPower: 28, isLaunched: false, wasActionPressed: false
            };
            moon = { x: 700, y: 150, radius: 55 }; 
        },

        update: function() {
            if (phase === 1) {
                if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
                if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

                if (keys["Space"] && player.cooldown <= 0) {
                    bullets.push({ x: player.x + player.width/2 - 5, y: player.y, width: 10, height: 20, speed: 7 });
                    player.cooldown = 20;
                }
                if (player.cooldown > 0) player.cooldown--;

                bullets.forEach((b, index) => { b.y -= b.speed; if (b.y < 0) bullets.splice(index, 1); });

                enemyBullets.forEach((eb, index) => {
                    eb.y += eb.speed;
                    if (eb.y > canvas.height) enemyBullets.splice(index, 1);
                    if (checkCollision(eb, player)) triggerGameOver("Hit by Satellite Debris!", () => changeLevel(Level1));
                });

                satellites.forEach((sat, sIndex) => {
                    sat.x += sat.speed * sat.direction;
                    if (sat.x <= 0 || sat.x + sat.width >= canvas.width) sat.direction *= -1;
                    
                    if (Math.random() < 0.015) {
                        enemyBullets.push({ x: sat.x + sat.width/2 - 5, y: sat.y + sat.height, width: 10, height: 10, speed: 4 });
                    }
                    
                    bullets.forEach((b, bIndex) => {
                        if (checkCollision(b, sat)) {
                            satellites.splice(sIndex, 1); bullets.splice(bIndex, 1);
                        }
                    });
                });

                if (satellites.length === 0) {
                    phase = 2; 
                    canvas.style.backgroundColor = "#000022"; 
                    document.getElementById("btnAction").innerText = "HOLD"; 
                    keys["Space"] = false; keys["ArrowUp"] = false;
                }
            } else if (phase === 2) {
                if (!rocket.isLaunched) {
                    if (keys["ArrowLeft"]) rocket.angle -= 0.05;
                    if (keys["ArrowRight"]) rocket.angle += 0.05;

                    if (rocket.angle < -Math.PI) rocket.angle = -Math.PI; 
                    if (rocket.angle > 0) rocket.angle = 0; 

                    let actionPressed = keys["Space"] || keys["ArrowUp"];
                    if (actionPressed) {
                        rocket.power += 0.4;
                        if (rocket.power > rocket.maxPower) rocket.power = rocket.maxPower;
                    } else if (rocket.wasActionPressed && !actionPressed) {
                        rocket.isLaunched = true;
                        rocket.vx = Math.cos(rocket.angle) * rocket.power;
                        rocket.vy = Math.sin(rocket.angle) * rocket.power;
                        document.getElementById("btnAction").style.opacity = "0.5"; 
                    }
                    rocket.wasActionPressed = actionPressed;
                } else {
                    rocket.vy += rocket.gravity;
                    rocket.x += rocket.vx;
                    rocket.y += rocket.vy;
                    rocket.angle = Math.atan2(rocket.vy, rocket.vx);

                    if (rocket.x > canvas.width || rocket.y > canvas.height || rocket.x < 0) {
                        triggerGameOver("Missed the Moon! Try adjusting angle and power.", () => changeLevel(Level1));
                    }

                    let dist = Math.hypot((rocket.x + rocket.width/2) - moon.x, (rocket.y + rocket.height/2) - moon.y);
                    if (dist < moon.radius + rocket.height/2) {
                        triggerVictory("LEVEL 1 COMPLETE!", Level2); // Pass Level 2 object!
                    }
                }
            }
        },

        draw: function(ctx) {
            if (phase === 1) {
                ctx.fillStyle = player.color; ctx.fillRect(player.x, player.y, player.width, player.height);
                try { if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); } catch(e){}

                ctx.fillStyle = "yellow"; bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
                ctx.fillStyle = "red"; enemyBullets.forEach(eb => ctx.fillRect(eb.x, eb.y, eb.width, eb.height));
                
                satellites.forEach(sat => {
                    if (satImg.complete && satImg.naturalHeight !== 0) {
                        ctx.drawImage(satImg, sat.x, sat.y, sat.width, sat.height);
                    } else {
                        ctx.font = "40px Arial"; ctx.fillText("🛰️", sat.x, sat.y + 35);
                    }
                });
            } else if (phase === 2) {
                ctx.font = "110px Arial";
                ctx.fillText("🌕", moon.x - 55, moon.y + 40);

                ctx.save();
                ctx.translate(rocket.x + rocket.width/2, rocket.y + rocket.height/2);
                ctx.rotate(rocket.angle + Math.PI/2); 
                ctx.fillStyle = "white";
                ctx.fillRect(-rocket.width/2, -rocket.height/2, rocket.width, rocket.height);
                
                if (rocket.isLaunched) {
                    ctx.fillStyle = "orange";
                    ctx.beginPath();
                    ctx.moveTo(-rocket.width/2, rocket.height/2);
                    ctx.lineTo(rocket.width/2, rocket.height/2);
                    ctx.lineTo(0, rocket.height/2 + 25 + Math.random() * 10);
                    ctx.fill();
                }
                ctx.restore();

                if (!rocket.isLaunched) {
                    ctx.beginPath();
                    ctx.setLineDash([5, 10]);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.lineWidth = 2;
                    ctx.moveTo(rocket.x + rocket.width/2, rocket.y + rocket.height/2);
                    ctx.lineTo(rocket.x + rocket.width/2 + Math.cos(rocket.angle) * 150, 
                               rocket.y + rocket.height/2 + Math.sin(rocket.angle) * 150);
                    ctx.stroke();
                    ctx.setLineDash([]); 

                    ctx.fillStyle = "white"; ctx.font = "20px Arial"; ctx.fillText("POWER", 20, 40);
                    ctx.strokeStyle = "white"; ctx.strokeRect(20, 50, 200, 25);
                    ctx.fillStyle = "red"; ctx.fillRect(20, 50, (rocket.power / rocket.maxPower) * 200, 25);

                    ctx.fillStyle = "rgba(255,255,255,0.7)";
                    ctx.font = "18px Arial";
                    ctx.fillText("Tap Left/Right to aim. HOLD Fire to charge power. RELEASE to launch!", 100, 580);
                }
            }
        }
    };
})();
