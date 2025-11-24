$(document).ready(function() {
  let level = 1;
  const boardSize = 15; // Fixed number of square tiles in each row
  let numEnemies = 3 + level; // Number of enemies on the board
  let maxLives = 5; // Maximum lives for the hero
  const maxEnemies = 12;

  let heroPosition = { row: 0, col: 0 }; // Initial hero position
  let lives = maxLives; // Current number of lives
  let enemies = []; // Array to store enemy positions

	let swordSound = new Audio("audio/sword-attack.wav");
	let stepSound = new Audio("audio/step.wav");
	let hurtSound = new Audio("audio/hurt.mp3");
	let levelUpSound = new Audio("audio/level-up.wav");

	let enemyImages = [
		'url(img/green-slime.gif)',
		'url(img/pink-slime.gif)',
		'url(img/yellow-slime.gif)',
		'url(img/white-slime.gif)',
    'url(img/green-slime.gif)',
		'url(img/pink-slime.gif)',
		'url(img/yellow-slime.gif)',
		'url(img/white-slime.gif)',
    'url(img/green-slime.gif)',
		'url(img/pink-slime.gif)'
	];

  let highScores = [
  ];

	swordSound.volume = 0.3;
	stepSound.volume = 0.3;
	hurtSound.volume = 0.3;
	levelUpSound.volume = 0.1;

  // Generate square tiles
  generateGameBoard();

  // Generate enemies at random positions
  generateEnemies();

  // Add hero to the initial position
  updateHeroPosition();

  // Generate lives
  updateLives();

  // Display hi-score list
  displayHighScores();

  // Display current level
  $('#level-display').text("Level: " + level);

  // Handle tile click event
  $('.tile').click(function() {
    const clickedRow = $(this).data('row');
    const clickedCol = $(this).data('col');
    const newPosition = { row: clickedRow, col: clickedCol };

    if (isValidPosition(newPosition) && isAdjacentPosition(newPosition, heroPosition)) {
      heroPosition = newPosition;
      updateHeroPosition();
      moveEnemiesCloser();
      stepSound.currentTime = 0;
      stepSound.play();

      checkCollisions();
      } else if (isInRangeOfAttack(newPosition, heroPosition)) {
        $('.hero').css('background-image','url(img/hero-attack.gif)');
        $('.hero').css('background-size','auto');

			setTimeout(function() {
        swordSound.currentTime = 0;
				swordSound.play();
			}, 200);

			setTimeout(function() {
				$('.hero').css('background-image','url(img/hero-idle.gif)');

				killEnemy(newPosition);
			}, 600);
    }
  });

  function generateGameBoard() {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        let tileHTML = `<div class="tile" data-row="${row}" data-col="${col}"></div>`;
        $('.game-board').append(tileHTML);
      }
    }
  }

	function getEnemyImage(level) {
		let index = level - 1;

		if (index >= 0 && index < enemyImages.length) {
			return enemyImages[index];
		}

		// Return a default image if the level is out of range
		return 'url(img/green-slime.gif)';
	}

  function generateEnemies() {
    for (let i = 0; i < numEnemies; i++) {
      generateUniqueEnemy();
    }
  }

  function isValidPosition(position) {
    return position.row >= 0 && position.row < boardSize && position.col >= 0 && position.col < boardSize;
  }

  function isAdjacentPosition(position1, position2) {
    const rowDiff = Math.abs(position1.row - position2.row);
    const colDiff = Math.abs(position1.col - position2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  function isInRangeOfAttack(position1, position2) {
    const rowDiff = Math.abs(position1.row - position2.row);
    const colDiff = Math.abs(position1.col - position2.col);
    return (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2);
  }

  function highlightMovesAndAttacks() {
    $('.tile').removeClass('move-target');

    // Tillåtna rörelser
    $('.tile').each(function () {
      const row = $(this).data('row');
      const col = $(this).data('col');
      const pos = { row, col };

      if (isAdjacentPosition(pos, heroPosition)) {
        $(this).addClass('move-target');
      }
    });
  }

  function updateEnemyHighlights() {
    // Ta bort highlight på alla först
    $('.enemy').removeClass('enemy-in-range');

    // Gå igenom alla fiender och kolla vilka som är i range
    enemies.forEach(enemy => {
      const enemyPos = { row: enemy.row, col: enemy.col };

      if (isInRangeOfAttack(enemyPos, heroPosition)) {
        $(`.tile[data-row=${enemy.row}][data-col=${enemy.col}] .enemy`)
          .addClass('enemy-in-range');
        }
    });
  }

  function updateHeroPosition() {
    $('.hero').remove();
    $(`.tile[data-row=${heroPosition.row}][data-col=${heroPosition.col}]`)
      .append('<div class="hero"></div>');
    updateEnemyHighlights();
    //highlightMovesAndAttacks();
  }

  function moveEnemiesCloser() {
    enemies.forEach(function(enemy, index) {
      const newPosition = getNewPosition(enemy, heroPosition);
      const currentLevelEnemyImage = getEnemyImage(level);
        if (isValidPosition(newPosition)) {
          enemies[index] = newPosition;
          $(`.tile[data-row=${enemy.row}][data-col=${enemy.col}] .enemy`).remove();
          $(`.tile[data-row=${newPosition.row}][data-col=${newPosition.col}]`).append('<div class="enemy" style="background-image:' + currentLevelEnemyImage + ';"></div>');
        }
      });

      updateEnemyHighlights();
  }

  function getNewPosition(currentPosition, targetPosition) {
    const rowDiff = targetPosition.row - currentPosition.row;
    const colDiff = targetPosition.col - currentPosition.col;

    const newRow = currentPosition.row + Math.sign(rowDiff);
    const newCol = currentPosition.col + Math.sign(colDiff);
    return { row: newRow, col: newCol };
  }

  // Function to display high scores in a list
  function displayHighScores() {
    const list = document.getElementById('hiscore-list');

    // Clear existing list items
    while (list.firstChild) {
      list.firstChild.remove();
    }

    // Retrieve high scores from local storage
    const savedHighScores = JSON.parse(localStorage.getItem('tq-highScores'));

    if (savedHighScores) {
      highScores = savedHighScores;

      // Iterate through high scores and create list items
      highScores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${score.name} - Lv. ${score.score}`;
        list.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = "Leaderboard is empty";
      list.appendChild(listItem);
    }
  }

  function checkCollisions() {
    // Check if the hero and any enemy occupy the same position
    enemies.forEach(function(enemy) {
      if (enemy.row === heroPosition.row && enemy.col === heroPosition.col) {
        lives--;
        updateLives();
        hurtSound.play();

        $('.hero').addClass('hit');
        setTimeout(() => $('.hero').removeClass('hit'), 300);

        if (lives <= 0) {
          // Game over
          setTimeout(function(){
            // Prompt the player to enter their name
            const playerName = prompt('Enter your name:');

            // Only proceed if the player entered a name
            if (playerName) {
              // Create a new object with the player's name and score
              const playerScore = { name: playerName, score: level };

              // Add the player's score to the high scores array
              highScores.push(playerScore);

              // Sort the high scores array
              highScores.sort((a, b) => b.score - a.score);

              // Limit the number of high scores
              const maxHighScores = 10;
              highScores = highScores.slice(0, maxHighScores);

              // Save the updated high scores
              localStorage.setItem('tq-highScores', JSON.stringify(highScores));

              window.location.reload();
            } else {
              window.location.reload();
            }
          }, 800);

        } else {
          // Remove the enemy if it catches the hero
          const index = enemies.findIndex(e => e.row === enemy.row && e.col === enemy.col);
          if (index !== -1) {
            enemies.splice(index, 1);
            $(`.tile[data-row=${enemy.row}][data-col=${enemy.col}] .enemy`).remove();
          }

          if (allEnemiesDead()) {
            levelUpSound.play();

            const exitRow = boardSize - 1;
            const exitCol = boardSize - 1;
            $(`.tile[data-row=${exitRow}][data-col=${exitCol}]`).addClass('exit-active');
          }
        }
      }
    });
  }

  function allEnemiesDead() {
    return enemies.length === 0;
  }

  function killEnemy(position) {
    const index = enemies.findIndex(enemy => enemy.row === position.row && enemy.col === position.col);
    if (index !== -1) {
      enemies.splice(index, 1);
      $(`.tile[data-row=${position.row}][data-col=${position.col}] .enemy`).remove();
    }

    // När alla fiender är döda kan vi t.ex. highlighta utgången:
    if (allEnemiesDead()) {
      levelUpSound.play();

      const exitRow = boardSize - 1;
      const exitCol = boardSize - 1;
      $(`.tile[data-row=${exitRow}][data-col=${exitCol}]`).addClass('exit-active');
    }
  }

  function updateLives() {
    $('.life-container').empty();
    $('.life-container').prepend('Lives: ');
    for (let i = 0; i < lives; i++) {
      $('.life-container').append('<div class="life-icon"></div>');
    }
  }

  function generateUniqueEnemy() {
    let enemy;
    do {
      enemy = generateRandomPosition();
    } while (
      enemies.some(e => e.row === enemy.row && e.col === enemy.col) ||
      (enemy.row === heroPosition.row && enemy.col === heroPosition.col)
    );

    const currentLevelEnemyImage = getEnemyImage(level);

    enemies.push(enemy);
    $(`.tile[data-row=${enemy.row}][data-col=${enemy.col}]`).append('<div class="enemy" style="background-image:' + currentLevelEnemyImage + ';"></div>');
  }

  function generateRandomPosition() {
    let row = Math.floor(Math.random() * boardSize);
    let col = Math.floor(Math.random() * boardSize);
    return { row: row, col: col };
  }

  function levelUp() {
    level++;
		if (level % 5 === 0) {
		lives++; // Add an extra heart every 5th level
		updateLives();
		}

    //numEnemies = 3 + level;
    if (level % 2 === 0 && numEnemies < maxEnemies) {
        numEnemies += 1;
    }

    //lives = maxLives;
    updateLives();
    heroPosition = { row: 0, col: 0 };
    enemies = [];

    $('.tile').empty();

    $('#level-display').text("Level: " + level);

    // Generate enemies at random positions
    generateEnemies();

    updateHeroPosition();
  }

  // Markera utgången (valfritt om du redan gör det i HTML/CSS)
  const exitRow = boardSize - 1;
  const exitCol = boardSize - 1;
  const $exitTile = $(`.tile[data-row=${exitRow}][data-col=${exitCol}]`);
  $exitTile.addClass('exit'); // så du kan styla den i CSS

  // Klick på utgången
  $exitTile.on('click', function () {
    if (!allEnemiesDead()) {
      return;
    }

    // Teleportera hjälten till utgången
    heroPosition = { row: exitRow, col: exitCol };
    updateHeroPosition();

    // Ta bort glowet direkt
    $exitTile.removeClass('exit-active');

    // Vänta en kort stund, sen levla upp
    setTimeout(() => {
      //levelUpSound.play();
      levelUp();
    }, 300); // 300 ms = 0.3 sek, justera efter smak
  });

  function resetGame() {
    level = 1;
    numEnemies = 3 + level;
    lives = maxLives;
    updateLives();
    heroPosition = { row: 0, col: 0 };
    enemies = [];

    $('.tile').empty();

    $('#level-display').text("Level: " + level);

    // Generate enemies at random positions
    generateEnemies();

    updateHeroPosition();
  }

  // How-to-button
  $('#how-to-btn').click(function() {
    swal("How to play", "Play as the hero and try to escape all levels of the dungeon. Click on the tile next to the hero to move him there.\n\n  Everytime the hero makes a move, the enemies move one step closer to the hero. If an enemy is two tiles away from the hero, he can attack it by clicking it. \n\n Make your way through the enemies and try to beat all levels.");
  });
});
