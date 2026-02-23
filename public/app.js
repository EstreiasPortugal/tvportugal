const channels = {
  rtp1: { name: 'RTP1', url: 'https://www.rtp.pt/play/direto/rtp2' },
  rtp2: { name: 'RTP2', url: 'https://www.rtp.pt/play/direto/rtp2' },
  rtp3: { name: 'RTP3', url: 'https://www.rtp.pt/play/direto/rtp3' },
};

const buttons = document.querySelectorAll('.channel-btn');
const frame = document.getElementById('channel-frame');
const title = document.getElementById('channel-title');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const channel = channels[button.dataset.channel];

    buttons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    title.textContent = `A ver: ${channel.name}`;
    frame.src = channel.url;
  });
});
