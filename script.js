const homepage = document.querySelector('.homepage');
const gamePage = document.querySelector('.game');
const playAgainButton = document.getElementById('playAgainButton');
const board = document.getElementById('board');
const message = document.getElementById('message');
const timer = document.getElementById('timer');
const flippedCounter = document.getElementById('flippedCounter');
const bestScoreDisplay = document.getElementById('bestScore');
const imageSearchInput = document.getElementById('imageSearch');
const difficultyButtons = document.querySelectorAll('.difficulty-button');

let cards = [];
let flippedCards = [];
let matchedCards = [];
let specialCards = [];
let gridSize = 4;
let time = 0;
let flipCount = 0;
let timerInterval;
let bestScore = localStorage.getItem('bestScore') || 'N/A';
let cardImages = [];

bestScoreDisplay.textContent = `Best Time: ${bestScore}`;

difficultyButtons.forEach(button => button.addEventListener('click', (e) => {
    gridSize = parseInt(e.target.getAttribute('data-size'));
    startGame();
}));

playAgainButton.addEventListener('click', resetGame);

function startGame() {
    homepage.style.display = 'none';
    gamePage.style.display = 'block';
    playAgainButton.style.display = 'none';
    message.textContent = '';
    board.innerHTML = '';
    timer.textContent = 'Time: 0s';
    flippedCounter.textContent = 'Flipped: 0';
    time = 0;
    flipCount = 0;
    cards = generateCards();
    const shuffledCards = shuffle(cards);
    createBoard(shuffledCards);
    startTimer();
}

function resetGame() {
    flippedCards = [];
    matchedCards = [];
    specialCards = [];
    time = 0;
    flipCount = 0;
    startGame();
}

function generateCards() {
    const totalCards = gridSize * gridSize / 2;
    const basicCards = Array.from({ length: totalCards }, (_, i) => i);
    return [...basicCards, ...basicCards];
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function createBoard(cards) {
    cardImages = await fetchImages();
    specialCards = getSpecialCards(gridSize * gridSize);

    board.className = 'board';
    if (gridSize === 4) {
        board.classList.add('small');
    } else if (gridSize === 6) {
        board.classList.add('medium');
    } else if (gridSize === 8) {
        board.classList.add('large');
    }

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.value = card;
        if (specialCards.includes(index)) {
            cardElement.classList.add('special');
        }
        cardElement.innerHTML = `
            <div class="card-inner card-front"></div>
            <div class="card-inner card-back"></div>
        `;
        cardElement.addEventListener('click', () => handleCardClick(cardElement));
        board.appendChild(cardElement);
    });
}

function getSpecialCards(totalCards) {
    const specialCardCount = 2;
    const specialCards = new Set();
    while (specialCards.size < specialCardCount) {
        specialCards.add(Math.floor(Math.random() * totalCards));
    }
    return Array.from(specialCards);
}

function handleCardClick(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        const cardBack = card.querySelector('.card-back');
        const img = document.createElement('img');
        img.src = cardImages[card.dataset.value];
        img.className = 'card-image';
        cardBack.appendChild(img);
        flippedCards.push(card);
        flipCount++;
        flippedCounter.textContent = `Flipped: ${flipCount}`;

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCards.push(card1, card2);
        flippedCards = [];

        if (matchedCards.length === cards.length) {
            message.textContent = 'Congratulations! You found all pairs!';
            playAgainButton.style.display = 'block';
            stopTimer();
            updateBestScore();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.querySelector('.card-back').innerHTML = '';
            card2.querySelector('.card-back').innerHTML = '';
            flippedCards = [];
        }, 1000);
    }

    if (card1.classList.contains('special') || card2.classList.contains('special')) {
        handleSpecialCard(card1, card2);
    }
}

function handleSpecialCard(card1, card2) {
    const specialEffect = Math.floor(Math.random() * 3);

    card1.classList.add('special-flipped');
    card2.classList.add('special-flipped');

    setTimeout(() => {
        switch (specialEffect) {
            case 0:
                message.textContent = 'Shuffle remaining cards!';
                shuffleRemainingCards();
                break;
            case 1:
                message.textContent = 'Reveal another card!';
                revealAnotherCard();
                break;
            case 2:
                message.textContent = 'Freeze timer for 5 seconds!';
                freezeTimer();
                break;
        }
        setTimeout(() => {
            message.textContent = ''; 
        }, 5000);
    }, 500);
}

function shuffleRemainingCards() {
    const remainingCards = Array.from(board.children).filter(card => !card.classList.contains('matched') && !card.classList.contains('flipped'));
    const shuffledValues = shuffle(remainingCards.map(card => card.dataset.value));
    remainingCards.forEach((card, index) => {
        card.dataset.value = shuffledValues[index];
        card.querySelector('.card-back').innerHTML = ''; 
    });
}

function revealAnotherCard() {
    const remainingCards = Array.from(board.children).filter(card => !card.classList.contains('matched') && !card.classList.contains('flipped'));
    if (remainingCards.length > 0) {
        const randomCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        randomCard.classList.add('flipped');
        const cardBack = randomCard.querySelector('.card-back');
        const img = document.createElement('img');
        img.src = cardImages[randomCard.dataset.value];
        img.className = 'card-image';
        cardBack.appendChild(img);
        setTimeout(() => {
            randomCard.classList.remove('flipped');
            cardBack.innerHTML = '';
        }, 1000);
    }
}

function freezeTimer() {
    clearInterval(timerInterval);
    timer.classList.add('frozen');
    setTimeout(() => {
        startTimer();
        timer.classList.remove('frozen');
    }, 5000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        time++;
        timer.textContent = `Time: ${time}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateBestScore() {
    if (bestScore === 'N/A' || time < bestScore) {
        bestScore = time;
        localStorage.setItem('bestScore', bestScore);
        bestScoreDisplay.textContent = `Best Time: ${bestScore}s`;
    }
}

async function fetchImages() {
    let imageCount;
    if (gridSize === 4) {
        imageCount = 8; // Easy (16/2 pairs)
    } else if (gridSize === 6) {
        imageCount = 18; // Medium (36/2 pairs)
    } else if (gridSize === 8) {
        imageCount = 32; // Hard (64/2 pairs)
    }

    const searchTerm = imageSearchInput.value || 'nature';
    const response = await fetch(`https://api.unsplash.com/photos/random?count=${imageCount}&query=${searchTerm}&client_id=shSvDq8DXCeutSbtci5e8xek6DWxOaCWqmWIs4egeHI`);
    const data = await response.json();
    console.log('API Response:', data); 
    return data.map(photo => photo.urls.thumb);
}
