// Global Variables
var config, database, dataRegister = 0, findPositions = false, run = false;
var joystick, gamepadMode = false, gameState = 0;
var hostGame, joinGame, session_name, session_code, createSession, joinSession, user_name, join_game;
var playerCount = 1, controlled_player = 0, enemyCount = 0, bean = 0;
var moveX = 0, moveY = 0;
var player = [], player_active = [false, false, false, false];
var player_health = [100, 100, 100, 100], player_speed = [5, 5, 5, 5], player_level = [1,1,1,1], player_inventory = [0, 0, 0, 0];
var playerPosition = [1, 1, 1, 1];
var enemy = [], enemySpeed = [], enemyFriction = [], enemyGroup;
var p1X, p1Y, p2X, p2Y, p3X, p3Y, p4X, p4Y, p1P, p2P, p3P, p4P;
var host_or_guest, lobby_or_game = "lobby";
const YD = 1, XR = 2, YU = 3, XL = 4;
const startState = 0, hostState = 1, guestState = 2, nameState = 3, lobbyState = 4, playState = 5;

// Setup Function
function setup() {
    createCanvas(400, 400);
    databasing();
    createUIElements();
    setupGamepad();
    if (gameState === lobbyState || gameState === playState) {
        createPlayers();
        enemyGroup = createGroup();
    }
}

function draw() {
    switch(gameState) {
        case startState:
            background("purple");
            break;
        case hostState:
            background("green");
            break;
        case guestState:
            background("blue");
            break;
        case nameState:
            background("red");
            break;
        case lobbyState:
        case playState:
            background("black");
            handleGameplay();
            break;
    }
    drawSprites();
}

// Firebase Initialization
function databasing() {
    if (dataRegister === 0) {
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
    } else {
        console.log("database already existing");
    }
}

// Create UI Elements
function createUIElements() {
    if (gameState === startState) {
        hostGame = createButton('Create Session');
        hostGame.position(50, 200);
        joinGame = createButton('Join Session');
        joinGame.position(250, 200);
        hostGame.mousePressed(() => changeGameState(hostState));
        joinGame.mousePressed(() => changeGameState(guestState));
    } else if (gameState === hostState || gameState === guestState) {
        createSessionInputs();
        let buttonText = (gameState === hostState) ? 'Create Session' : 'Join Session';
        createSession = createButton(buttonText);
        createSession.position(150, 300);
        createSession.mousePressed(() => (gameState === hostState) ? creatingSession() : findingSession());
    } else if (gameState === nameState) {
        user_name = createInput('Enter Name');
        user_name.position(125, 200);
        join_game = createButton('Join Game');
        join_game.position(150, 350);
        join_game.mousePressed(add_player);
    }
}

function createSessionInputs() {
    session_name = createInput('Session Name');
    session_name.position(25, 200);
    session_code = createInput('Session Code');
    session_code.position(225, 200);
}

function changeGameState(newState) {
    gameState = newState;
    clearUIElements();
    setup();
}

function clearUIElements() {
    if (hostGame) hostGame.remove();
    if (joinGame) joinGame.remove();
    if (session_name) session_name.remove();
    if (session_code) session_code.remove();
    if (createSession) createSession.remove();
    if (user_name) user_name.remove();
    if (join_game) join_game.remove();
}

// Create Players
function createPlayers() {
    for (let i = 0; i < 4; i++) {
        player[i] = createSprite(200, 200, 50, 50);
    }
}

// Handle Gameplay
function handleGameplay() {
    appearances();
    host_privilege();
    playerMovement();
    if (host_or_guest === "guest") {
        guesting();
        for (bean; bean < 5; bean++) {
            enemy_behavior(bean);
        }
        for (let i = 0; i < enemyCount; i++) {
            enemyRetrieve(i);
        }
    }
    if (host_or_guest === "host") {
        for (bean; bean < 5; bean++) {
            enemy_behavior(bean);
        }
        for (let i = 0; i < enemyCount; i++) {
            let target = Math.round(random(0, 3));
            enemy[i].attractionPoint(enemySpeed[i], player[target].position.x, player[target].position.y);
            enemyDisplay(i);
        }
    }
}

// Handle Player Movement
function playerMovement() {
    if (!gamepadMode) {
        moveY = (keyDown("w")) ? -1 : (keyDown("s")) ? 1 : 0;
        moveX = (keyDown("a")) ? -1 : (keyDown("d")) ? 1 : 0;
    }
    if (keyDown("r")) enemy_behavior(0);
    updatePlayerPosition(controlled_player, moveX, moveY);
}

function updatePlayerPosition(playerIndex, x, y) {
    if (y !== 0) {
        player[playerIndex].y += 5 * y;
        playerPosition[playerIndex] = (y === -1) ? YU : YD;
        updatePosition();
    }
    if (x !== 0) {
        player[playerIndex].x += 5 * x;
        playerPosition[playerIndex] = (x === -1) ? XL : XR;
        updatePosition();
    }
    camera.x = player[playerIndex].x;
    camera.y = player[playerIndex].y;
}

// Firebase Functions
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
    controlled_player = playerCount - 1;
    joiningGame();
}

function loadSession_db() {
    var sessionRef = database.ref(sessionName);
    var sessionData = {
        code: sessionCode,
        game_state: lobby_or_game,
        players: {
            playercount: 0,
            player1: { active: false, playerName: "", playerLevel: player_level[0], playerInventory: player_inventory[0], x: 200, y: 200, player_position: playerPosition[0] },
            player2: { active: false, playerName: "", playerLevel: player_level[1], playerInventory: player_inventory[1], x: 200, y: 200, player_position: playerPosition[1] },
            player3: { active: false, playerName: "", playerLevel: player_level[2], playerInventory: player_inventory[2], x: 200, y: 200, player_position: playerPosition[2] },
            player4: { active: false, playerName: "", playerLevel: player_level[3], playerInventory: player_inventory[3], x: 200, y: 200, player_position: playerPosition[3] }
        }
    };
    sessionRef.update(sessionData, dataSent);
    gameState = nameState;
    clearUIElements();
    setup();
}

function findingSession_db() {
    var sessionRef = database.ref(sessionName);
    sessionRef.on("value", (x) => { playerCount = x.val().players.playercount; });
    gameState = nameState;
    clearUIElements();
    setup();
}

function joiningGame() {
    playerCount += 1;
    var playerRef = database.ref(sessionName + "/players/player" + (playerCount - 1));
    var playerData = {
        active: true,
        playerName: userName,
        playerLevel: player_level[(playerCount - 1)],
        playerInventory: player_inventory[(playerCount - 1)],
        x: 200,
        y: 200,
        player_position: playerPosition[(playerCount - 1)]
    };
    playerRef.update(playerData, dataSent);
    var countRef = database.ref(sessionName + "/players");
    countRef.update({ playercount: playerCount }, dataSent);
    gameState = lobbyState;
    clearUIElements();
    setup();
}

function dataSent(err, status) {
    console.log(err, status);
}

function updatePosition() {
    if (frameCount % 10 === 0) {
        var sessionRef = database.ref(sessionName + "/players/player" + controlled_player);
        var positionData = {
            active: true,
            x: player[controlled_player].x,
            y: player[controlled_player].y,
            player_position: playerPosition[controlled_player]
        };
        sessionRef.update(positionData, dataSent);
    }
}

// Enemy Functions
function enemy_behavior(n) {
    enemy[n] = createSprite(Math.round(random(player[controlled_player].x - 500, player[controlled_player].x + 500)), Math.round(random(player[controlled_player].y - 500, player[controlled_player].y + 500)), 30, 30);
    enemySpeed[n] = 10;
    enemyFriction[n] = 0.95;
    enemyCount += 1;
    enemy[n].shapeColor = "red";
}

function enemyDisplay(n) {
    if (enemy[n].x > 10000) enemy[n].destroy();
    if (frameCount % 10 === 0) {
        var sessionRef = database.ref(sessionName + "/enemies/enemy" + n);
        var enemyData = { x: enemy[n].x, y: enemy[n].y };
        sessionRef.update(enemyData, dataSent);
    }
}

function enemyRetrieve(n) {
    var sessionRef = database.ref(sessionName + "/enemies/enemy" + n);
    sessionRef.on("value", (x) => {
        let posX = x.val().x;
        let posY = x.val().y;
        enemy[n] = createSprite(posX, posY, 30, 30);
        enemy[n].shapeColor = "red";
    });
}

// Host Privilege
function host_privilege() {
    if (host_or_guest === "host") {
        var sessionRef = database.ref(sessionName);
        sessionRef.update({ game_state: lobby_or_game }, dataSent);
    }
}

function appearances() {
    // function to handle game appearances if any
}

function guesting() {
    // function to handle guest-specific functionalities if any
}

// Gamepad Setup
function setupGamepad() {
    window.addEventListener("gamepadconnected", (event) => {
        gamepadMode = true;
        joystick = event.gamepad;
    });
    window.addEventListener("gamepaddisconnected", (event) => {
        gamepadMode = false;
    });
}
