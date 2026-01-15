const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gameLoop = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

document.getElementById('highScore').textContent = highScore;

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  switch (key) {
    case 'arrowup':
    case 'w':
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      e.preventDefault();
      break;
    case 'arrowdown':
    case 's':
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      e.preventDefault();
      break;
    case 'arrowleft':
    case 'a':
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      e.preventDefault();
      break;
    case 'arrowright':
    case 'd':
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      e.preventDefault();
      break;
    case ' ':
      e.preventDefault();
      togglePauseFromKeyboard();
      break;
  }
});

function toggleGame() {
  if (!gameRunning && score === 0 && snake.length === 1 && snake[0].x === 10 && snake[0].y === 10) {
    gameRunning = true;
    gamePaused = false;
    document.getElementById('startBtn').textContent = 'Folytatás';
    document.getElementById('pauseBtn').disabled = false;
    startGameLoop();
    return;
  }

  if (!gameRunning && document.getElementById('gameOverModal').classList.contains('show')) {
    closeGameOverModal();
    resetGame();
    gameRunning = true;
    gamePaused = false;
    document.getElementById('startBtn').textContent = 'Folytatás';
    document.getElementById('pauseBtn').disabled = false;
    startGameLoop();
    return;
  }

  if (gameRunning && gamePaused) {
    gamePaused = false;
    document.getElementById('pauseBtn').textContent = 'Megállítás';
    startGameLoop();
  }
}

function togglePauseFromKeyboard() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  document.getElementById('pauseBtn').textContent = gamePaused ? 'Folytatás' : 'Megállítás';
  if (!gamePaused) startGameLoop();
}

function pauseGame() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  document.getElementById('pauseBtn').textContent = gamePaused ? 'Folytatás' : 'Megállítás';
  if (!gamePaused) startGameLoop();
}

function resetGame() {
  clearInterval(gameLoop);
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  gameSpeed = 100;
  gameRunning = false;
  gamePaused = false;
  document.getElementById('score').textContent = 0;
  document.getElementById('level').textContent = 1;
  document.getElementById('startBtn').textContent = 'Játék indítása';
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('pauseBtn').textContent = 'Megállítás';
  draw();
}

function startGameLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(() => {
    if (!gamePaused && gameRunning) {
      update();
      draw();
    }
  }, gameSpeed);
}

function update() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame();
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10 * level;
    document.getElementById('score').textContent = score;

    if (score > 0 && score % 50 === 0) {
      level++;
      gameSpeed = Math.max(50, gameSpeed - 5);
      document.getElementById('level').textContent = level;
      startGameLoop();
    }

    food = generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  let newFood;
  let onSnake = true;

  while (onSnake) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }

  return newFood;
}

function draw() {
  ctx.fillStyle = '#0f0f1e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
    ctx.stroke();
  }

  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = '#00ff41';
      ctx.shadowColor = 'rgba(0, 255, 65, 0.8)';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
      ctx.shadowColor = 'transparent';
    }

    ctx.fillRect(
      segment.x * CELL_SIZE + 1,
      segment.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  });

  ctx.fillStyle = '#ff006e';
  ctx.shadowColor = 'rgba(255, 0, 110, 0.8)';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.shadowColor = 'transparent';
}

function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    document.getElementById('highScore').textContent = highScore;
  }

  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalHighScore').textContent = highScore;
  document.getElementById('gameOverModal').classList.add('show');
  document.getElementById('startBtn').textContent = 'Start Game';
  document.getElementById('pauseBtn').disabled = true;
}

function closeGameOverModal() {
  document.getElementById('gameOverModal').classList.remove('show');
  draw();
}
