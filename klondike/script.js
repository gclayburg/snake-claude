// script.js

document.addEventListener('DOMContentLoaded', () => {
    const suits = ['C', 'D', 'H', 'S']; // Clubs, Diamonds, Hearts, Spades
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
    let stock = [];
    let waste = [];
    let foundations = [[], [], [], []];
    let tableau = [[], [], [], [], [], [], []];
    let dragData = null;
    let doubleClickTimeout = null;
    const DOUBLE_CLICK_DELAY = 300; // milliseconds

    // Initialize the game
    function initGame() {
        // Reset all game state variables
        deck = [];
        stock = [];
        waste = [];
        foundations = [[], [], [], []];
        tableau = [[], [], [], [], [], [], []];
        dragData = null;

        // Create and shuffle the deck
        createDeck();
        shuffleDeck();

        // Deal the cards to the tableau
        dealCards();

        // Render the initial game state
        render();

        // Hide the game-over modal just in case
        document.getElementById('game-over').classList.add('hidden');

        // Debugging: Log the initial state of foundations
        console.log("Initial Foundations:", foundations);
    }

    // Create a standard 52-card deck
    function createDeck() {
        deck = [];
        suits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({ suit, rank, faceUp: false, element: null });
            });
        });
        console.log("Deck created with", deck.length, "cards.");
    }

    // Shuffle the deck using Fisher-Yates algorithm
    function shuffleDeck() {
        for (let i = deck.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i +1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        console.log("Deck shuffled.");
    }

    // Deal cards to the tableau
    function dealCards() {
        tableau.forEach((pile, index) => {
            for (let i = 0; i <= index; i++) {
                const card = deck.pop();
                if (i === index) {
                    card.faceUp = true;
                }
                pile.push(card);
            }
        });
        stock = deck;
        console.log("After dealing, Stock has:", stock.length, "cards.");
        console.log("Tableau piles:", tableau);
    }

    // Render the game state to the DOM
    function render() {
        renderPile('stock', stock, false);
        renderWaste();
        renderFoundations();
        renderTableau();
        addPileEventListeners();
        addGameAreaEventListener(); // Add this line
    }

    /**
     * Render individual piles (stock, foundations)
     * @param {string} pileId - Identifier for the pile (e.g., 'stock', 'foundation-1')
     * @param {Array} pile - Array of card objects in the pile
     * @param {boolean} hideFaceDown - Whether to hide face-down cards
     */
    function renderPile(pileId, pile, hideFaceDown) {
        const pileDiv = document.querySelector(`[data-pile="${pileId}"]`);
        if (!pileDiv) return; // Guard clause in case the element is not found

        pileDiv.innerHTML = ''; // This line ensures the pile is cleared before rendering

        if (pileId === 'stock') {
            // Render all cards in the stock pile with a slight offset
            pile.forEach((card, index) => {
                const img = document.createElement('img');
                img.src = 'images/back.png';
                img.classList.add('card');
                img.style.top = `${index * 3}px`; // 3px offset for each card
                pileDiv.appendChild(img);
            });
        } else if (pileId.startsWith('foundation')) {
            // Render only the top card for foundation piles
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                const img = document.createElement('img');
                img.src = `images/${topCard.rank}${topCard.suit}.png`;
                img.classList.add('card');
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';

                // Error handling for missing images
                img.onerror = function() {
                    console.error(`Image not found: images/${topCard.rank}${topCard.suit}.png`);
                    this.src = 'images/back.png'; // Fallback to card back
                };

                pileDiv.appendChild(img);
            }
        } else {
            // Existing rendering logic for other piles
            pile.forEach((card, index) => {
                const img = document.createElement('img');

                if (pileId === 'stock') {
                    // Stock shows only the back
                    img.src = 'images/back.png';
                } else {
                    if (card.faceUp) {
                        img.src = `images/${card.rank}${card.suit}.png`;
                    } else {
                        img.src = 'images/back.png';
                    }
                }

                img.classList.add('card');
                img.style.position = 'absolute'; // Ensure proper stacking
                img.style.top = `${index * 5}px`; // Slight overlap for visual appeal
                img.style.left = `0px`;

                // Prevent foundation pile cards from being draggable
                if (!pileId.startsWith('foundation') && card.faceUp) {
                    img.setAttribute('draggable', true);
                    img.dataset.pile = pileId;
                    img.dataset.index = index;
                    addCardEventListeners(img, pileId, index);
                }

                // Error handling for missing images
                img.onerror = function() {
                    console.error(`Image not found: images/${card.rank}${card.suit}.png`);
                    this.src = 'images/back.png'; // Fallback to card back
                };

                pileDiv.appendChild(img);
            });
        }
    }

    /**
     * Render the waste pile with top 3 cards
     */
    function renderWaste() {
        const wasteDiv = document.querySelector('[data-pile="waste"]');
        wasteDiv.innerHTML = '';
        const lastThree = waste.slice(-3);
        const sliceLength = lastThree.length;
        lastThree.forEach((card, index) => {
            const img = document.createElement('img');
            if (card.faceUp) {
                img.src = `images/${card.rank}${card.suit}.png`;
            } else {
                img.src = 'images/back.png';
            }
            img.classList.add('card');
            img.style.position = 'absolute';
            img.style.left = `${index * 15}px`; // Overlap for waste pile

            // Only the top card in the waste pile is draggable
            if (index === sliceLength -1) { // Last card in the sliced array
                img.setAttribute('draggable', true);
                img.dataset.pile = 'waste';
                img.dataset.index = waste.length -1; // Absolute index in waste array
                addCardEventListeners(img, 'waste', waste.length -1);
            }

            // Error handling for missing images
            img.onerror = function() {
                console.error(`Image not found: images/${card.rank}${card.suit}.png`);
                this.src = 'images/back.png'; // Fallback to card back
            };

            wasteDiv.appendChild(img);
        });
        console.log("Waste rendered. Current waste:", waste);
    }

    /**
     * Render foundation piles
     */
    function renderFoundations() {
        foundations.forEach((foundation, index) => {
            renderPile(`foundation-${index+1}`, foundation, true);
        });
    }

    /**
     * Render tableau piles with overlapping face-up cards
     */
    function renderTableau() {
        tableau.forEach((pile, index) => {
            const pileDiv = document.querySelector(`[data-pile="tableau-${index+1}"]`);
            pileDiv.innerHTML = '';
            pile.forEach((card, i) => {
                const img = document.createElement('img');
                if (card.faceUp) {
                    img.src = `images/${card.rank}${card.suit}.png`;
                } else {
                    img.src = 'images/back.png';
                }
                img.classList.add('card');
                img.style.position = 'absolute';
                img.style.top = `${i * 30}px`; // Overlap for face-down cards
                img.style.left = `0px`;

                if (card.faceUp) {
                    img.setAttribute('draggable', true);
                    img.dataset.pile = `tableau-${index+1}`;
                    img.dataset.index = i;
                    addCardEventListeners(img, `tableau-${index+1}`, i);
                }

                // Error handling for missing images
                img.onerror = function() {
                    console.error(`Image not found: images/${card.rank}${card.suit}.png`);
                    this.src = 'images/back.png'; // Fallback to card back
                };

                pileDiv.appendChild(img);
            });
            console.log(`Tableau-${index+1} rendered. Current pile:`, pile);
        });
    }

    /**
     * Add event listeners to card elements
     * @param {HTMLElement} cardElement - The image element representing the card
     * @param {string} pileId - Identifier for the pile (e.g., 'waste', 'tableau-1')
     * @param {number} index - Index of the card within its pile
     */
    function addCardEventListeners(cardElement, pileId, index) {
        // Drag and Drop Events
        cardElement.addEventListener('dragstart', handleDragStart);
        cardElement.addEventListener('dblclick', handleDoubleClick);
        // Touch Events for Mobile
        cardElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        cardElement.addEventListener('touchend', handleTouchEnd);
    }

    /**
     * Handle the start of a drag event
     * @param {DragEvent} e - The drag event
     */
    function handleDragStart(e) {
        // Remove 'dragging' class from all cards before starting a new drag
        document.querySelectorAll('.card').forEach(card => card.classList.remove('dragging'));

        const pileId = e.target.dataset.pile;
        const index = parseInt(e.target.dataset.index);
        let movingCards = [];

        if (pileId.startsWith('tableau')) {
            movingCards = tableau[parseInt(pileId.split('-')[1]) -1].slice(index);
        } else if (pileId === 'waste') {
            movingCards = waste.slice(index);
        }

        // Guard against invalid pileIds or indices
        if (!pileId || isNaN(index)) {
            console.error("Invalid pileId or index during drag start.");
            return;
        }

        dragData = {
            sourcePile: pileId,
            cards: movingCards
        };

        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);

        console.log(`The Drag started from ${pileId}, index ${index}. Moving cards:`, movingCards);
    }

    /**
     * Handle drag over events to allow dropping
     * @param {DragEvent} e - The drag event
     */
    function handleDragOver(e) {
        e.preventDefault();
    }

    /**
     * Handle drop events to move cards
     * @param {DragEvent} e - The drag event
     */
    function handleDrop(e) {
        console.log("Try handleDrop");
        e.preventDefault();
        e.stopPropagation(); // Add this line to prevent the event from bubbling up to the game area
        if (!dragData) return;

        const destinationPileId = e.currentTarget.dataset.pile;
        console.log(`Drop attempted on ${destinationPileId} with cards:`, dragData.cards);

        if (isLegalMove(dragData, destinationPileId)) {
            moveCards(dragData, destinationPileId);
            render();
            checkWin();
        } else {
            console.log("Illegal move attempted.");
            // Render again to reset the card positions
            render();
        }
        
        // Always remove the 'dragging' class from all cards
        document.querySelectorAll('.card').forEach(card => card.classList.remove('dragging'));
        
        dragData = null;
    }

    /**
     * Determine if the move is legal based on Solitaire rules
     * @param {Object} dragData - Information about the dragged cards
     * @param {string} destinationPileId - Identifier for the destination pile
     * @returns {boolean} - Whether the move is legal
     */
    function isLegalMove(dragData, destinationPileId) {
        const { cards, sourcePile } = dragData;
        const movingCard = cards[0];

        // Ensure movingCard exists
        if (!movingCard) {
            console.error("No card to move.");
            return false;
        }

        let destinationPile = [];

        if (destinationPileId.startsWith('tableau')) {
            const index = parseInt(destinationPileId.split('-')[1]) -1;
            destinationPile = tableau[index];
        } else if (destinationPileId.startsWith('foundation')) {
            const index = parseInt(destinationPileId.split('-')[1]) -1;
            destinationPile = foundations[index];
        } else {
            // Invalid destination pile
            console.error("Invalid destination pile:", destinationPileId);
            return false;
        }

        let isLegal = false;

        if (destinationPileId.startsWith('foundation')) {
            if (movingCard.rank === 'A' && destinationPile.length === 0) {
                isLegal = true;
            } else if (destinationPile.length > 0) {
                const topCard = destinationPile[destinationPile.length -1];
                isLegal = topCard.suit === movingCard.suit && getRankValue(movingCard.rank) === getRankValue(topCard.rank) +1;
            }
        }

        if (destinationPileId.startsWith('tableau')) {
            if (destinationPile.length === 0) {
                isLegal = movingCard.rank === 'K';
            } else {
                const topCard = destinationPile[destinationPile.length -1];
                isLegal = topCard.faceUp &&
                           getRankValue(movingCard.rank) === getRankValue(topCard.rank) -1 &&
                           isOppositeColor(movingCard.suit, topCard.suit);
            }
        }

        if (!isLegal) {
            // Provide visual feedback for illegal move
            const destinationPileDiv = document.querySelector(`[data-pile="${destinationPileId}"]`);
            destinationPileDiv.classList.add('illegal-move');
            setTimeout(() => {
                destinationPileDiv.classList.remove('illegal-move');
            }, 500);
        }

        return isLegal;
    }

    /**
     * Move cards to the destination pile
     * @param {Object} dragData - Information about the dragged cards
     * @param {string} destinationPileId - Identifier for the destination pile
     */
    function moveCards(dragData, destinationPileId) {
        const { sourcePile, cards } = dragData;

        // Remove cards from source
        if (sourcePile.startsWith('tableau')) {
            const index = parseInt(sourcePile.split('-')[1]) -1;
            tableau[index] = tableau[index].filter(card => !cards.includes(card));
            console.log(`Removed cards from ${sourcePile}:`, cards);
        } else if (sourcePile === 'waste') {
            waste = waste.filter(card => !cards.includes(card));
            console.log(`Removed cards from waste:`, cards);
        }

        // Add cards to destination
        if (destinationPileId.startsWith('foundation')) {
            const index = parseInt(destinationPileId.split('-')[1]) -1;
            foundations[index].push(...cards);
            console.log(`Added cards to foundation-${index +1}:`, cards);
        } else if (destinationPileId.startsWith('tableau')) {
            const index = parseInt(destinationPileId.split('-')[1]) -1;
            tableau[index].push(...cards);
            console.log(`Added cards to tableau-${index +1}:`, cards);
        }

        // Flip the next card in tableau if needed
        if (sourcePile.startsWith('tableau')) {
            const tableauIndex = parseInt(sourcePile.split('-')[1]) -1;
            const pile = tableau[tableauIndex];
            if (pile.length > 0) {
                const topCard = pile[pile.length -1];
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                    console.log(`Flipped card in tableau-${tableauIndex +1}:`, topCard);
                }
            }
        }

        // Debugging: Log foundations after moving cards
        console.log("Foundations after move:", foundations);
    }

    /**
     * Get numerical value of a rank
     * @param {string} rank - The rank of the card (e.g., 'A', '2', ..., 'K')
     * @returns {number} - Numerical value of the rank
     */
    function getRankValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank);
    }

    /**
     * Check if two suits are opposite colors
     * @param {string} suit1 - First suit (e.g., 'H', 'D', 'C', 'S')
     * @param {string} suit2 - Second suit
     * @returns {boolean} - Whether the suits are opposite colors
     */
    function isOppositeColor(suit1, suit2) {
        const red = ['H', 'D'];
        const black = ['C', 'S'];
        return (red.includes(suit1) && black.includes(suit2)) ||
               (black.includes(suit1) && red.includes(suit2));
    }

    /**
     * Handle Double Click to auto-move to foundation
     * @param {MouseEvent | TouchEvent} e - The click or touch event
     */
    function handleDoubleClick(e) {
        const pileId = e.target.dataset.pile;
        const index = parseInt(e.target.dataset.index);
        let card = null;

        if (pileId.startsWith('tableau')) {
            card = tableau[parseInt(pileId.split('-')[1]) -1][index];
        } else if (pileId === 'waste') {
            card = waste[index];
        }

        // Ensure the card exists
        if (!card) {
            console.error("No card found for double-click.");
            return;
        }

        // Try to find the appropriate foundation
        const foundationIndex = suits.indexOf(card.suit);
        if (foundationIndex === -1) return;

        const foundationPile = foundations[foundationIndex];
        if ((card.rank === 'A' && foundationPile.length === 0) ||
            (foundationPile.length > 0 && foundationPile[foundationPile.length -1].rank === getPrevRank(card.rank))) {
            // Move the card
            dragData = {
                sourcePile: pileId,
                cards: [card]
            };
            moveCards(dragData, `foundation-${foundationIndex +1}`);
            dragData = null;
            render();
            checkWin();
            console.log(`Auto-moved card to foundation-${foundationIndex +1}:`, card);
        }
    }

    /**
     * Get previous rank for foundation stacking
     * @param {string} rank - Current card rank
     * @returns {string|null} - Previous rank or null if Ace
     */
    function getPrevRank(rank) {
        const order = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
        const index = order.indexOf(rank);
        if (index > 0) {
            return order[index -1];
        }
        return null;
    }

    /**
     * Handle Touch Start for Mobile Dragging
     * @param {TouchEvent} e - The touch event
     */
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains('card')) {
            const pileId = target.dataset.pile;
            const index = parseInt(target.dataset.index);
            let movingCards = [];

            if (pileId.startsWith('tableau')) {
                movingCards = tableau[parseInt(pileId.split('-')[1]) -1].slice(index);
            } else if (pileId === 'waste') {
                movingCards = waste.slice(index);
            }

            // Guard against invalid pileIds or indices
            if (!pileId || isNaN(index)) {
                console.error("Invalid pileId or index during touch start.");
                return;
            }

            dragData = {
                sourcePile: pileId,
                cards: movingCards
            };

            // Create a ghost element to follow touch
            const ghost = target.cloneNode(true);
            ghost.classList.add('dragging');
            ghost.style.position = 'absolute';
            ghost.style.left = `${touch.clientX - 40}px`; // Adjust based on card width
            ghost.style.top = `${touch.clientY - 60}px`;  // Adjust based on card height
            ghost.id = 'drag-ghost';
            document.body.appendChild(ghost);

            console.log(`Touch drag started from ${pileId}, index ${index}. Moving cards:`, movingCards);
        }
    }

    /**
     * Handle Touch Move for Mobile Dragging
     * @param {TouchEvent} e - The touch event
     */
    document.addEventListener('touchmove', (e) => {
        if (dragData && document.getElementById('drag-ghost')) {
            const touch = e.touches[0];
            const ghost = document.getElementById('drag-ghost');
            ghost.style.left = `${touch.clientX - 40}px`;
            ghost.style.top = `${touch.clientY - 60}px`;
        }
    }, { passive: false });

    /**
     * Handle Touch End for Mobile Dragging
     * @param {TouchEvent} e - The touch event
     */
    function handleTouchEnd(e) {
        if (dragData) {
            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            let destinationPileId = null;

            if (target && target.classList.contains('pile')) {
                destinationPileId = target.dataset.pile;
            } else if (target && target.parentElement.classList.contains('pile')) {
                destinationPileId = target.parentElement.dataset.pile;
            }

            if (destinationPileId && isLegalMove(dragData, destinationPileId)) {
                moveCards(dragData, destinationPileId);
                render();
                checkWin();
                console.log(`Touch drop on ${destinationPileId} successful.`);
            } else {
                console.log("Touch drop illegal.");
            }

            // Remove ghost
            const ghost = document.getElementById('drag-ghost');
            if (ghost) {
                ghost.remove();
            }

            dragData = null;
        }
    }

    /**
     * Handle Stock Click to draw cards or recycle waste
     */
    document.getElementById('stock').addEventListener('click', () => {
        if (stock.length === 0) {
            // Recycle waste into stock
            stock = waste.map(card => { card.faceUp = false; return card; }).reverse();
            waste = [];
            console.log("Recycled waste into stock.");
        } else {
            // Draw 3 cards
            for (let i = 0; i < 3; i++) {
                if (stock.length === 0) break;
                const card = stock.pop();
                card.faceUp = true;
                waste.push(card);
            }
            console.log("Drew 3 cards from stock to waste:", waste.slice(-3));
        }
        render();
        checkWin();
    });

    /**
     * Handle Double Tap on Mobile to auto-move card to foundation
     */
    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('card')) {
            if (doubleClickTimeout) {
                clearTimeout(doubleClickTimeout);
                doubleClickTimeout = null;
                handleDoubleClick(e);
            } else {
                doubleClickTimeout = setTimeout(() => {
                    doubleClickTimeout = null;
                }, DOUBLE_CLICK_DELAY);
            }
        }
    });

    /**
     * Check if the player has won the game
     */
    function checkWin() {
        const totalFoundations = foundations.reduce((acc, pile) => acc + pile.length, 0);
        console.log("Total Cards in Foundations:", totalFoundations); // Debugging log
        console.log("Foundations Details:", foundations); // Detailed view

        if (totalFoundations === 52) {
            document.getElementById('game-over').classList.remove('hidden');
            console.log("Game won!");
        }
    }

    /**
     * Restart the game by resetting all state variables and reinitializing
     */
    document.getElementById('restart-button').addEventListener('click', () => {
        // Reset all game data
        deck = [];
        stock = [];
        waste = [];
        foundations = [[], [], [], []];
        tableau = [[], [], [], [], [], [], []];
        dragData = null;

        // Hide game over modal
        document.getElementById('game-over').classList.add('hidden');

        // Re-initialize game
        initGame();

        // Debugging: Log the state after restart
        console.log("Game restarted. Foundations:", foundations);
    });

    // Add this function after the addCardEventListeners function
    function addPileEventListeners() {
        document.querySelectorAll('.pile').forEach(pile => {
            pile.addEventListener('dragover', handleDragOver);
            pile.addEventListener('drop', handleDrop);
        });
    }

    // Add this function after addPileEventListeners
    function addGameAreaEventListener() {
        const gameArea = document.querySelector('.game-area');
        console.log("Try addGameAreaEventListener with gameArea:", gameArea);
        if (gameArea) {
            gameArea.addEventListener('dragover', handleDragOver);
            gameArea.addEventListener('drop', handleInvalidDrop);
        }
    }

    // Add this function to handle drops on invalid areas
    function handleInvalidDrop(e) {
        e.preventDefault();
        console.log("Invalid drop area");
        // Reset the drag operation
        dragData = null;
        render();
    }

    // Initialize the game on page load
    initGame();
});
