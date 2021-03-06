//Select main game area
const container = document.querySelector(".container");
let conDim = container.getBoundingClientRect();

//create start message
const gameover = document.createElement("div");
gameover.textContent = "Click To Start Game";
gameover.style.position = "absolute";
gameover.style.color = "white";
gameover.style.lineHeight = "60px";
gameover.style.height = "250px";
gameover.style.textAlign = "center";
gameover.style.fontSize = "3em";
gameover.style.textTransform = "uppercase";
gameover.style.backgroundColor = "red";
gameover.style.width = "100%";
gameover.addEventListener("click", startGame);
container.appendChild(gameover);

//create and style ball, add to game
const ball = document.createElement("div");
ball.style.position = "absolute";
ball.style.width = "20px";
ball.style.height = "20px";
ball.style.backgroundColor = "green";
ball.style.borderRadius = "25px";
ball.style.top = "70%";
ball.style.left = "50%";
ball.style.display = "none";
container.appendChild(ball);

//create and style paddle, add to game
const paddle = document.createElement("div");
paddle.style.position = "absolute";
paddle.style.backgroundColor = "white";
paddle.style.backgroundColor = "white";
paddle.style.objectFit = "contain";
paddle.style.height = "25px";
paddle.style.width = "120px";
paddle.style.borderRadius = "25px";
paddle.style.bottom = "30px";
paddle.style.left = "50%";
container.appendChild(paddle);

//listen for key presses to move the paddle
document.addEventListener("keydown", function (e) {
    if (e.keyCode === 37) paddle.left = true;
    if (e.keyCode === 39) paddle.right = true;
    //wait for player to hit up arrow to launch
    if (e.keyCode === 38 && !player.inPlay) player.inPlay = true;
});
document.addEventListener("keyup", function (e) {
    if (e.keyCode === 37) paddle.left = false;
    if (e.keyCode === 39) paddle.right = false;
});

const player = {
    gameover: true,
};

//setting up game parameters
function startGame() {
    if (player.gameover) {
        player.gameover = false;
        //remove the start message when game starts
        gameover.style.display = "none";
        //set score and lives
        player.score = 0;
        player.lives = 5;
        player.inPlay = false;
        //set initial ball positioning
        ball.style.display = "block";
        ball.style.left = paddle.offsetLeft + 50 + "px";
        ball.style.top = paddle.offsetTop - 30 + "px";
        player.ballDir = [2, -5];
        //set number of bricks
        player.num = 30;
        setupBricks(player.num);
        scoreUpdater();
        player.ani = window.requestAnimationFrame(update);
    }
}

//create bricks for game
function setupBricks(num) {
    let row = {
        x: (conDim.width % 100) / 2,
        y: 50,
    };
    let skip = false;
    for (let x = 0; x < num; x++) {
        //move to next row if brick will extend beyond game
        if (row.x > conDim.width - 100) {
            row.y += 50;
            if (row.y > conDim.height / 2) {
                skip = true;
            }
            row.x = (conDim.width % 100) / 2;
        }
        row.count = x;
        if (!skip) {
            createBrick(row);
        }
        row.x += 100;
    }
}

function createBrick(pos) {
    const div = document.createElement("div");
    div.setAttribute("class", "brick");
    div.style.backgroundColor = rColor();
    div.textContent = pos.count + 1;
    div.style.backgroundSize = "91px 40px";
    div.style.objectFit = "contain";
    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";
    container.appendChild(div);
}

//collision detection
function isCollide(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !(
        aRect.right < bRect.left ||
        aRect.left > bRect.right ||
        aRect.bottom < bRect.top ||
        aRect.top > bRect.bottom
    );
}

//pick random bg color
function rColor() {
    return "#" + Math.random().toString(16).substr(-6);
}

//score and player lives updating function
function scoreUpdater() {
    document.querySelector(".score").textContent = player.score;
    document.querySelector(".lives").textContent = player.lives;
}

//paddle movement controls
function update() {
    if (!player.gameover) {
        let pCurrent = paddle.offsetLeft;
        if (paddle.left && pCurrent > 0) {
            pCurrent -= 5;
        }
        if (paddle.right && pCurrent < conDim.width - paddle.offsetWidth) {
            pCurrent += 5;
        }
        paddle.style.left = pCurrent + "px";
        if (!player.inPlay) {
            waitingOnPaddle();
        } else {
            moveBall();
        }
        player.ani = window.requestAnimationFrame(update);
    }
}

function waitingOnPaddle() {
    //place ball on paddle to launch
    ball.style.top = paddle.offsetTop - 22 + "px";
    ball.style.left = paddle.offsetLeft + 40 + "px";
}

function fallOff() {
    //remove player life
    player.lives--;
    //end game if no lives left
    if (player.lives < 0) {
        endGame();
        player.lives = 0;
    }
    scoreUpdater();
    stopper();
}

function endGame() {
    gameover.style.display = "block";
    gameover.innerHTML = `Game Over<br>Your score: ${player.score}`;
    player.gameover = true;
    ball.style.display = "none";
    let tempBricks = document.querySelectorAll(".brick");
    for (let tBrick of tempBricks) {
        tBrick.parentNode.removeChild(tBrick);
    }
    window.cancelAnimationFrame(player.ani);
}

function stopper() {
    player.inPlay = false;
    player.ballDir[(0, -5)];
    waitingOnPaddle();
    window.cancelAnimationFrame(player.ani);
}

function moveBall() {
    //set position of ball
    let posBall = {
        x: ball.offsetLeft,
        y: ball.offsetTop,
    };
    //check if ball reaches edge of screen, change direction
    if (posBall.y > conDim.height - 20 || posBall.y < 0) {
        if (posBall.y > conDim.height - 20) {
            fallOff();
        } else {
            player.ballDir[1] *= -1;
        }
    }
    if (posBall.x > conDim.width - 20 || posBall.x < 0) {
        player.ballDir[0] *= -1;
    }
    //check if paddle and ball collide
    if (isCollide(paddle, ball)) {
        let temp =
            (posBall.x - paddle.offsetLeft - paddle.offsetWidth / 2) / 10;
        player.ballDir[0] = temp;
        player.ballDir[1] *= -1;
    }
    let bricks = document.querySelectorAll(".brick");
    //check if all bricks are destroyed
    if (bricks.length == 0 && !player.gameover) {
        stopper();
        setupBricks(player.num);
    }
    //remove bricks that are hit
    for (let tBrick of bricks) {
        if (isCollide(tBrick, ball)) {
            player.ballDir[1] *= -1;
            tBrick.parentNode.removeChild(tBrick);
            player.score++;
            scoreUpdater();
        }
    }
    posBall.y += player.ballDir[1];
    posBall.x += player.ballDir[0];
    ball.style.top = posBall.y + "px";
    ball.style.left = posBall.x + "px";
}
