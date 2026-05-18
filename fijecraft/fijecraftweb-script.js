// Initialize observer for reveal animations
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Copy IP functionality
// const copyBtn = document.getElementById('copyIp');
// const ipText = document.getElementById('ipText');
// let copyTimeout = null;

// copyBtn.addEventListener('click', async () => {
//     try {
//         await navigator.clipboard.writeText('play.FijeCraft.net');
//         copyBtn.classList.add('copied');
//         const originalText = ipText.textContent;
//         ipText.textContent = 'Copied!';

//         if (copyTimeout) clearTimeout(copyTimeout);
//         copyTimeout = setTimeout(() => {
//             copyBtn.classList.remove('copied');
//             ipText.textContent = originalText;
//         }, 2000);
//     } catch (err) {
//         console.error('Copy failed:', err);
//     }
// });

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    });

    // Keyboard support
    question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            question.click();
        }
    });
});

// player count
async function updatePlayerCount() {
    const address = 'effects-bond.gl.joinmc.link';
    const statusDot = document.querySelector('.status-dot');
    const playerList = document.getElementById('player-list');

    try {
        const response = await fetch(`https://api.mcstatus.io/v2/status/java/${address}`);
        const data = await response.json();

        const element = document.getElementById('player-count');
        if (data.online) {
            element.textContent = `${data.players.online} Online`;
            statusDot.classList.add('online');
            statusDot.classList.remove('offline');

            const players = data.players?.list || data.players?.sample || [];
            if (players.length) {
                playerList.innerHTML = players
                    .map(player => `<li>- ${player.name_clean || player.name_raw || 'Unknown'}</li>`)
                    .join('');
            } else {
                playerList.innerHTML = '<li>No player names available</li>';
            }
        } else {
            element.textContent = 'Server offline';
            element.style.color = 'red';
            statusDot.classList.add('offline');
            statusDot.classList.remove('online');
            playerList.innerHTML = '<li>Server offline</li>';
        }
    } catch (error) {
        console.error('Error fetching server status:', error);
        document.getElementById('player-count').textContent = 'Error loading status';
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
        playerList.innerHTML = '<li>Unable to load players</li>';
    }
}

// Update on page load and every 30 seconds
updatePlayerCount();
setInterval(updatePlayerCount, 30000);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navHeight = 72;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// cloudflared section
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.closest('article');
        const tab = btn.dataset.tab;

        // reset buttons
        parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // switch panels
        parent.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.tab !== tab);
        });
    });
});