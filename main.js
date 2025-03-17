document.addEventListener('DOMContentLoaded', () => {
  let user = null;
  let telegramInitialized = false;

  // Kiểm tra môi trường Telegram
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      user = window.Telegram.WebApp.initDataUnsafe.user;
      telegramInitialized = true;
      console.log('User:', user ? user : 'No user data');
    } else {
      throw new Error('Telegram WebApp not initialized');
    }
  } catch (error) {
    console.error(error.message);
    user = { id: 'guest' };
  }

  // Flappy Bird Game
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const gameContainer = document.getElementById('game-container');
  const scoreDisplay = document.getElementById('score');
  const gameOverScreen = document.getElementById('game-over');
  const finalScoreDisplay = document.getElementById('final-score');
  const restartBtn = document.getElementById('restart-btn');
  const testBtn = document.getElementById('test-btn');
  const tapToEarnBtn = document.getElementById('tap-to-earn-btn');
  const leaderboardList = document.getElementById('leaderboard-list');
  const flySound = document.getElementById('fly-sound');
  const scoreSound = document.getElementById('score-sound');

  if (!canvas || !ctx) {
    console.error('Canvas or context not found');
    return;
  }

  // Tải hình ảnh
  const bgImage = new Image();
  bgImage.src = 'bg.png';
  const birdImage = new Image();
  birdImage.src = 'bird.png';
  const pipeNorthImage = new Image();
  pipeNorthImage.src = 'pipeNorth.png';
  const pipeSouthImage = new Image();
  pipeSouthImage.src = 'pipeSouth.png';

  let bird = { x: 80, y: 240, width: 27, height: 19, velocity: 0, gravity: 0.4, jump: -8 };
  let pipes = [];
  let pipeWidth = 42;
  let pipeGap = 120;
  let pipeFrequency = 90;
  let frameCount = 0;
  let score = 0;
  let gameRunning = false;

  // Hiển thị Top 5 (giả lập dữ liệu)
  const topPlayers = [
    { name: 'dkkk', score: 50 },
    { name: 'dkkk', score: 50 },
    { name: 'dkkk', score: 50 },
    { name: 'dkkk', score: 35 },
    { name: 'dkkk', score: 30 }
  ];

  topPlayers.forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player.name} ${player.score}`;
    leaderboardList.appendChild(li);
  });

  function startGame() {
    if (!gameRunning) {
      gameContainer.style.display = 'block';
      gameRunning = true;
      bird.y = 240;
      bird.velocity = 0;
      pipes = [];
      score = 0;
      frameCount = 0;
      scoreDisplay.textContent = `Score: ${score}`;
      gameOverScreen.style.display = 'none';
      gameLoop();
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    if (frameCount % pipeFrequency === 0) {
      let pipeHeight = Math.random() * (canvas.height - pipeGap - 80) + 40;
      pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap
      });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      let pipe = pipes[i];
      pipe.x -= 2;

      ctx.drawImage(pipeNorthImage, pipe.x, 0, pipeWidth, pipe.topHeight);
      ctx.drawImage(pipeSouthImage, pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);

      if (
        bird.x + bird.width > pipe.x &&
        bird.x < pipe.x + pipeWidth &&
        (bird.y < pipe.topHeight || bird.y + bird.height > canvas.height - pipe.bottomHeight)
      ) {
        endGame();
        return;
      }

      if (bird.x > pipe.x + pipeWidth && !pipe.passed) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        scoreSound.play();
        pipe.passed = true;
      }

      if (pipe.x + pipeWidth < 0) {
        pipes.splice(i, 1);
      }
    }

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
      endGame();
      return;
    }

    frameCount++;
    requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameRunning = false;
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = score;
  }

  testBtn.addEventListener('click', () => {
    if (telegramInitialized) {
      window.Telegram.WebApp.showAlert('Playing in TEST mode!');
    } else {
      window.alert('Playing in TEST mode!');
    }
    startGame();
  });

  tapToEarnBtn.addEventListener('click', () => {
    if (telegramInitialized) {
      window.Telegram.WebApp.showAlert('Tap to Earn feature coming soon!');
    } else {
      window.alert('Tap to Earn feature coming soon!');
    }
  });

  canvas.addEventListener('click', () => {
    if (gameRunning) {
      bird.velocity = bird.jump;
      flySound.play();
    }
  });

  restartBtn.addEventListener('click', startGame);

  console.log('Game initialized');
});