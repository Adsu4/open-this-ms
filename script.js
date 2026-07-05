const states = {
    start: {
        text: "Hello ji..... I have something to say, Sunau?",
        image: "https://media1.tenor.com/m/h9j4-8hL1hMAAAAd/cat-hello.gif",
        options: [
            { text: "Haan, sunao!", nextState: "question1", class: "bg-primary text-on-primary clay-btn", icon: "sentiment_satisfied" },
            { text: "Chodo na, kya fayda?", nextState: "sad1", class: "clay-btn-secondary clay-btn avoid-btn", icon: "close" }
        ]
    },
    sad1: {
        text: "Plsss aisa mat karo na jiii",
        image: "https://media1.tenor.com/m/Wq1-4J9-RzQAAAAd/cat-crying.gif",
        options: [
            { text: "Go Back", nextState: "start", class: "clay-btn-secondary clay-btn", icon: "arrow_back_ios_new" }
        ]
    },
    question1: {
        text: "Kya tum mujhse naraz ho?",
        image: "https://media1.tenor.com/m/n_H392Q0g6wAAAAC/cute-cat.gif",
        options: [
            { text: "Nehi you are the cutest", nextState: "question2", class: "bg-primary text-on-primary clay-btn", icon: "sentiment_satisfied" },
            { text: "Narazgi nahi, direct gussa hoon! Bahut gussa!", nextState: "sad2", class: "clay-btn-secondary clay-btn avoid-btn", icon: "sentiment_dissatisfied" }
        ]
    },
    sad2: {
        text: "Plsss aisa mat bolo na jiii",
        image: "https://media1.tenor.com/m/Wq1-4J9-RzQAAAAd/cat-crying.gif",
        options: [
            { text: "Go Back", nextState: "question1", class: "clay-btn-secondary clay-btn", icon: "arrow_back_ios_new" }
        ]
    },
    question2: {
        text: "Toh aapne mujhe maaf kar diya na, pakka???",
        image: "https://media1.tenor.com/m/O9mUf41Bw2YAAAAC/please-pleading.gif",
        options: [
            { text: "Haan, bilkul!", nextState: "successForm", class: "bg-primary text-on-primary clay-btn", icon: "sentiment_satisfied" },
            { text: "Bilkul nahi!!!", nextState: "sad3", class: "clay-btn-secondary clay-btn avoid-btn", icon: "sentiment_dissatisfied", id: "no-btn" }
        ]
    },
    sad3: {
        text: "Plsss aisa mat karo na jiii",
        image: "https://media1.tenor.com/m/Wq1-4J9-RzQAAAAd/cat-crying.gif",
        options: [
            { text: "Go Back", nextState: "question2", class: "clay-btn-secondary clay-btn", icon: "arrow_back_ios_new" }
        ]
    }
};

// DOM Elements
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameContainer = document.getElementById('gameContainer');
const imageWrapper = document.getElementById('imageWrapper');
const mainImage = document.getElementById('mainImage');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const messageScreen = document.getElementById('messageScreen');
const thankYouScreen = document.getElementById('thankYouScreen');
const messageForm = document.getElementById('messageForm');
const sendBtn = document.getElementById('sendBtn');
const statusMessage = document.getElementById('statusMessage');

// --- Web Audio API Rain & Thunder ---
let audioCtx = null;

function createRainSound() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // White noise buffer for rain
    const bufferSize = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Bandpass filter to shape noise into "rain"
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    // Low pass for softness
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.35;

    noise.connect(filter);
    filter.connect(lp);
    lp.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noise.start();

    // Occasional thunder rumble
    function thunder() {
        const delay = 8000 + Math.random() * 20000;
        setTimeout(() => {
            if (!audioCtx) return;
            const oscillator = audioCtx.createOscillator();
            const thunderGain = audioCtx.createGain();
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(60, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 2.5);
            thunderGain.gain.setValueAtTime(0, audioCtx.currentTime);
            thunderGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.1);
            thunderGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
            oscillator.connect(thunderGain);
            thunderGain.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 3);
            thunder(); // schedule next thunder
        }, delay);
    }
    thunder();
}

// Init game
startBtn.addEventListener('click', () => {
    // Generate rain + thunder via Web Audio API
    createRainSound();

    startScreen.classList.remove('active');
    startScreen.classList.add('hidden-state');
    
    gameContainer.classList.remove('hidden-state');
    gameContainer.classList.add('active');
    
    renderState('start');
});

function renderState(stateKey) {
    if (stateKey === 'successForm') {
        gameContainer.classList.remove('active');
        gameContainer.classList.add('hidden-state');
        
        messageScreen.classList.remove('hidden-state');
        messageScreen.classList.add('active');
        return;
    }

    const state = states[stateKey];
    
    // Re-trigger animations
    imageWrapper.classList.remove('animated-item');
    questionText.classList.remove('animated-item');
    optionsContainer.classList.remove('animated-item');
    
    void imageWrapper.offsetWidth; // trigger reflow

    imageWrapper.classList.add('animated-item');
    questionText.classList.add('animated-item');
    optionsContainer.classList.add('animated-item');

    questionText.textContent = state.text;
    mainImage.src = state.image;
    
    // Clear old options
    optionsContainer.innerHTML = '';
    
    // Add new options
    state.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `rounded-full px-6 py-3 font-title-md text-lg flex items-center justify-center gap-2 z-20 min-w-[180px] ${opt.class}`;
        if (opt.id) btn.id = opt.id;
        
        const iconSpan = document.createElement('span');
        iconSpan.className = "material-symbols-outlined text-xl";
        iconSpan.textContent = opt.icon;
        
        btn.appendChild(iconSpan);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = opt.text;
        btn.appendChild(textSpan);
        
        btn.addEventListener('click', () => renderState(opt.nextState));
        optionsContainer.appendChild(btn);

        // Bind avoid logic if it has the avoid-btn class
        if (opt.class.includes('avoid-btn')) {
            btn.addEventListener('mouseover', function() {
                // Reduced jump distance to make it easier to click
                const maxX = 60;
                const maxY = 60;
                const randomX = (Math.random() - 0.5) * maxX;
                const randomY = (Math.random() - 0.5) * maxY;
                
                btn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.95)`;
            });
            const intervalId = setInterval(() => {
                if (!document.body.contains(btn)) {
                    clearInterval(intervalId);
                    return;
                }
                btn.style.transform = 'translate(0px, 0px) scale(1)';
            }, 3000);
        }
    });
}

// Handle Form Submission
messageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value || "Apology Website Message";
    const message = document.getElementById('message').value;
    
    sendBtn.innerHTML = `<span>Sending...</span><span class="material-symbols-outlined animate-spin">refresh</span>`;
    sendBtn.disabled = true;

    fetch("https://formsubmit.co/ajax/adharshsuvi@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            _subject: subject,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        // Show Thank You Screen
        messageScreen.classList.remove('active');
        messageScreen.classList.add('hidden-state');
        
        thankYouScreen.classList.remove('hidden-state');
        thankYouScreen.classList.add('active');
    })
    .catch(error => {
        console.error(error);
        statusMessage.textContent = "Oops! Something went wrong.";
        statusMessage.classList.remove('hidden');
        sendBtn.innerHTML = `<span>Send</span><span class="material-symbols-outlined">send</span>`;
        sendBtn.disabled = false;
    });
});
