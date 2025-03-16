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
    user = { id: 'guest' }; // Fallback cho test
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
  const leaderboardBody = document.getElementById('leaderboard-body');

  if (!canvas || !ctx) {
    console.error('Canvas or context not found');
    return;
  }

  let bird = { x: 100, y: 300, width: 30, height: 30, velocity: 0, gravity: 0.5, jump: -10 };
  let pipes = [];
  let pipeWidth = 30;
  let pipeGap = 150;
  let pipeFrequency = 90;
  let frameCount = 0;
  let score = 0;
  let gameRunning = false;

  // Hiển thị Top 5 (giả lập dữ liệu)
  const topPlayers = [
    { name: 'Player1', score: 50 },
    { name: 'Player2', score: 45 },
    { name: 'Player3', score: 40 },
    { name: 'Player4', score: 35 },
    { name: 'Player5', score: 30 }
  ];

  topPlayers.forEach((player, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.score}</td>
    `;
    leaderboardBody.appendChild(row);
  });

  function startGame() {
    if (!gameRunning) {
      gameContainer.style.display = 'block';
      gameRunning = true;
      bird.y = 300;
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Draw bird
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Generate pipes
    if (frameCount % pipeFrequency === 0) {
      let pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
      pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap
      });
    }

    // Update and draw pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      let pipe = pipes[i];
      pipe.x -= 2;

      ctx.fillStyle = 'green';
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
      ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);

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

  // Tự động chạy game khi mở Mini App
  startGame();

  // Nút TEST (chơi thử)
  testBtn.addEventListener('click', () => {
    if (telegramInitialized) {
      window.Telegram.WebApp.showAlert('Playing in TEST mode!');
    } else {
      window.alert('Playing in TEST mode!');
    }
    startGame();
  });

  // Nút Tap to Earn (chưa có logic, tạm thời alert)
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
    }
  });

  restartBtn.addEventListener('click', startGame);

  console.log('Game initialized');
});