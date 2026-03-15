const Level1 = (function() {
    let player, bullets, targets;

    return {
        init: function() {
            canvas.style.backgroundColor = "#2c3e50";
            keys["Space"] = false; keys["ArrowLeft"] = false; keys["ArrowRight"] = false;
            
            player = { x: 175, y: 500, width: 50, height: 80, speed: 5, cooldown: 0 };
            bullets = [];
            targets = [
                {x: 50, y: 50, width: 40, height: 40, active: true},
                {x: 150, y: 100, width: 40, height: 40, active: true},
                {x: 250, y: 50, width: 40, height: 40, active: true},
                {x: 350, y: 100, width: 40, height: 40, active: true}
            ];
        },

        update: function() {
            if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
            if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

            if (keys["Space"] && player.cooldown <= 0) {
                bullets.push({ x: player.x + player.width/2 - 5, y: player.y, width: 10, height: 20, speed: 8 });
                player.cooldown = 15;
            }
            if (player.cooldown > 0) player.cooldown--;

            let activeTargets = 0;

            bullets.forEach((b, bIndex) => {
                b.y -= b.speed;
                if (b.y < 0) bullets.splice(bIndex, 1);

                targets.forEach(t => {
                    if (t.active && checkCollision(b, t)) {
                        t.active = false;
                        bullets.splice(bIndex, 1);
                    }
                });
            });

            targets.forEach(t => { if (t.active) activeTargets++; });

            if (activeTargets === 0) {
                localStorage.setItem("myGame_savedLevel", 2); // Save progress!
                triggerVictory("TARGET PRACTICE COMPLETE!", Level2);
            }
        },

        draw: function(ctx) {
            ctx.fillStyle = "blue";
            ctx.fillRect(player.x, player.y, player.width, player.height);
            try { if(playerImg.complete && playerImg.naturalHeight !== 0) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); } catch(e){}

            ctx.fillStyle = "yellow";
            bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

            ctx.fillStyle = "orange";
            targets.forEach(t => {
                if (t.active) ctx.fillRect(t.x, t.y, t.width, t.height);
            });

            ctx.fillStyle = "white"; ctx.font = "16px Arial";
            ctx.fillText("Move Left/Right and Shoot the targets!", 60, 580);
        }
    };
})();
