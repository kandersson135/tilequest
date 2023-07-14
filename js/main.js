$(document).ready(function() {
  let level = 1;
  const boardSize = 15; // Fixed number of square tiles in each row
  let numEnemies = 3 + level; // Number of enemies on the board
  let maxLives = 5; // Maximum lives for the hero

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

  // Display current level
  $('#level-display').text("Level: " + level + "/10");

  // Handle tile click event
  $('.tile').click(function() {
      const clickedRow = $(this).data('row');
      const clickedCol = $(this).data('col');
      const newPosition = { row: clickedRow, col: clickedCol };

      if (isValidPosition(newPosition) && isAdjacentPosition(newPosition, heroPosition)) {
          heroPosition = newPosition;
          updateHeroPosition();
          moveEnemiesCloser();
          stepSound.play();

          checkCollisions();
        } else if (isInRangeOfAttack(newPosition, heroPosition)) {
          $('.hero').css('background-image','url(img/hero-attack.gif)');
          $('.hero').css('background-size','auto');

  			setTimeout(function() {
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

    function updateHeroPosition() {
        $('.hero').remove();
        $(`.tile[data-row=${heroPosition.row}][data-col=${heroPosition.col}]`).append('<div class="hero"></div>');
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
    }

    function getNewPosition(currentPosition, targetPosition) {
        const rowDiff = targetPosition.row - currentPosition.row;
        const colDiff = targetPosition.col - currentPosition.col;

        const newRow = currentPosition.row + Math.sign(rowDiff);
        const newCol = currentPosition.col + Math.sign(colDiff);
        return { row: newRow, col: newCol };
    }

    function checkCollisions() {
        // Check if the hero and any enemy occupy the same position
        enemies.forEach(function(enemy) {
            if (enemy.row === heroPosition.row && enemy.col === heroPosition.col) {
                lives--;
                updateLives();
				        hurtSound.play();

                if (lives <= 0) {
                    // Game over condition
                    //alert('Game over!');

          					swal({
          					  title: "Game over!",
          					  text: "You lost all your lives :/",
          					});

                    resetGame();
                } else {
                    // Remove the enemy if it catches the hero
                    const index = enemies.findIndex(e => e.row === enemy.row && e.col === enemy.col);
                    if (index !== -1) {
                        enemies.splice(index, 1);
                        $(`.tile[data-row=${enemy.row}][data-col=${enemy.col}] .enemy`).remove();
                    }
                }
            }
        });

        if (heroPosition.row === boardSize - 1 && heroPosition.col === boardSize - 1) {
            // Level up condition
            if (level === 10) {
                // Final level completed
                //alert('Congratulations! You completed all levels!');
          			swal({
          			  title: "Good job!",
          			  text: "You completed all levels!",
          			});
                resetGame();
            } else {
                // Level up
                //level++;
                //numEnemies = 3 + level;
                //alert(`Level ${level} completed!`);

                levelUpSound.play();
                levelUp();
            }
        }
    }

    function killEnemy(position) {
        const index = enemies.findIndex(enemy => enemy.row === position.row && enemy.col === position.col);
        if (index !== -1) {
            enemies.splice(index, 1);
            $(`.tile[data-row=${position.row}][data-col=${position.col}] .enemy`).remove();
        }
    }

    function updateLives() {
        $('.life-container').empty();
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
        if (level % 2 === 0) {
            numEnemies += 1; // Add an extra enemy every other level
        }

        //lives = maxLives;
        updateLives();
        heroPosition = { row: 0, col: 0 };
        enemies = [];

        $('.tile').empty();

        $('#level-display').text("Level: " + level + "/10");

        // Generate enemies at random positions
        generateEnemies();

        updateHeroPosition();
    }

    function resetGame() {
        level = 1;
        numEnemies = 3 + level;
        lives = maxLives;
        updateLives();
        heroPosition = { row: 0, col: 0 };
        enemies = [];

        $('.tile').empty();

        $('#level-display').text("Level: " + level + "/10");

        // Generate enemies at random positions
        generateEnemies();

        updateHeroPosition();
    }
});
