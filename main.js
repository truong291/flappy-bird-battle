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

  // Connect TON Wallet
  let tonConnectUI = null;
  try {
    tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
      manifestUrl: 'https://flappy-bird-battle.vercel.app/tonconnect-manifest.json'
    });
  } catch (error) {
    console.error('Failed to initialize TON Connect UI:', error);
  }

  document.getElementById('connect-wallet-btn').addEventListener('click', async () => {
    if (!tonConnectUI) {
      window.alert('TON Connect UI not initialized.');
      return;
    }
    try {
      const wallet = await tonConnectUI.connectWallet();
      if (telegramInitialized) {
        window.Telegram.WebApp.showAlert(`Connected: ${wallet.account.address}`);
      } else {
        window.alert(`Connected: ${wallet.account.address}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      if (telegramInitialized) {
        window.Telegram.WebApp.showAlert('Wallet connection failed!');
      } else {
        window.alert('Wallet connection failed!');
      }
    }
  });

  document.getElementById('invite-btn').addEventListener('click', () => {
    if (!telegramInitialized) {
      window.alert('This feature requires Telegram environment.');
      return;
    }
    try {
      const userId = user && user.id ? user.id : 'guest';
      const referralMessage = {
        type: 'share',
        text: `I've completed it in Flappy Bird Battle! It's your time to shine. Airdrops at your fingertips—just press play!`,
        button_text: 'Open Game',
        referral_link: `https://t.me/flappybird_battle_bot?start=ref_${userId}`
      };
      window.Telegram.WebApp.sendData(JSON.stringify(referralMessage));
    } catch (error) {
      console.error('Error sending referral data:', error);
      if (telegramInitialized) {
        window.Telegram.WebApp.showAlert('Failed to initiate share. Please try again.');
      } else {
        window.alert('Failed to initiate share. Please try again.');
      }
    }
  });

  // Flappy Bird Game
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');
  const gameContainer = document.getElement ofId('game-container');
  const scoreDisplay = document.getElementById('score');
  const gameOverScreen = document.getElementById('game-over');
  const finalScoreDisplay = document.getElementById('final-score');
  const restartBtn = document.getElementById('restart-btn');

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

  function startGame() {
    if (!gameRunning) {
      menu.style.display = 'none';
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

  document.getElementById('play-btn').addEventListener('click', () => {
    if (telegramInitialized) {
      window.Telegram.WebApp.showAlert('Welcome to Flappy Bird Battle!');
    } else {
      window.alert('Welcome to Flappy Bird Battle!');
    }
    startGame();
  });

  canvas.addEventListener('click', () => {
    if (gameRunning) {
      bird.velocity = bird.jump;
    }
  });

  restartBtn.addEventListener('click', startGame);

  console.log('Game initialized');
});