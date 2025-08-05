// Game variables
let gameRunning = false;
let score = 0;
let highScore = 0;
let gameStartTime = 0;
let spaceshipElement;
let gameContainer;
let highScoreElement;
let asteroidInterval;
let starInterval;
let gameLoopInterval;
let engineParticlesInterval;
let playerName = "Player";
let gameHistory = [];
let maxGameHistorySize = 10;
let isMobile = false;

// Spaceship properties
const spaceship = {
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    speed: 8,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    engineParticles: []
};

// Arrays to track game objects
const asteroids = [];
const stars = [];
const bullets = [];

// Initialize the game
document.addEventListener('DOMContentLoaded', init);

function init() {
    spaceshipElement = document.getElementById('spaceship');
    gameContainer = document.querySelector('.game-container');
    highScoreElement = document.getElementById('high-score').querySelector('span');
    
    // Detect mobile device
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0);
    
    // Adjust spaceship size for mobile
    if (isMobile) {
        const mobileSize = window.innerWidth <= 480 ? 40 : 50;
        spaceship.width = mobileSize;
        spaceship.height = mobileSize;
        spaceshipElement.style.width = `${mobileSize}px`;
        spaceshipElement.style.height = `${mobileSize}px`;
    }
    
    // Load high score from local storage if available
    const savedHighScore = localStorage.getItem('spaceVoyagerHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreElement.textContent = highScore;
    }
    
    // Load other data from localStorage
    const savedName = localStorage.getItem('spaceVoyagerPlayerName');
    if (savedName) {
        playerName = savedName;
    }
    
    const savedGameHistory = localStorage.getItem('spaceVoyagerGameHistory');
    if (savedGameHistory) {
        gameHistory = JSON.parse(savedGameHistory);
    }
    
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', startGame);
    startButton.focus(); // Focus the button on load
    
    // Set initial spaceship position
    resetSpaceshipPosition();
    renderSpaceship();
    
    // Set up event listeners for keys
    setupControls();
    
    // Add floating animation to the spaceship when idle
    animateIdleSpaceship();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    // Update spaceship size if needed
    if (isMobile) {
        const mobileSize = window.innerWidth <= 480 ? 40 : 50;
        if (spaceship.width !== mobileSize) {
            spaceship.width = mobileSize;
            spaceship.height = mobileSize;
            spaceshipElement.style.width = `${mobileSize}px`;
            spaceshipElement.style.height = `${mobileSize}px`;
        }
    }
    
    // Reset spaceship position if game is not running
    if (!gameRunning) {
        resetSpaceshipPosition();
        renderSpaceship();
    }
}

function animateIdleSpaceship() {
    if (!gameRunning) {
        const time = Date.now() / 1000;
        spaceshipElement.style.transform = `translateY(${Math.sin(time) * 5}px)`;
    }
    requestAnimationFrame(animateIdleSpaceship);
}

function resetSpaceshipPosition() {
    spaceship.x = (gameContainer.clientWidth - spaceship.width) / 2;
    spaceship.y = gameContainer.clientHeight - spaceship.height - 20;
}

function setupControls() {
    // Keyboard controls - keydown
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                spaceship.moveUp = true;
                break;
            case 'ArrowDown':
            case 's':
                spaceship.moveDown = true;
                break;
            case 'ArrowLeft':
            case 'a':
                spaceship.moveLeft = true;
                break;
            case 'ArrowRight':
            case 'd':
                spaceship.moveRight = true;
                break;
            case ' ': // Space key
                createBullet();
                break;
        }
    });

    // Mouse controls
    gameContainer.addEventListener('mousemove', (e) => {
        if (!gameRunning || isMobile) return;

        const rect = gameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Update spaceship position to follow the mouse
        spaceship.x = Math.max(0, Math.min(mouseX - spaceship.width / 2, gameContainer.clientWidth - spaceship.width));
        spaceship.y = Math.max(0, Math.min(mouseY - spaceship.height / 2, gameContainer.clientHeight - spaceship.height));
        renderSpaceship();
    });

    gameContainer.addEventListener('click', () => {
        if (!gameRunning) return;
        createBullet();
    });
    
    // Touch controls for mobile
    if (isMobile) {
        let touchStartX = 0;
        let touchStartY = 0;
        let lastTouchTime = 0;
        
        gameContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameRunning) return;
            
            const touch = e.touches[0];
            const rect = gameContainer.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Move spaceship to touch position
            spaceship.x = Math.max(0, Math.min(touchX - spaceship.width / 2, gameContainer.clientWidth - spaceship.width));
            spaceship.y = Math.max(0, Math.min(touchY - spaceship.height / 2, gameContainer.clientHeight - spaceship.height));
            renderSpaceship();
            
            touchStartX = touchX;
            touchStartY = touchY;
            lastTouchTime = Date.now();
        });
        
        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!gameRunning) return;
            
            const touch = e.touches[0];
            const rect = gameContainer.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Update spaceship position
            spaceship.x = Math.max(0, Math.min(touchX - spaceship.width / 2, gameContainer.clientWidth - spaceship.width));
            spaceship.y = Math.max(0, Math.min(touchY - spaceship.height / 2, gameContainer.clientHeight - spaceship.height));
            renderSpaceship();
        });
        
        gameContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!gameRunning) return;
            
            const currentTime = Date.now();
            const touchDuration = currentTime - lastTouchTime;
            
            // Shoot if it was a quick tap (less than 200ms)
            if (touchDuration < 200) {
                createBullet();
            }
        });
    }
    
    // Keyboard controls - keyup
    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                spaceship.moveUp = false;
                break;
            case 'ArrowDown':
            case 's':
                spaceship.moveDown = false;
                break;
            case 'ArrowLeft':
            case 'a':
                spaceship.moveLeft = false;
                break;
            case 'ArrowRight':
            case 'd':
                spaceship.moveRight = false;
                break;
        }
    });
}

function startGame() {
    if (gameRunning) return;
    
    // Reset game state
    gameRunning = true;
    score = 0;
    gameStartTime = Date.now();  // Track when the game started
    updateScoreDisplay();
    document.getElementById('game-over').style.display = 'none';
    
    // Clear any existing game objects
    clearGameObjects();
    resetSpaceshipPosition();
    
    // Start game loops
    asteroidInterval = setInterval(createAsteroid, 1000);
    starInterval = setInterval(createStar, 2000);
    gameLoopInterval = setInterval(gameLoop, 20);
    
    // Start engine particles effect
    engineParticlesInterval = setInterval(createEngineParticle, 100);
    
    // Add transition for button
    document.getElementById('start-btn').textContent = 'Mission Active';
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Update spaceship position based on controls
    moveSpaceship();
    
    // Move asteroids and stars and particles
    moveGameObjects();
    
    // Check for collisions
    checkCollisions();
    
    // Render game objects
    renderSpaceship();
}

function moveSpaceship() {
    // Store previous position for movement effect
    const prevX = spaceship.x;
    
    // Move the spaceship based on active controls
    if (spaceship.moveUp) {
        spaceship.y = Math.max(0, spaceship.y - spaceship.speed);
    }
    if (spaceship.moveDown) {
        spaceship.y = Math.min(gameContainer.clientHeight - spaceship.height, spaceship.y + spaceship.speed);
    }
    if (spaceship.moveLeft) {
        spaceship.x = Math.max(0, spaceship.x - spaceship.speed);
        // Tilt ship left when moving left
        spaceshipElement.style.transform = 'rotate(-15deg)';
    } else if (spaceship.moveRight) {
        spaceship.x = Math.min(gameContainer.clientWidth - spaceship.width, spaceship.x + spaceship.speed);
        // Tilt ship right when moving right
        spaceshipElement.style.transform = 'rotate(15deg)';
    } else {
        // Reset tilt when not moving horizontally
        spaceshipElement.style.transform = 'rotate(0deg)';
    }
}

function renderSpaceship() {
    spaceshipElement.style.left = `${spaceship.x}px`;
    spaceshipElement.style.top = `${spaceship.y}px`;
}

function createEngineParticle() {
    if (!gameRunning) return;
    
    const particle = document.createElement('div');
    particle.className = 'engine-particle';
    
    // Randomize particle size
    const size = Math.floor(Math.random() * 6) + 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Position at bottom center of spaceship
    const x = spaceship.x + spaceship.width / 2 - size / 2;
    const y = spaceship.y + spaceship.height - 5;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // Add random horizontal movement
    const speedX = (Math.random() - 0.5) * 2;
    const speedY = Math.random() * 2 + 2;
    
    // Store particle properties
    particle.dataset.x = x;
    particle.dataset.y = y;
    particle.dataset.speedX = speedX;
    particle.dataset.speedY = speedY;
    particle.dataset.age = 0;
    
    gameContainer.appendChild(particle);
    spaceship.engineParticles.push(particle);
}

function createAsteroid() {
    if (!gameRunning) return;
    
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    
    // Random size between 30 and 80
    const size = Math.floor(Math.random() * 50) + 30;
    asteroid.style.width = `${size}px`;
    asteroid.style.height = `${size}px`;
    
    // Random horizontal position
    const x = Math.floor(Math.random() * (gameContainer.clientWidth - size));
    
    // Start from top (outside the visible area)
    const y = -size;
    
    // Random speed between 2 and 6
    const speed = Math.floor(Math.random() * 4) + 2;
    
    // Random rotation
    const rotation = Math.floor(Math.random() * 360);
    asteroid.style.transform = `rotate(${rotation}deg)`;
    
    asteroid.style.left = `${x}px`;
    asteroid.style.top = `${y}px`;
    
    // Store asteroid properties for movement
    asteroid.dataset.x = x;
    asteroid.dataset.y = y;
    asteroid.dataset.size = size;
    asteroid.dataset.speed = speed;
    asteroid.dataset.rotation = rotation;
    asteroid.dataset.rotationSpeed = Math.random() * 2 - 1;
    
    gameContainer.appendChild(asteroid);
    asteroids.push(asteroid);
}

function createStar() {
    if (!gameRunning) return;
    
    const star = document.createElement('div');
    star.className = 'star';
    
    // Star size
    const size = 30;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Random horizontal position
    const x = Math.floor(Math.random() * (gameContainer.clientWidth - size));
    
    // Start from top (outside the visible area)
    const y = -size;
    
    // Star speed (slightly slower than asteroids)
    const speed = Math.floor(Math.random() * 2) + 2;
    
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    
    // Store star properties for movement
    star.dataset.x = x;
    star.dataset.y = y;
    star.dataset.size = size;
    star.dataset.speed = speed;
    
    // Add pulse animation
    star.style.animation = 'rotate 10s linear infinite, pulse 1.5s infinite alternate';
    
    gameContainer.appendChild(star);
    stars.push(star);
}

function moveGameObjects() {
    // Move asteroids with rotation
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        let y = parseFloat(asteroid.dataset.y);
        let x = parseFloat(asteroid.dataset.x);
        const speed = parseFloat(asteroid.dataset.speed);
        let rotation = parseFloat(asteroid.dataset.rotation);
        const rotationSpeed = parseFloat(asteroid.dataset.rotationSpeed);
        
        y += speed;
        rotation += rotationSpeed;
        
        asteroid.dataset.y = y;
        asteroid.dataset.rotation = rotation;
        asteroid.style.top = `${y}px`;
        asteroid.style.transform = `rotate(${rotation}deg)`;
        
        // Remove asteroids that go off-screen
        if (y > gameContainer.clientHeight) {
            gameContainer.removeChild(asteroid);
            asteroids.splice(i, 1);
        }
    }
    
    // Move stars with slight wobble
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        let y = parseFloat(star.dataset.y);
        let x = parseFloat(star.dataset.x);
        const speed = parseFloat(star.dataset.speed);
        
        y += speed;
        // Add slight horizontal wobble
        x += Math.sin(Date.now() / 500 + i) * 0.5;
        
        star.dataset.y = y;
        star.dataset.x = x;
        star.style.top = `${y}px`;
        star.style.left = `${x}px`;
        
        // Remove stars that go off-screen
        if (y > gameContainer.clientHeight) {
            gameContainer.removeChild(star);
            stars.splice(i, 1);
        }
    }
    
    // Move engine particles
    for (let i = spaceship.engineParticles.length - 1; i >= 0; i--) {
        const particle = spaceship.engineParticles[i];
        let x = parseFloat(particle.dataset.x);
        let y = parseFloat(particle.dataset.y);
        const speedX = parseFloat(particle.dataset.speedX);
        const speedY = parseFloat(particle.dataset.speedY);
        let age = parseFloat(particle.dataset.age);
        
        // Update position
        x += speedX;
        y += speedY;
        age += 0.1;
        
        // Update opacity based on age
        const opacity = 1 - age;
        
        particle.dataset.x = x;
        particle.dataset.y = y;
        particle.dataset.age = age;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.opacity = opacity;
        
        // Remove old particles
        if (age >= 1) {
            gameContainer.removeChild(particle);
            spaceship.engineParticles.splice(i, 1);
        }
    }
    
    // Move bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let y = parseFloat(bullet.dataset.y);
        const speed = parseFloat(bullet.dataset.speed);
        
        // Bullets move upward
        y -= speed;
        
        bullet.dataset.y = y;
        bullet.style.top = `${y}px`;
        
        // Remove bullets that go off-screen
        if (y < -20) {
            gameContainer.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Get spaceship boundaries
    const spaceshipRect = {
        left: spaceship.x + 10,  // Add some padding for better collision detection
        top: spaceship.y + 10,
        right: spaceship.x + spaceship.width - 10,
        bottom: spaceship.y + spaceship.height - 10
    };
    
    // Check for asteroid collisions with spaceship
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        const size = parseFloat(asteroid.dataset.size);
        const asteroidRect = {
            left: parseFloat(asteroid.dataset.x) + 5,
            top: parseFloat(asteroid.dataset.y) + 5,
            right: parseFloat(asteroid.dataset.x) + size - 5,
            bottom: parseFloat(asteroid.dataset.y) + size - 5
        };
        
        // Check if the spaceship collided with an asteroid
        if (checkRectCollision(spaceshipRect, asteroidRect)) {
            createExplosion(spaceship.x, spaceship.y);
            gameOver();
            return;
        }
        
        // Check if any bullets hit this asteroid
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const bulletSize = parseFloat(bullet.dataset.size);
            const bulletRect = {
                left: parseFloat(bullet.dataset.x),
                top: parseFloat(bullet.dataset.y),
                right: parseFloat(bullet.dataset.x) + bulletSize,
                bottom: parseFloat(bullet.dataset.y) + bulletSize
            };
            
            if (checkRectCollision(bulletRect, asteroidRect)) {
                // Bullet hit asteroid - destroy both
                createExplosion(asteroidRect.left + size/2, asteroidRect.top + size/2);
                
                // Remove the asteroid and bullet
                gameContainer.removeChild(asteroid);
                asteroids.splice(i, 1);
                
                gameContainer.removeChild(bullet);
                bullets.splice(j, 1);
                
                // Increase score (more points for shooting asteroids than collecting stars)
                score += 20;
                updateScoreDisplay();
                
                // Break since this asteroid is now destroyed
                break;
            }
        }
    }
    
    // Check for star collisions (collecting stars)
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        const size = parseFloat(star.dataset.size);
        const starRect = {
            left: parseFloat(star.dataset.x),
            top: parseFloat(star.dataset.y),
            right: parseFloat(star.dataset.x) + size,
            bottom: parseFloat(star.dataset.y) + size
        };
        
        if (checkRectCollision(spaceshipRect, starRect)) {
            // Collect star with a sparkle effect
            createSparkle(starRect.left + size/2, starRect.top + size/2);
            gameContainer.removeChild(star);
            stars.splice(i, 1);
            
            // Increase score
            score += 10;
            updateScoreDisplay();
            
            // Play collection sound (if we had audio)
            // playSound('collect');
        }
    }
}

function checkRectCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    
    gameContainer.appendChild(explosion);
    
    // Remove explosion after animation
    setTimeout(() => {
        if (explosion.parentNode === gameContainer) {
            gameContainer.removeChild(explosion);
        }
    }, 500);
}

function createSparkle(x, y) {
    // Create sparkle effect when collecting stars
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random size
        const size = Math.floor(Math.random() * 6) + 2;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // Position at star center
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        
        // Random direction
        const angle = (i / 8) * Math.PI * 2;
        const speed = 3 + Math.random() * 2;
        const speedX = Math.cos(angle) * speed;
        const speedY = Math.sin(angle) * speed;
        
        // Store sparkle properties
        sparkle.dataset.x = x;
        sparkle.dataset.y = y;
        sparkle.dataset.speedX = speedX;
        sparkle.dataset.speedY = speedY;
        sparkle.dataset.age = 0;
        
        gameContainer.appendChild(sparkle);
        
        // Animate and remove sparkle
        animateSparkle(sparkle);
    }
}

function animateSparkle(sparkle) {
    let x = parseFloat(sparkle.dataset.x);
    let y = parseFloat(sparkle.dataset.y);
    const speedX = parseFloat(sparkle.dataset.speedX);
    const speedY = parseFloat(sparkle.dataset.speedY);
    let age = parseFloat(sparkle.dataset.age);
    
    // Animation loop
    const animate = () => {
        x += speedX;
        y += speedY;
        age += 0.05;
        
        sparkle.dataset.x = x;
        sparkle.dataset.y = y;
        sparkle.dataset.age = age;
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkle.style.opacity = 1 - age;
        
        if (age < 1) {
            requestAnimationFrame(animate);
        } else {
            gameContainer.removeChild(sparkle);
        }
    };
    
    requestAnimationFrame(animate);
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

function gameOver() {
    gameRunning = false;
    
    // Show game over message
    document.getElementById('game-over').style.display = 'block';
    
    // Add game to history
    const gameData = {
        date: new Date().toISOString(),
        score: score,
        duration: Math.floor((Date.now() - gameStartTime) / 1000) // in seconds
    };
    
    // Add to beginning of array
    gameHistory.unshift(gameData);
    
    // Keep only the latest N games
    if (gameHistory.length > maxGameHistorySize) {
        gameHistory = gameHistory.slice(0, maxGameHistorySize);
    }
    
    // Save to localStorage
    localStorage.setItem('spaceVoyagerGameHistory', JSON.stringify(gameHistory));
    
    // Check for high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('spaceVoyagerHighScore', highScore);
    }
    
    // Clear intervals
    clearInterval(asteroidInterval);
    clearInterval(starInterval);
    clearInterval(gameLoopInterval);
    clearInterval(engineParticlesInterval);
    
    // Reset start button
    document.getElementById('start-btn').textContent = 'Launch New Mission';
}

function clearGameObjects() {
    // Remove all asteroids
    for (const asteroid of asteroids) {
        gameContainer.removeChild(asteroid);
    }
    asteroids.length = 0;
    
    // Remove all stars
    for (const star of stars) {
        gameContainer.removeChild(star);
    }
    stars.length = 0;
}

// Function to create a bullet when spacebar is pressed
function createBullet() {
    // Don't allow too many bullets at once (optional rate limiting)
    if (bullets.length >= 5) return;
    
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    
    // Bullet size
    const size = 8;
    bullet.style.width = `${size}px`;
    bullet.style.height = `${size}px`;
    
    // Position bullet at the top-center of the spaceship
    const x = spaceship.x + (spaceship.width / 2) - (size / 2);
    const y = spaceship.y - size;
    
    bullet.style.left = `${x}px`;
    bullet.style.top = `${y}px`;
    
    // Bullet speed (faster than asteroids)
    const speed = 10;
    
    // Store bullet properties for movement
    bullet.dataset.x = x;
    bullet.dataset.y = y;
    bullet.dataset.size = size;
    bullet.dataset.speed = speed;
    
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
}

// Helper function to get all game data
function getAllGameData() {
    return {
        playerName: playerName,
        highScore: highScore,
        gameHistory: gameHistory
    };
}

// Helper function to set player name
function setPlayerName(name) {
    playerName = name;
    localStorage.setItem('spaceVoyagerPlayerName', playerName);
}