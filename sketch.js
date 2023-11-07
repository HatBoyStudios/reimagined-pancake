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

var host_or_guest;
var lobby_or_game = "lobby";

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
var player_active = [false, false, false, false];
var player_health = [100, 100, 100, 100];
var player_speed = [5, 5, 5, 5];
var player_level = [1,1,1,1];
var player_inventory = [0, 0, 0, 0];
var toolType = [];
var moveX, moveY;

var playerPosition = [1, 1, 1, 1];
var YD = 1;
var XR = 2;
var YU = 3;
var XL = 4;

var controlled_player = 0;

var enemy = [];
var enemyGroup;
var enemyCount = 0;
var enemySpeed = [];
var enemyStrength = [];
var enemyFriction = [];
var bean = 0;

var a;
var p1X, p1Y, p2X, p2Y, p3X, p3Y, p4X, p4Y;
var p1P, p2P, p3P, p4P;

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

    // code for using the gamepad
    joystick = createJoystick();
    if(!joystick.calibrated())
    joystick.calibrate(true);
    joystick.onButtonPressed(test);
    joystick.onButtonReleased(stop);
    joystick.onAxesPressed(test);
    joystick.onAxesReleased(stop);

        dataPositions();
    }else if(gameState === playState) {
        for(let i = 0; i<4; i++) {
            player[i] = createSprite(200,200,50,50);
        }

    // code for using the gamepad
    joystick = createJoystick();
    if(!joystick.calibrated())
    joystick.calibrate(true);
    joystick.onButtonPressed(test);
    joystick.onButtonReleased(stop);
    joystick.onAxesPressed(test);
    joystick.onAxesReleased(stop);

        dataPositions();
    }

    enemyGroup = createGroup();

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
        appearances();
        host_privilege();
        playerMovement();
        if(host_or_guest === "guest"){
            guesting();
        }
    }else if(gameState === playState) {
        background("black");
        if(host_or_guest === "guest"){
            guesting();
            for(bean; bean < 5; bean++){
                enemy_behavior(bean);
            }

            for(let i = 0; i < enemyCount; i++) {
                enemyRetrieve(i);
            }
        }
        appearances();
        host_privilege();
        playerMovement();
        if(host_or_guest === "host") {
            for(bean; bean < 5; bean++){
                enemy_behavior(bean);
            }
            for(let i = 0; i < enemyCount; i++) {
                let target = Math.round(random(0,3));
                enemy[i].attractionPoint(enemySpeed[i], player[target].position.x, player[target].position.y);
                enemyDisplay(i);
            }
        }
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
    host_or_guest = "host";
    sessionName = session_name.value();
    sessionCode = session_code.value();
    loadSession_db();
}

function findingSession() {
    host_or_guest = "guest";
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

function host_privilege() {
    if(host_or_guest === "host") {
        if(keyDown("k")){
            updateStatus();
        }
    }
}


//functions dedicated to the actual game
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

    if(keyDown("r")) {
        enemy_behavior(0);
    }
    
        if(moveY === -1) {
            player[controlled_player].y -= 5;
            playerPosition[controlled_player] = YU;
            updatePosition();
        }else if(moveY === 1) {
            player[controlled_player].y += 5;
            playerPosition[controlled_player] = YD;
            updatePosition();
        }else {
            player[controlled_player].y += 0
        }
    
        if(moveX === -1) {
            player[controlled_player].x -= 5;
            playerPosition[controlled_player] = XL;
            updatePosition();
        }else if(moveX === 1) {
            player[controlled_player].x += 5;
            playerPosition[controlled_player] = XR;
            updatePosition();
        }else {
            player[controlled_player].x += 0;
        }

    camera.x = player[controlled_player].x;
    camera.y = player[controlled_player].y;

    player[0].x = p1X;
    player[0].y = p1Y;
    playerPosition[0] = p1P;
    player[1].x = p2X;
    player[1].y = p2Y;
    playerPosition[1] = p2P;
    player[2].x = p3X;
    player[2].y = p3Y;
    playerPosition[2] = p3P;
    player[3].x = p4X;
    player[3].y = p4Y;
    playerPosition[3] = p4P;
}

function enemy_behavior(enemy_number) {
    let enemy_num = enemy_number;

    let enemy_x = Math.round(random(0, 400));
    let enemy_y = Math.round(random(0, 400));
    let target = Math.round(random(0, 3));

    enemy.push(createSprite(enemy_x, enemy_y, 25, 25));
    enemySpeed.push(5);
    enemyFriction.push(0.5)

    enemy[enemy_num].friction = enemyFriction[enemy_num];
    enemyGroup.add(enemy[enemy_num]);
    console.log(enemy[enemy_num].velocityX);
    enemyCount++;

    enemyDisplay(enemy_num);
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
        game_state: lobby_or_game,
        players: {
            playercount: 0,
            player1: {
                active: false,
                playerName: "",
                playerLevel: player_level[0],
                playerInventory: player_inventory[0],
                x: 200,
                y: 200,
                player_position: playerPosition[0]
            },
            player2: {
                active: false,
                playerName: "",
                playerLevel: player_level[1],
                playerInventory: player_inventory[1],
                x: 200,
                y: 200,
                player_position: playerPosition[1]
            },
            player3: {
                active: false,
                playerName: "",
                playerLevel: player_level[2],
                playerInventory: player_inventory[2],
                x: 200,
                y: 200,
                player_position: playerPosition[2]
            },
            player4: {
                active: false,
                playerName: "",
                playerLevel: player_level[3],
                playerInventory: player_inventory[3],
                x: 200,
                y: 200,
                player_position: playerPosition[3]
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

    console.log(playerCount);
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
        playercount: playerCount
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
            p1P = a.player1.player_position;
            p2X = a.player2.x;
            p2Y = a.player2.y;
            p2P = a.player2.player_position;
            p3X = a.player3.x;
            p3Y = a.player3.y;
            p3P = a.player3.player_position;
            p4X = a.player4.x;
            p4Y = a.player4.y;
            p4P = a.player4.player_position;
        })

       run = true; 
    }
}

function updatePosition() {
    //updates the current position of the player to firebase
    var positionRef = database.ref(sessionName+"/players/player"+(controlled_player+1));
    var data = {
        x: player[controlled_player].x,
        y: player[controlled_player].y,
        player_position: playerPosition[controlled_player]
    };

    var result = positionRef.update(data, dataSent);
    console.log(result.key);

  function dataSent(err, status) {
    console.log(status);
  }
}

function appearances() {
    let a;
    var activeRef = database.ref(sessionName+"/players");
    activeRef.on("value", function(data){
        a = data.val()
        player_active[0] = a.player1.active
        player_active[1] = a.player2.active
        player_active[2] = a.player3.active
        player_active[3] = a.player4.active
    })

    if(player_active[0] === false){
        player[0].visible = false;
    }else {
        player[0].visible = true;
    }

    if(player_active[1] === false){
        player[1].visible = false;
    }else {
        player[1].visible = true;
    }

    if(player_active[2] === false){
        player[2].visible = false;
    }else {
        player[2].visible = true;
    }

    if(player_active[3] === false){
        player[3].visible = false;
    }else {
        player[3].visible = true;
    }
}

function updateStatus() {
    lobby_or_game = "game";

    if(lobby_or_game === "game") {
        var gamestateRef = database.ref(sessionName);
        var gamestateData = {
            game_state: lobby_or_game
        }

        var result = gamestateRef.update(gamestateData, dataSent);
        console.log(result.key);

  function dataSent(err, status) {
    console.log(status);
    }
}
gameState = playState
}

function guesting() {
    let runner, runner2;
    var guestRef = database.ref(sessionName);
    guestRef.on("value", function(data){
        runner = data.val()

        runner2 = runner.game_state
    })

    if(runner2 === "game") {
        gameState = playState;
    }

    //console.log(gameState, runner);
}

function enemyDisplay(num) {
    let enemy_num = num;
    var enemyRef = database.ref(sessionName+"/enemies/enemy"+(enemy_num+1));
    var enemyData = {
        x: enemy[enemy_num].x,
        y: enemy[enemy_num].y
    }

    var enemy2Ref = database.ref(sessionName+"/enemies/enemy"+(enemy_num+1));
    var enemy2Data = {
        enemy_count: enemyCount
    }

    var result = enemyRef.update(enemyData, dataSent);
    var result = enemy2Ref.update(enemy2Data, dataSent);
    console.log(result.key);

  function dataSent(err, status) {
    console.log(status);
  }
}

function enemyCount_retrieve() {
    let test
    var enemyRef = database.ref(sessionName+"/enemies")
    enemyRef.on("value", function(data){
        test = data.val()
        enemyCount = test.enemy_count
    })
}

function enemyRetrieve(num) {
    let enemy_num = num;
    let post;
    var enemyRef = database.ref(sessionName+"/enemies/enemy"+(enemy_num+1));
    enemyRef.on("value", function(data){
        post = data.val()
        enemy[enemy_num].x = post.x
        enemy[enemy_num].y = post.y
    })
}

// gamepad functions

function test(gamepadIndex) {
    console.log(gamepadIndex);
    var me = gamepadIndex;

    if(me.index === 9) {
        // switching between controllers and keyboard and mouse
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

        if(me.index === 2 && me.value === -1 && me.type === "axes"){
            playerPosition[controlled_player] = XL;
        }else if(me.index === 2 && me.value === 1 && me.type === "axes"){
            playerPosition[controlled_player] = XR;
        }else if(me.index === 3 && me.value === -1 && me.type === "axes"){
            playerPosition[controlled_player] = YU;
        }else if(me.index === 3 && me.value === 1 && me.type === "axes"){
            playerPosition[controlled_player] = YD;
        }
        console.log(playerPosition);
          
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
        if(me.index === 1 && me.type === "axes") {
            moveY = 0;
        }
          
        if(me.index === 0 && me.type === "axes") {
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