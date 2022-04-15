const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const startGameBtn = document.getElementById("startGameBtn");
const model = document.querySelector(".model");
const scoreEl = document.querySelector("#scoreEl");
const modelScoreEl = document.querySelector("h1");

/**
 * Begin Global Variables
 *
 */
let score = 0;
let projectiles = [];
let enemies = [];
let particles = [];
let animationID;

/**
 * End Global Variables
 * Brgin Classes
 */

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

/**
 * End Classes
 * Begin Main Functions
 *
 */
const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 15, "white");

function animate() {
  animationID = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationID);
      modelScoreEl.innerText = score;
      model.style.display = "flex";
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      //   projectile touch the Enemy
      if (distance - projectile.radius - enemy.radius < 1) {
        // Explosion
        for (let i = 0; i < enemy.radius; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }

        score += 50;
        scoreEl.innerText = score;

        // Shrink
        if (enemy.radius - 10 > 5) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
        // Remove Enemy
        else {
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

function spawnEnemy() {
  setInterval(() => {
    const radius = Math.random() * 26 + 4;
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function init() {
  score = 0;
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerText = score;
  modelScoreEl.innerText = score;
}

/**
 * End Main Functions
 *
 */
const device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera/i.test(navigator.userAgent) ? "mobile" : "desktop";


if(device === "desktop") {

  addEventListener("click", (e) => {
    const vx = e.clientX - canvas.width / 2;
    const vy = e.clientY - canvas.height / 2;
    const angle = Math.atan2(vy, vx);
  
    const projectile = new Projectile(x, y, 5, "white", {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4,
    });
    projectiles.push(projectile);
  });
}else {
  addEventListener("touchstart", (e) => {
    const vx = e.clientX - canvas.width / 2;
    const vy = e.clientY - canvas.height / 2;
    const angle = Math.atan2(vy, vx);
  
    const projectile = new Projectile(x, y, 5, "white", {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4,
    });
    projectiles.push(projectile);
  });
}


startGameBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemy();
  model.style.display = "none";
});

