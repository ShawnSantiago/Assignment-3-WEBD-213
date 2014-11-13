// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    //console.log("requestAnimFrame");
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// var wallStyle = "../assets/wall.png";


///////////////////

// Get the canvas and then the context
var canvas = document.getElementById("appCanvas");
var ctx = canvas.getContext("2d");


///////////////////


// Define our global vars
var CONST = {
    MOVE_SPEED: 5.0, // The player's movement speed, in pixels
    cat_SPEED: 3.0,
    NUM_groupOfCats: 6,
    MOUSE_SPEED: 3.0,
    NUM_MICE: 8
}; // For constants, vars that never change

/// SETUP AUDIO FILES ////

// Music
var audioBGMusic = new Audio();

audioBGMusic.src = 'assets/WiiStoreMusic.mp3';

audioBGMusic.src = 'assets/WiiStoreMusic.mp3';

audioBGMusic.loop = true; // we want the background music to loop

// SFX
var sfx = {};

sfx.meow = new Audio();
sfx.meow.src = 'assets/death4.mp3';

sfx.eat = new Audio();
sfx.eat.src = 'assets/eating1.mp3';

sfx.squeak = new Audio();
sfx.squeak.src = 'assets/eating4.mp3';
var player;
var groupOfCats = [];// new Array();
var mice = [];
var lastTime; // Used for deltaTime
var score = 0; // Num eaten groupOfCats
var gameOver = false;
var seconds = 31;
var temp;
var stopCountDown;//Used to start/stop the timer

function countdown() {

    if (seconds <= 0) {
      playerDied()
      return;
    }

    seconds--;
    temp = document.getElementById('countdown');
    temp.innerHTML = seconds;
    //timeoutMyOswego = setTimeout(countdown, 1000);
    stopCountDown = setTimeout(countdown, 1000);
} 

countdown();

function stopTimer() { //Stops the timer, is called in the playerDied() function

    clearTimeout(stopCountDown);

}



random = Math.random()* 800;
random2 = Math.random()* 300;

cheeseItem = {
    x: random,
    y: random2,
    width: 32,
    height:32,  
    hidden:true                                                                                                 
}



var walls = [];

var img = document.getElementById("lamp")
var pat = ctx.createPattern(img, "repeat");
ctx.fillStyle = pat;
walls.push(new Shape(0, 100, 50 ,500 ,pat));
walls.push(new Shape(200, 100, 50 ,300 ,pat));//wall 1
walls.push(new Shape(400, 0, 50, 200, pat));//wall 2
walls.push(new Shape(200, 500, 250 ,25 ,pat));
walls.push(new Shape(400, 300, 50, 200, pat));//wall 3
//walls.push(new Shape(600, 200, 50, 500, pat));//wall 4
walls.push(new Shape(800, 70, 50, 200, pat));//wall 5
walls.push(new Shape(800, 400, 50, 200, pat));//wall 6
walls.push(new Shape(400, 300, 200, 25, pat));//wall 7
walls.push(new Shape(200, 200, 200, 25, pat));
walls.push(new Shape(800, 250, 300, 25, pat));





// Variables to hold whether keys are pressed or not
// true means down.
// [Up, Right, Down, Left] 
var dirKeysDown = [false, false, false, false];
// Define the array indexes for dirKeysDown
// for easy reference ltter
CONST.KEY = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};
var spaceKeyDown = false;

///////////////////


// Load assets

var animalSpriteSheet = new Image();
var cheese = new Image();
var characerSpriteSheet = new Image();
cheese.onload = function() {
    // Setup the game    
    init()
}
animalSpriteSheet.onload = function() {
    
}
characerSpriteSheet.onload = function() {
    
}
animalSpriteSheet.src = 'assets/food_sheet.png';
cheese.src = 'assets/I_C_Cheese.png';
characerSpriteSheet.src = 'assets/characterSpriteSheet.png'

// Setup Audio only once the page has loaded
function SetupAudio() {
   
    // Setup the audio control buttons
    $('#volUp').click(volumeUp);
    $('#volDown').click(volumeDown);
    $('#mute').click(volumeMute);

    // Start playing the background music immediately

    audioBGMusic.play();
}

function volumeUp() { 

    var newVolume = volume + CONST.VOL_CHANGE;

    // Volume cannot be larger than 1
    if(newVolume > 1.0)
        newVolume = 1.0;

    audioBGMusic.volume = newVolume;
    sfx.meow.volume     = newVolume;
    sfx.eat.volume      = newVolume;
    sfx.squeak.volume   = newVolume;

     volume = newVolume;
}

function volumeDown() {
   
    var newVolume = volume - CONST.VOL_CHANGE;

    // Volume cannot be less than 0
    if(newVolume < 0)
        newVolume = 0;

    audioBGMusic.volume = newVolume;
    sfx.meow.volume     = newVolume;
    sfx.eat.volume      = newVolume;
    sfx.squeak.volume   = newVolume;

    volume = newVolume;
}

function volumeMute() {
   

    if(!audioBGMusic.muted) {
        $('#mute').css({ opacity: 1 });;
        audioBGMusic.muted = true;
        sfx.meow.muted     = true;
        sfx.eat.muted      = true;
        sfx.squeak.muted   = true;
    } else {
        $('#mute').css({ opacity: 0.5 });;
        audioBGMusic.muted = false;
        sfx.meow.muted     = false;
        sfx.eat.muted      = false;
        sfx.squeak.muted   = false;
    }
}

// Simple function to make it easy to play the sfx audio files.
// Incase we want to handle them differently later, mute or change a name.
function PlaySFX(sfxName) {
    sfx[sfxName].play();
}


///////////////////

// Setup the game and start the main loop
function init() {
    SetupAudio();
    // Play a meow, the cat is hungry!
    player = new Player(characerSpriteSheet, 0, 0, 64, 64);

    for(var c=0; c<CONST.NUM_groupOfCats; c++) {
        groupOfCats[c] = new cat(animalSpriteSheet);
        groupOfCats[c].x = canvas.width/2.4; // ------spawn location
        groupOfCats[c].y = canvas.height/3.7;
    }

    for(var m=0; m<CONST.NUM_MICE; m++) {
        mice[m] = new Mouse(animalSpriteSheet);
        mice[m].x = canvas.width/1.5;
        mice[m].y = canvas.height/2;
    }


    // Define immediately before calling main
    lastTime = Date.now();
    mainLoop(); // Start the game
}

///////////////////

// The main loop, this gets called every anim frame
function mainLoop(currentTime) {
    // Keep track of delta time (dt)
    // dt is the time elapsed between frames
    currentTime = Date.now();
    var dt = (currentTime - lastTime) / 1000.0;
    
    
    update(dt);

    render();   
   

    // Update the lastTime to the current time
    lastTime = currentTime;
    // Call main again (forever!)
    if(!gameOver){
        requestAnimFrame(mainLoop);
    }

}



// Make all draw calls within this func.
// Don't need to pass ctx here because its in scope for this func (global)
function render() {
    // Clear our canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawCheckerboard();

    // Render groupOfCats underneath cat (in terms of layers)
    for(var c=0; c<CONST.NUM_groupOfCats; c++) {
        groupOfCats[c].render(ctx);
    }

    for(var m=0; m<CONST.NUM_MICE; m++) {
        mice[m].render(ctx);
    }
    // Render a wall
    ctx.save(); // Save context just incase, good habit incase we do some transforms

    for (var i in walls) {
        oRec = walls[i];
        ctx.fillStyle = oRec.fill;
        ctx.fillRect(oRec.x, oRec.y, oRec.width, oRec.height);

    }
    
    
    // ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    
    // ctx.fill();
    // ctx.restore();

    ctx.save(); // Save context just incase, good habit incase we do some transforms
    if (cheeseItem.hidden == true) {
        ctx.drawImage(
                cheese,
                // image file
                0,
                0,
                cheeseItem.width,
                cheeseItem.height,
                // canvas
                cheeseItem.x,
                cheeseItem.y,
                cheeseItem.width,
                cheeseItem.height);   
        ctx.restore();
    };

    // Render all sprites and any other draw functions
    player.render(ctx);

}
// draw canvas and border with colors
function drawCheckerboard() {
    ctx.save();

    ctx.strokeStyle = "#888";
    ctx.strokeRect(0,0,canvas.width,canvas.height)

    ctx.restore();
}


// Update values and state changes in here
function update(dt) {


    // Update sprites and other values here
   
    /////////////////////////////
    // Update player

    var newPlayerX = player.x;
    var newPlayerY = player.y;
    
    var maxX = canvas.width - player.width;
    var maxY = canvas.height - player.height;

    // Note: y increases downward, so to
    // move up we reduce the y
    if(dirKeysDown[CONST.KEY.UP]) {
        newPlayerY -= CONST.MOVE_SPEED;
        if(newPlayerY < 0)
            newPlayerY = 0;

         player.dir = player.facing.up;
    } 

    if(dirKeysDown[CONST.KEY.DOWN]) {
        newPlayerY += CONST.MOVE_SPEED;
        // Want to make sure player doesn't go off screen
        // so adjust for dimensions

        if(newPlayerY > maxY)
            newPlayerY = maxY;

         player.dir = player.facing.down;
    }

    if(dirKeysDown[CONST.KEY.RIGHT]) {
        newPlayerX += CONST.MOVE_SPEED;
        // Want to make sure player doesn't go off screen
        // so adjust for dimensions
        if(newPlayerX > maxX)
            newPlayerX = maxX;

         player.dir = player.facing.right;
    }

    if(dirKeysDown[CONST.KEY.LEFT]) {
        newPlayerX -= CONST.MOVE_SPEED;

        if(newPlayerX < 0)
            newPlayerX = 0;

        player.dir = player.facing.left;
    }

    


    // Now we check to see if the player is moving or now
    // and set the idle and new positions

  
    for (var i = 0; i < walls.length; i++) {
    
        if(Utils.intersects(newPlayerX, newPlayerY, player.width, player.height, walls[i].x, walls[i].y, walls[i].width, walls[i].height)) {
            // Reset new position so player doesn't move (they can't move into a wall)
            newPlayerX = player.x;
            newPlayerY = player.y;
        }
    }

    if(player.x == newPlayerX && player.y ==  newPlayerY ) {
        player.idle = true;
    } else {


        player.idle = false;
        player.x = newPlayerX;
        player.y = newPlayerY;
    }
    if (player.died == true) {
        player.dir = player.facing.died;
        console.log(player.died);
    };

    player.update(dt);


    /////////////////////////////
    // Update groupOfCats

    var newcatX, newcatY;
    for(var c=0; c<CONST.NUM_groupOfCats; c++) {

        // Get the initial position for this updates
        newcatX = groupOfCats[c].x;
        newcatY = groupOfCats[c].y;

        // We want to figure out if the cat is 
        // going to move in a new direction first
        groupOfCats[c].updateDirection(dt);

        // Then we increment in that direction
        if(groupOfCats[c].dir == 0) { // Down (+y)
            newcatY += CONST.cat_SPEED;
        } else if(groupOfCats[c].dir == 1) { // Left (-x)
            newcatX -= CONST.cat_SPEED;
        } else if(groupOfCats[c].dir == 2) { // Right (+x)
            newcatX += CONST.cat_SPEED;
        } else if(groupOfCats[c].dir == 3) { // Up (-y)
            newcatY -= CONST.cat_SPEED;
        }

        // And just before updating the sprite, we
        // make sure the cat didn't go off screen...        
        // Do some boundary checks incase
        // update put the cat out of bounds.
        // NOTE: We couldn't do this inside the cat obj without having to pass boundaries to the cat.
        if(newcatX <= 0)
            newcatX = 0;
        else if(newcatX >= maxX) // The maxX for player and cat are equal, they have same size sprites
            newcatX = maxX;

        if(newcatY <= 0)
            newcatY = 0;
        else if(newcatY >= maxY) // The maxY for player and cat are equal, they have same size sprites
            newcatY = maxY;
        for (var i = 0; i < walls.length; i++) {
    
            if(Utils.intersects(newcatX, newcatY, groupOfCats[c].width, groupOfCats[c].height, walls[i].x, walls[i].y, walls[i].width, walls[i].height)) {
                // Reset new position so player doesn't move (they can't move into a wall)
                
                newcatX = groupOfCats[c].x;
                newcatY = groupOfCats[c].y;
                break
            } 
        }
       
        groupOfCats[c].x = newcatX;
        groupOfCats[c].y = newcatY;
              
        // Finally do the actual update.
        groupOfCats[c].update(dt);

        // If cat and cat are colliding, cat dead.
        if(groupOfCats[c].intersectsWith(player.x, player.y, player.width, player.height)) {
            // Deleted all inside, and removed alive stuff
            
            playerDied();
          

        } else if(player.intersectsWith(cheeseItem.x, cheeseItem.y, cheeseItem.width, cheeseItem.height)) {
            seconds+=10;

            gotCheese();
        }

    }

    var newMouseX, newMouseY;
    for(var m=0; m<CONST.NUM_MICE; m++) {

        // Get the initial position for this updates
        newMouseX = mice[m].x;
        newMouseY = mice[m].y;

        // We want to figure out if the mouse is 
        // going to move in a new direction first
        mice[m].updateDirection(dt);

        // Then we increment in that direction
        if(mice[m].dir == 0) { // Down (+y)
            newMouseY += CONST.MOUSE_SPEED;
        } else if(mice[m].dir == 1) { // Left (-x)
            newMouseX -= CONST.MOUSE_SPEED;
        } else if(mice[m].dir == 2) { // Right (+x)
            newMouseX += CONST.MOUSE_SPEED;
        } else if(mice[m].dir == 3) { // Up (-y)
            newMouseY -= CONST.MOUSE_SPEED;
        }

        // And just before updating the sprite, we
        // make sure the mouse didn't go off screen...        
        // Do some boundary checks incase
        // update put the mouse out of bounds.
        // NOTE: We couldn't do this inside the mouse obj without having to pass boundaries to the mouse.
        if(newMouseX <= 0)
            newMouseX = 0;
        else if(newMouseX >= maxX) // The maxX for player and mouse are equal, they have same size sprites
            newMouseX = maxX;

        if(newMouseY <= 0)
            newMouseY = 0;
        else if(newMouseY >= maxY) // The maxY for player and mouse are equal, they have same size sprites
            newMouseY = maxY;
        
        for (var i = 0; i < walls.length; i++) {
            
            if(Utils.intersects(newMouseX, newMouseY, mice[m].width, mice[m].height, walls[i].x, walls[i].y, walls[i].width, walls[i].height)) {
                // Reset new position so player doesn't move (they can't move into a wall)
                newMouseX = mice[m].x;
                newMouseY = mice[m].y;
                break
            } 
        }
        mice[m].x = newMouseX;
        mice[m].y = newMouseY;

        // If mouse and cat are colliding, mouse dead.
        if(mice[m].alive && mice[m].intersectsWith(player.x, player.y, player.width, player.height)) {
            PlaySFX("eat");
            mice[m].alive = false;
            updateScore();
        }

        // Finally do the actual update.
        mice[m].update(dt);
    }

}


// If the score gets updated
function updateScore() {
    score++;
    $('.score').html(score);
    // Check if game ended?
    if(score == CONST.NUM_MICE) {
        // Player finished the game
        //$('.gameOverSuccess').show();

        $('.gameOverSuccess').html("You Win").addClass('reveal');
        gameOver = true;  

        if (gameOver = true) {
            stopTimer();
        }
    }
}

function playerDied() {
    $('.gameOverSuccess').html("Try Again").addClass('reveal'); 
    PlaySFX("meow");
    player.kill();
    gameOver = true;
    if (gameOver = true) {
        stopTimer();
    }
}

function gotCheese() {
    PlaySFX("squeak");
    cheeseItem = {
                x: 1000,
                y: 1000
            }     
    cheeseItem.hidden = false;   
    random = Math.random()* 900;
    random2 = Math.random()* 300;

    setTimeout(function(){
            cheeseItem = {
            x: random,
            y: random2, 
            width: 32,
            height:32,
            hidden : true
        }
    
    }, 5000);
    
}


 


document.addEventListener('keydown', function(e) {
    var code = e.keyCode;
   
    switch(code) {   
        case 32: // Space
            spaceKeyDown = true;
            break;

        case 65: // Left
            dirKeysDown[CONST.KEY.LEFT] = true;           
            break;
        case 87: // Up
            dirKeysDown[CONST.KEY.UP] = true;
            break;
        case 68: // Right
             dirKeysDown[CONST.KEY.RIGHT] = true;            
            break;
        case 83: // Down
            dirKeysDown[CONST.KEY.DOWN] = true;          
            break;

        default: // Do nothing

        // NOTE: To track keyboard letters, you can use
        // the following and check the letters...
        // convert ASCII codes to letters:
        // var letter = String.fromCharCode(code);
           
    }
});

document.addEventListener('keyup', function(e) {
    var code = e.keyCode;
   
    switch(code) {   
        case 32: // Space
            spaceKeyDown = false;
            break;

        case 65: // Left
            dirKeysDown[CONST.KEY.LEFT] = false;           
            break;
        case 87: // Up
            dirKeysDown[CONST.KEY.UP] = false;
            break;
        case 68: // Righta
             dirKeysDown[CONST.KEY.RIGHT] = false;            
            break;
        case 83: // Down
            dirKeysDown[CONST.KEY.DOWN] = false;          
            break;

        default: // Do nothing.
    }
});



