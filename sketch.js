// variables to the game
var config;
var database;
var dataRegister = 0;
var findPositions = false;
var run = false;

var joystick;
var gamepadMode = false;

var gameState = 0;
var startState = 0;
var hostState = 1;
var guestState = 2;
var nameState = 3;
var lobbyState = 4;
var playState = 5;

var hostGame;
var joinGame;

var session_name, session_code;
var sessionName = "none";
var sessionCode = 0;

var createSession;
var joinSession;

var user_name;
var userName;
var join_game;

var playerCount = 1;
var player = [0,0,0,0];
var moveX, moveY;

var controlled_player = 0;

var a;
var p1X, p1Y, p2X, p2Y, p3X, p3Y, p4X, p4Y;

//setup for the game (will be reused multiple times for different game states)

function setup() {
    createCanvas(400,400);

    databasing();

    if(gameState === startState){
        hostGame = createButton('Create Session');
        hostGame.position(50, 200);

        joinGame = createButton('Join Session');
        joinGame.position(250, 200);

        hostGame.mousePressed(createGame);
        joinGame.mousePressed(findingGame)
    }else if(gameState === hostState){
        session_name = createInput('Session Name');
        session_name.position(25,200);

        session_code = createInput('Session Code');
        session_code.position(225, 200);

        createSession = createButton('Create Session');
        createSession.position(150, 300);

        createSession.mousePressed(creatingSession)
    }else if(gameState === guestState){
        session_name = createInput('Session Name');
        session_name.position(25,200);

        session_code = createInput('Session Code');
        session_code.position(225, 200);

        joinSession = createButton('Join Session');
        joinSession.position(150, 300);

        joinSession.mousePressed(findingSession);
    }else if(gameState === nameState){
        user_name = createInput('Enter Name');
        user_name.position(125, 200);

        join_game = createButton('Join Game');
        join_game.position(150, 350);

        join_game.mousePressed(add_player);
    }else if(gameState === lobbyState) {
        for(let i = 0; i<4; i++) {
            player[i] = createSprite(200,200,50,50);
        }

        joystick = createJoystick();
    if(!joystick.calibrated())
    joystick.calibrate(true);
    joystick.onButtonPressed(test);
    joystick.onButtonReleased(stop);
    joystick.onAxesPressed(test);
    joystick.onAxesReleased(stop);

        dataPositions();
    }

}

function draw() {
    //draws all the sprites and such in the game
    if(gameState === startState) {
        background("purple");
    }else if(gameState === hostState){
        background("green");
    }else if(gameState === guestState){
        background("blue");
    }else if(gameState === nameState){
        background("red");
    }else if(gameState === lobbyState) {
        background("black");
        playerMovement();
    }
    

    drawSprites();
}

//functions deticated to mechanics outside the firebase or actual game
function createGame() {
    gameState = hostState;
    hostGame.remove();
    joinGame.remove();
    setup();
    redraw();
}

function findingGame(){
    gameState = guestState;
    hostGame.remove();
    joinGame.remove();
    setup();
    redraw();
}

function creatingSession() {
    sessionName = session_name.value();
    sessionCode = session_code.value();
    loadSession_db();
}

function findingSession() {
    sessionName = session_name.value();
    sessionCode = session_code.value();
    findingSession_db();
}

function add_player() {
    userName = user_name.value();
    console.log(user_name.value());
    controlled_player = playerCount - 1;
    joiningGame();
}


//functions deticated to the actually game
function playerMovement() {
    if(gamepadMode === false) {
        if(keyDown("w")) {
            moveY = -1;
        }else if(keyDown("s")) {
            moveY = 1;
        }
    
        if(!(keyDown("w") || keyDown("s"))) {
            moveY = 0;
        }

        if(keyDown("a")) {
            moveX = -1;
        }else if(keyDown("d")) {
            moveX = 1;
        }
    
        if(!(keyDown("a") || keyDown("d"))) {
            moveX = 0;
        }
    }
    
        if(moveY === -1) {
            player[controlled_player].y -= 5;
            updatePosition();
        }else if(moveY === 1) {
            player[controlled_player].y += 5;
            updatePosition();
        }else {
            player[controlled_player].y += 0
        }
    
        if(moveX === -1) {
            player[controlled_player].x -= 5;
            updatePosition();
        }else if(moveX === 1) {
            player[controlled_player].x += 5;
            updatePosition();
        }else {
            player[controlled_player].x += 0;
        }

    camera.x = player[controlled_player].x;
    camera.y = player[controlled_player].y;

    player[0].x = p1X;
    player[0].y = p1Y;
    player[1].x = p2X;
    player[1].y = p2Y;
    player[2].x = p3X;
    player[2].y = p3Y;
    player[3].x = p4X;
    player[3].y = p4Y;
}

//functions made using firebase

function databasing() {
    //game database using Google Firebase
    if(dataRegister === 0) {
        config = {
            apiKey: "AIzaSyCcrIJ3LQ27roEgX_oPKQNeorA4-OOjRgs",
            authDomain: "bombad-jedi-demo.firebaseapp.com",
            databaseURL: "https://bombad-jedi-demo-default-rtdb.firebaseio.com",
            storageBucket: "bombad-jedi-demo.appspot.com",
            messagingSenderId: "953122821074",
        };
          firebase.initializeApp(config);
          database = firebase.database();

          dataRegister = 1;

          findPositions = true;
    }else {
        console.log("database already existing")
    }
}

function loadSession_db() {
    var sessionRef = database.ref(sessionName);
    var sessionData = {
        code: sessionCode,
        players: {
            playercount: 0,
            player1: {
                active: false,
                playerName: "",
                x: 200,
                y: 200
            },
            player2: {
                active: false,
                playerName: "",
                x: 200,
                y: 200
            },
            player3: {
                active: false,
                playerName: "",
                x: 200,
                y: 200
            },
            player4: {
                active: false,
                playerName: "",
                x: 200,
                y: 200
            }
        }
    }

    
    var result = sessionRef.update(sessionData, dataSent);
    console.log(result.key);

  function dataSent(err, status) {
    console.log(status);
  }

  gameState = nameState;
  session_name.remove();
  session_code.remove();
  createSession.remove();
  setup();
  redraw();
}

function findingSession_db(){
    let b;
    var sessionRef = database.ref(sessionName);
    sessionRef.on("value", function(x){
        b = x.val();

        playerCount = b.players.playercount
    })

    gameState = nameState;
    session_name.remove();
    session_code.remove();
    joinSession.remove();
  setup();
  redraw();
}

function joiningGame() {
    playerCount += 1;
    var playerRef = database.ref(sessionName+"/players/player"+(playerCount-1));
    var playerData = {
        playerName: userName,
        active: true

    }

    var playerCountRef = database.ref(sessionName+"/players");
    var playerCountData = {
        playercount: (playerCount-1)
    }

    var result = playerRef.update(playerData, dataSent);
    console.log(result.key);

    var result2 = playerCountRef.update(playerCountData, dataSent);
    console.log(result.key);

  function dataSent(err, status) {
    console.log(status);
  }

  gameState = lobbyState;
  user_name.remove();
  join_game.remove();
  setup();
  redraw();
   
}

function dataPositions() {
    // finding the positions of the other players
    if(findPositions === true) {
        var positionRef = database.ref(sessionName+"/players");
        positionRef.on("value", function(x){
            a=x.val();
            console.log(a.x);

            p1X = a.player1.x;
            p1Y = a.player1.y;
            p2X = a.player2.x;
            p2Y = a.player2.y;
            p3X = a.player3.x;
            p3Y = a.player3.y;
            p4X = a.player4.x;
            p4Y = a.player4.y;
        })

       run = true; 
    }
}

function updatePosition() {
    //updates the current position of the player to firebase
    var positionRef = database.ref(sessionName+"/players/player"+(controlled_player+1));
    var data = {
        x: player[controlled_player].x,
        y: player[controlled_player].y
    };

    var result = positionRef.update(data, dataSent);
    console.log(result.key);

  function dataSent(err, status) {
    console.log(status);
  }
}

// gamepad functions

function test(gamepadIndex) {
    console.log(gamepadIndex);
    var me = gamepadIndex;

    if(me.index === 9) {
        if(gamepadMode === false) {
            gamepadMode = true;
        }else {
            gamepadMode = false;
        }

        console.log(gamepadMode);
    }
    
    if(gamepadMode === true) {
        if(me.index === 1 && me.value === -1 && me.type === "axes") {
            moveY = -1;
          }else if(me.index === 1 && me.value === 1 && me.type === "axes"){
            moveY = 1;
          }else {
            moveY = 0;
          }
          
          if(me.index === 0 && me.value === -1 && me.type === "axes"){
            moveX = -1;
          }else if(me.index === 0 && me.value === 1 && me.type === "axes"){
            moveX = 1;
          }else {
            moveX = 0;
          }
          
          if(me.index === 12) {
            moveY = -1;
          }
          
          if(me.index === 13){
            moveY = 1;
          }
          
          if(me.index === 14){
            moveX = -1;
          }
          
          if(me.index === 15){
            moveX = 1;
          }
        }
}

function stop(gamepadIndex) {
    var me = gamepadIndex; 
    
    if(gamepadMode === true) {
        if(me.index === 1) {
            moveY = 0;
          }
          
          if(me.index === 0) {
            moveX = 0;
          }
          
          if(me.index === 12) {
             moveY = 0;
           }
          
           if(me.index === 13) {
             moveY = 0;
           }
          
           if(me.index === 14) {
             moveX = 0;
           }
          
           if(me.index === 15) {
             moveX = 0;
          }
    }
}