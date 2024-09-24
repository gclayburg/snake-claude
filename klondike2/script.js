// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Constants for suits and ranks
    const SUITS = ['C', 'D', 'H', 'S']; // Clubs, Diamonds, Hearts, Spades
    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    // Game state variables
    let deck = [];
    let stock = [];
    let waste = [];
    let foundations = [[], [], [], []]; // foundation-1 to foundation-4
    let tableau = [[], [], [], [], [], [], []]; // tableau-1 to tableau-7
    let score = 0;
    
    // Variables for drag and drop
    let draggedCards = null;
    let originalPile = null;
    
    // Initialize the game
    initGame();
    
    /**
     * Initializes the game by creating and shuffling the deck, dealing cards to tableau and stock, and rendering the initial state.
     */
    function initGame() {
        // Reset game state
        deck = createDeck();
        shuffleDeck(deck);
        dealCards();
        score = 0;
        updateScore();
        renderAllPiles();
        hideGameOverModal();
        
        console.log("Game initialized.");
    }
    
    /**
     * Creates a standard 52-card deck.
     * @returns {Array} - Array of card objects.
     */
    function createDeck() {
        const newDeck = [];
        SUITS.forEach(suit => {
            RANKS.forEach(rank => {
                newDeck.push({
                    suit: suit,
                    rank: rank,
                    image: `images/${rank}${suit}.png`,
                    faceUp: false
                });
            });
        });
        return newDeck;
    }
    
    /**
     * Shuffles the deck using the Fisher-Yates algorithm.
     * @param {Array} deck - The deck to shuffle.
     */
    function shuffleDeck(deck) {
        for (let i = deck.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i +1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        console.log("Deck shuffled.");
    }
    
    /**
     * Deals cards to the tableau and initializes the stock pile.
     */
    function dealCards() {
        // Deal to tableau
        for (let i = 0; i < 7; i++) { // 7 tableau piles
            for (let j = 0; j <= i; j++) { // 1 to 7 cards
                const card = deck.pop();
                if (j === i) {
                    card.faceUp = true; // Top card face up
                }
                tableau[i].push(card);
            }
        }
        
        // Remaining cards go to stock
        stock = deck.slice();
        deck = []; // Clear the main deck
        console.log("Cards dealt to tableau and stock.");
    }
    
    /**
     * Updates the score display.
     */
    function updateScore() {
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = `Score: ${score}`;
    }
    
    /**
     * Renders all piles: stock, waste, foundations, and tableau.
     */
    function renderAllPiles() {
        renderStock();
        renderWaste();
        renderFoundations();
        renderTableau();
    }
    
    /**
     * Renders the stock pile.
     */
    function renderStock() {
        const stockDiv = document.querySelector('[data-pile="stock"]');
        stockDiv.innerHTML = '';
        
        if (stock.length > 0) {
            const img = document.createElement('img');
            img.src = 'images/back.png';
            img.classList.add('card');
            img.style.border = '1px solid black'; // Thin black border
            stockDiv.appendChild(img);
        } else {
            // Show empty pile with border
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty-pile');
            emptyDiv.style.border = '2px dashed black';
            emptyDiv.style.width = '80px';
            emptyDiv.style.height = '110px';
            stockDiv.appendChild(emptyDiv);
        }
        
        // Add click event to draw cards
        stockDiv.onclick = drawFromStock;
    }
    
    /**
     * Renders the waste pile.
     */
    function renderWaste() {
        const wasteDiv = document.querySelector('[data-pile="waste"]');
        wasteDiv.innerHTML = '';
        
        const wasteToDisplay = waste.slice(-3); // Show top 3 cards
        wasteToDisplay.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.faceUp ? card.image : 'images/back.png';
            img.classList.add('card');
            img.style.position = 'absolute';
            img.style.left = `${index * 15}px`; // Overlap
            img.style.zIndex = index; // Ensure proper stacking
            
            if (index === wasteToDisplay.length -1) {
                img.style.border = '1px solid black'; // Highlight top card
                img.classList.add('draggable');
                img.draggable = true;
                img.dataset.pile = 'waste';
                img.dataset.index = waste.length -1; // Absolute index in waste
                
                // Add drag event listeners
                img.addEventListener('dragstart', handleDragStart);
                img.addEventListener('dblclick', handleDoubleClick);
            }
            
            wasteDiv.appendChild(img);
        });
        
        // Position the waste pile
        wasteDiv.style.position = 'relative';
        wasteDiv.style.width = '80px';
        wasteDiv.style.height = '110px';
    }
    
    /**
     * Renders the foundation piles.
     */
    function renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundationDiv = document.querySelector(`[data-pile="foundation-${i+1}"]`);
            foundationDiv.innerHTML = '';
            
            if (foundations[i].length > 0) {
                const topCard = foundations[i][foundations[i].length -1];
                const img = document.createElement('img');
                img.src = topCard.image;
                img.classList.add('card');
                img.style.border = '1px solid black'; // Thin black border
                foundationDiv.appendChild(img);
            } else {
                // Show empty pile with border
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('empty-pile');
                emptyDiv.style.border = '2px dashed black';
                emptyDiv.style.width = '80px';
                emptyDiv.style.height = '110px';
                foundationDiv.appendChild(emptyDiv);
            }
        }
    }
    
    /**
     * Renders the tableau piles.
     */
    function renderTableau() {
        for (let i = 0; i < 7; i++) {
            const tableauDiv = document.querySelector(`[data-pile="tableau-${i+1}"]`);
            tableauDiv.innerHTML = '';
            
            tableau[i].forEach((card, index) => {
                const img = document.createElement('img');
                img.src = card.faceUp ? card.image : 'images/back.png';
                img.classList.add('card');
                img.style.position = 'absolute';
                img.style.top = `${index * 5}px`; // 5px separation for face-down cards
                img.style.left = `0px`;
                img.style.zIndex = index;
                
                if (card.faceUp) {
                    img.classList.add('draggable');
                    img.draggable = true;
                    img.dataset.pile = `tableau-${i+1}`;
                    img.dataset.index = index;
                    
                    // Add drag event listeners
                    img.addEventListener('dragstart', handleDragStart);
                    img.addEventListener('dblclick', handleDoubleClick);
                }
                
                tableauDiv.appendChild(img);
            });
            
            // Position the tableau pile
            tableauDiv.style.position = 'relative';
            tableauDiv.style.width = '80px';
            tableauDiv.style.height = `${tableau[i].length * 5 + 110}px`; // Dynamic height based on number of cards
        }
    }
    
    /**
     * Handles drawing cards from the stock to the waste pile.
     */
    function drawFromStock() {
        if (stock.length === 0) {
            // Recycle waste back to stock
            if (waste.length === 0) return; // Nothing to recycle
            stock = waste.map(card => {
                card.faceUp = false;
                return card;
            }).reverse();
            waste = [];
            console.log("Recycled waste back to stock.");
        } else {
            // Draw 3 cards
            for (let i = 0; i < 3; i++) {
                if (stock.length === 0) break;
                const card = stock.pop();
                card.faceUp = true;
                waste.push(card);
            }
            console.log("Drew 3 cards from stock to waste.");
        }
        renderWaste();
        renderStock();
    }
    
    /**
     * Handles the drag start event.
     * @param {DragEvent} e - The drag event.
     */
    function handleDragStart(e) {
        const pile = e.target.dataset.pile;
        const index = parseInt(e.target.dataset.index);
        let movingCards = [];
        
        if (pile.startsWith('tableau')) {
            movingCards = tableau[parseInt(pile.split('-')[1]) -1].slice(index);
        } else if (pile === 'waste') {
            movingCards = waste.slice(index);
        }
        
        draggedCards = movingCards;
        originalPile = pile;
        
        console.log(`Dragging cards from ${pile}:`, draggedCards);
    }
    
    /**
     * Handles the drop event on a pile.
     * @param {DragEvent} e - The drag event.
     */
    function handleDropEvent(e) {
        e.preventDefault();
        
        const destinationPile = e.currentTarget.dataset.pile;
        
        if (!draggedCards || !originalPile) return;
        
        console.log(`Attempting to drop on ${destinationPile}`);
        
        if (isLegalMove(draggedCards, destinationPile)) {
            moveCards(draggedCards, originalPile, destinationPile);
            score += draggedCards.length; // Increase score based on number of cards moved to foundation
            updateScore();
            renderAllPiles();
            checkWinCondition();
        } else {
            console.log("Illegal move attempted.");
            // Optionally, provide visual feedback for illegal move
        }
        
        // Reset drag variables
        draggedCards = null;
        originalPile = null;
    }
    
    /**
     * Determines if moving the dragged cards to the destination pile is legal.
     * @param {Array} cards - Array of card objects being moved.
     * @param {string} destinationPile - Identifier of the destination pile.
     * @returns {boolean} - True if the move is legal, false otherwise.
     */
    function isLegalMove(cards, destinationPile) {
        const movingCard = cards[0];
        
        if (destinationPile.startsWith('foundation')) {
            const foundationIndex = parseInt(destinationPile.split('-')[1]) -1;
            const foundationPile = foundations[foundationIndex];
            
            if (movingCard.rank === 'A' && foundationPile.length === 0) {
                return true;
            }
            
            if (foundationPile.length > 0) {
                const topFoundationCard = foundationPile[foundationPile.length -1];
                return topFoundationCard.suit === movingCard.suit && getRankValue(movingCard.rank) === getRankValue(topFoundationCard.rank) +1;
            }
            
            return false;
        }
        
        if (destinationPile.startsWith('tableau')) {
            const tableauIndex = parseInt(destinationPile.split('-')[1]) -1;
            const tableauPile = tableau[tableauIndex];
            
            if (tableauPile.length === 0) {
                return movingCard.rank === 'K'; // Only King can be placed on empty tableau
            }
            
            const topTableauCard = tableauPile[tableauPile.length -1];
            return topTableauCard.faceUp &&
                   getRankValue(movingCard.rank) === getRankValue(topTableauCard.rank) -1 &&
                   isOppositeColor(movingCard.suit, topTableauCard.suit);
        }
        
        return false;
    }
    
    /**
     * Moves the dragged cards from the source pile to the destination pile.
     * @param {Array} cards - Array of card objects being moved.
     * @param {string} sourcePile - Identifier of the source pile.
     * @param {string} destinationPile - Identifier of the destination pile.
     */
    function moveCards(cards, sourcePile, destinationPile) {
        // Remove cards from source pile
        if (sourcePile.startsWith('tableau')) {
            const tableauIndex = parseInt(sourcePile.split('-')[1]) -1;
            tableau[tableauIndex] = tableau[tableauIndex].slice(0, tableau[tableauIndex].length - cards.length);
            
            // Flip the next card in tableau if it's face down
            if (tableau[tableauIndex].length > 0) {
                const lastCard = tableau[tableauIndex][tableau[tableauIndex].length -1];
                if (!lastCard.faceUp) {
                    lastCard.faceUp = true;
                }
            }
        } else if (sourcePile === 'waste') {
            waste = waste.slice(0, waste.length - cards.length);
        }
        
        // Add cards to destination pile
        if (destinationPile.startsWith('foundation')) {
            const foundationIndex = parseInt(destinationPile.split('-')[1]) -1;
            foundations[foundationIndex].push(...cards);
        } else if (destinationPile.startsWith('tableau')) {
            const tableauIndex = parseInt(destinationPile.split('-')[1]) -1;
            tableau[tableauIndex].push(...cards);
        }
        
        console.log(`Moved cards to ${destinationPile}:`, cards);
    }
    
    /**
     * Checks if the player has won the game.
     */
    function checkWinCondition() {
        const totalCardsInFoundations = foundations.reduce((acc, pile) => acc + pile.length, 0);
        if (totalCardsInFoundations === 52) {
            showGameOverModal();
            console.log("Player has won the game!");
        }
    }
    
    /**
     * Displays the game over modal.
     */
    function showGameOverModal() {
        const modal = document.getElementById('game-over');
        modal.classList.remove('hidden');
    }
    
    /**
     * Hides the game over modal.
     */
    function hideGameOverModal() {
        const modal = document.getElementById('game-over');
        modal.classList.add('hidden');
    }
    
    /**
     * Handles the double-click event to auto-move a card to the foundation if possible.
     * @param {MouseEvent | TouchEvent} e - The event object.
     */
    function handleDoubleClick(e) {
        const pile = e.target.dataset.pile;
        const index = parseInt(e.target.dataset.index);
        let card = null;
        
        if (pile.startsWith('tableau')) {
            const tableauIndex = parseInt(pile.split('-')[1]) -1;
            card = tableau[tableauIndex][index];
        } else if (pile === 'waste') {
            card = waste[index];
        }
        
        if (!card) return;
        
        // Find the corresponding foundation pile based on suit
        const foundationIndex = SUITS.indexOf(card.suit);
        if (foundationIndex === -1) return;
        
        const foundationPile = foundations[foundationIndex];
        
        if (card.rank === 'A' && foundationPile.length === 0) {
            // Move Ace to foundation
            moveCards([card], pile, `foundation-${foundationIndex +1}`);
            score += 1;
            updateScore();
            renderAllPiles();
            checkWinCondition();
            return;
        }
        
        if (foundationPile.length > 0) {
            const topFoundationCard = foundationPile[foundationPile.length -1];
            if (getRankValue(card.rank) === getRankValue(topFoundationCard.rank) +1) {
                // Move card to foundation
                moveCards([card], pile, `foundation-${foundationIndex +1}`);
                score += 1;
                updateScore();
                renderAllPiles();
                checkWinCondition();
            }
        }
    }
    
    /**
     * Gets the numerical value of a card's rank.
     * @param {string} rank - The rank of the card.
     * @returns {number} - Numerical value of the rank.
     */
    function getRankValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank);
    }
    
    /**
     * Determines if two suits are of opposite colors.
     * @param {string} suit1 - First suit.
     * @param {string} suit2 - Second suit.
     * @returns {boolean} - True if opposite colors, false otherwise.
     */
    function isOppositeColor(suit1, suit2) {
        const redSuits = ['H', 'D'];
        const blackSuits = ['C', 'S'];
        return (redSuits.includes(suit1) && blackSuits.includes(suit2)) ||
               (blackSuits.includes(suit1) && redSuits.includes(suit2));
    }
    
    /**
     * Adds event listeners to pile areas for drag and drop functionality.
     */
    function addPileEventListeners() {
        const allPiles = document.querySelectorAll('.pile');
        allPiles.forEach(pile => {
            pile.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            pile.addEventListener('drop', handleDropEvent);
        });
    }
    
    /**
     * Sets up event listeners for the game.
     */
    function setupEventListeners() {
        addPileEventListeners();
        
        // Restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => {
            initGame();
        });
        
        // Touch events for mobile
        setupTouchEvents();
    }
    
    /**
     * Sets up touch event listeners for mobile devices.
     */
    function setupTouchEvents() {
        // Touchstart and touchend for dragging
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            card.addEventListener('touchstart', handleTouchStart, { passive: false });
            card.addEventListener('touchend', handleTouchEnd, { passive: false });
        });
    }
    
    /**
     * Handles the touch start event to initiate dragging.
     * @param {TouchEvent} e - The touch event.
     */
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (!target.classList.contains('card')) return;
        
        const pile = target.dataset.pile;
        const index = parseInt(target.dataset.index);
        let movingCards = [];
        
        if (pile.startsWith('tableau')) {
            movingCards = tableau[parseInt(pile.split('-')[1]) -1].slice(index);
        } else if (pile === 'waste') {
            movingCards = waste.slice(index);
        }
        
        draggedCards = movingCards;
        originalPile = pile;
        
        // Visual feedback: create a clone of the dragged cards
        createTouchDragFeedback(e.touches[0], movingCards);
        
        console.log(`Touch dragging cards from ${pile}:`, movingCards);
    }
    
    /**
     * Handles the touch end event to attempt dropping the dragged cards.
     * @param {TouchEvent} e - The touch event.
     */
    function handleTouchEnd(e) {
        e.preventDefault();
        
        if (!draggedCards || !originalPile) return;
        
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (!target) {
            resetTouchDragFeedback();
            return;
        }
        
        let destinationPile = null;
        
        if (target.classList.contains('pile')) {
            destinationPile = target.dataset.pile;
        } else if (target.parentElement.classList.contains('pile')) {
            destinationPile = target.parentElement.dataset.pile;
        }
        
        if (destinationPile && isLegalMove(draggedCards, destinationPile)) {
            moveCards(draggedCards, originalPile, destinationPile);
            score += draggedCards.length; // Increase score based on number of cards moved to foundation
            updateScore();
            renderAllPiles();
            checkWinCondition();
            console.log(`Touch drop successful on ${destinationPile}.`);
        } else {
            console.log("Touch drop illegal.");
        }
        
        // Remove drag feedback
        resetTouchDragFeedback();
        
        // Reset drag variables
        draggedCards = null;
        originalPile = null;
    }
    
    /**
     * Creates visual feedback for touch dragging by cloning the dragged cards.
     * @param {Touch} touch - The touch object.
     * @param {Array} cards - Array of card objects being dragged.
     */
    function createTouchDragFeedback(touch, cards) {
        // Remove existing feedback if any
        resetTouchDragFeedback();
        
        // Create a container for the cloned cards
        const dragContainer = document.createElement('div');
        dragContainer.id = 'touch-drag-container';
        dragContainer.style.position = 'absolute';
        dragContainer.style.left = `${touch.clientX}px`;
        dragContainer.style.top = `${touch.clientY}px`;
        dragContainer.style.pointerEvents = 'none';
        dragContainer.style.zIndex = '1000';
        
        // Clone each card and add to the container
        cards.forEach((card, index) => {
            const img = document.createElement('img');
            img.src = card.faceUp ? card.image : 'images/back.png';
            img.classList.add('card', 'dragging');
            img.style.position = 'absolute';
            img.style.top = `${index * 5}px`; // Slight overlap
            img.style.left = `${index * 5}px`;
            img.style.opacity = '0.8';
            img.style.cursor = 'grabbing';
            dragContainer.appendChild(img);
        });
        
        document.body.appendChild(dragContainer);
    }
    
    /**
     * Removes the touch drag feedback elements.
     */
    function resetTouchDragFeedback() {
        const dragContainer = document.getElementById('touch-drag-container');
        if (dragContainer) {
            dragContainer.remove();
        }
    }
    
    /**
     * Sets up all necessary event listeners.
     */
    function setupEventListeners() {
        addPileEventListeners();
        setupTouchEvents();
        setupRestartButton();
    }
    
    /**
     * Adds drag and drop event listeners to all pile elements.
     */
    function addPileEventListeners() {
        const allPiles = document.querySelectorAll('.pile');
        allPiles.forEach(pile => {
            pile.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            pile.addEventListener('drop', handleDropEvent);
        });
    }
    
    /**
     * Sets up the restart button event listener.
     */
    function setupRestartButton() {
        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => {
            initGame();
        });
    }
    
    /**
     * Initializes event listeners for the game.
     */
    setupEventListeners();
    
    /**
     * Handles the drop event on a pile.
     * @param {DragEvent} e - The drag event.
     */
    function handleDropEvent(e) {
        e.preventDefault();
        
        const destinationPile = e.currentTarget.dataset.pile;
        
        if (!draggedCards || !originalPile) return;
        
        console.log(`Attempting to drop on ${destinationPile}`);
        
        if (isLegalMove(draggedCards, destinationPile)) {
            moveCards(draggedCards, originalPile, destinationPile);
            score += draggedCards.length; // Increase score based on number of cards moved to foundation
            updateScore();
            renderAllPiles();
            checkWinCondition();
        } else {
            console.log("Illegal move attempted.");
            // Optionally, provide visual feedback for illegal move
        }
        
        // Reset drag variables
        draggedCards = null;
        originalPile = null;
    }
    
    /**
     * Displays the game over modal.
     */
    function showGameOverModal() {
        const modal = document.getElementById('game-over');
        modal.classList.remove('hidden');
    }
    
    /**
     * Hides the game over modal.
     */
    function hideGameOverModal() {
        const modal = document.getElementById('game-over');
        modal.classList.add('hidden');
    }
});
