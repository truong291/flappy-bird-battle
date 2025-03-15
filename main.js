// Initialize Telegram WebApp
window.Telegram.WebApp.ready();
const user = window.Telegram.WebApp.initDataUnsafe.user;
console.log('User:', user ? user : 'No user data');

// Connect TON Wallet
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: 'https://flappy-bird-battle-4innieflz-mj-devs-projects-e3534b9c.vercel.app/tonconnect-manifest.json'
});

document.getElementById('connect-wallet-btn').addEventListener('click', async () => {
  try {
    const wallet = await tonConnectUI.connectWallet();
    window.Telegram.WebApp.showAlert(`Connected: ${wallet.account.address}`);
  } catch (error) {
    console.error('Connection error:', error);
    window.Telegram.WebApp.showAlert('Wallet connection failed!');
  }
});

document.getElementById('play-btn').addEventListener('click', () => {
  window.Telegram.WebApp.showAlert('Welcome to Flappy Bird Battle!');
});

document.getElementById('invite-btn').addEventListener('click', () => {
  try {
    if (!window.Telegram || !window.Telegram.WebApp) {
      console.error('Telegram Web App not initialized');
      window.alert('Telegram Web App not initialized. Please try again.');
      return;
    }

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
    window.alert('Failed to initiate share. Please try again.');
  }
});