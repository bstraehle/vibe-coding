# DARK HORIZON

A responsive space shooting game built with HTML5 Canvas, CSS3, and vanilla JavaScript.

## 🎮 Game Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Multiple Control Schemes**: 
  - Keyboard: Arrow keys or WASD for movement, SPACE to shoot
  - Mouse: Click to move ship and shoot
  - Touch: Tap to move ship and shoot (mobile-friendly)
- **Dynamic Gameplay**: 
  - Destroy asteroids to earn points
  - Collect stars for bonus points
  - Avoid asteroid collisions
  - Explosion effects when destroying asteroids
- **Score System**: 
  - High score persistence using localStorage
  - Real-time score display
- **Visual Effects**: 
  - Starfield background
  - Engine glow on spaceship
  - Explosion animations
  - Smooth animations

## 🚀 How to Play

1. **Movement**: Use arrow keys, WASD, mouse, or touch to control your spaceship
2. **Shooting**: Press SPACE, click, or tap to shoot lasers
3. **Objective**:
   - Collect stars for 20 points each
   - Destroy asteroids for 10 points each
   - Avoid hitting asteroids with your ship
4. **Game Over**: When you collide with an asteroid, the game ends
5. **Restart**: Click "Launch Mission" or "Play Again" to restart

## 🛠️ Technical Details

- **HTML5 Canvas**: For smooth 2D graphics rendering
- **CSS3**: Responsive design with media queries
- **Vanilla JavaScript**: No external dependencies
- **Local Storage**: High score persistence
- **Touch Events**: Mobile-friendly controls
- **RequestAnimationFrame**: Smooth 60fps animations

## 📱 Responsive Design

The game automatically adapts to different screen sizes:
- **Desktop**: Full keyboard and mouse support
- **Tablet**: Touch controls with keyboard fallback
- **Mobile**: Optimized touch controls and UI scaling

## 🎯 Game Mechanics

- **Collision Detection**: Precise hitbox-based collision system
- **Object Pooling**: Efficient memory management for game objects
- **Smooth Movement**: Interpolated movement for mouse/touch controls
- **Cooldown System**: Prevents rapid-fire shooting
- **Dynamic Spawning**: Random asteroid and star generation

## 🌟 Credits

Inspired by classic space shooting games. Built with modern web technologies for optimal performance and user experience.