// variables to the game
var config;
var database;
var dataRegister = 0;
var findPositions = false;
var run = false;

var player = [0,0,0,0];

var controlled_player = 0;

var a;
var p1X, p1Y, p2X, p2Y, p3X, p3Y, p4X, p4Y;

function preload() {
    databasing();
    dataPositions();
   // dataPositions2();
}

//setup for the game (will be reused multiple times for different game states)

function setup() {
    createCanvas(400,400);

    for(let i = 0; i<4; i++) {
        player[i] = createSprite(200,200,50,50);
        //player[0].x = a;
    }

}

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

function dataPositions() {
    if(findPositions === true) {
        var positionRef = database.ref("tempspace");
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

        //console.log(a);
    }
}

function dataPositions2() {
    if(run === true) {
    }
}

function draw() {
    background("black");
    if(keyDown("1")) {
        controlled_player = 0;
    }else if(keyDown("2")) {
        controlled_player = 1;
    }else if(keyDown("3")) {
        controlled_player = 2;
    }else if(keyDown("4")) {
        controlled_player = 3;
    }
    playerMovement();

    player[0].x = p1X;
    player[0].y = p1Y;
    player[1].x = p2X;
    player[1].y = p2Y;
    player[2].x = p3X;
    player[2].y = p3Y;
    player[3].x = p4X;
    player[3].y = p4Y;

    drawSprites();
}

function playerMovement() {
    if(keyDown("w")) {
        player[controlled_player].y -= 5;
        updatePosition();
    }

    if(keyDown("a")) {
        player[controlled_player].x -= 5;
        updatePosition();
    }

    if(keyDown("s")) {
        player[controlled_player].y += 5;
        updatePosition();
    }

    if(keyDown("d")) {
        player[controlled_player].x += 5;
        updatePosition();
    }
}

function updatePosition() {
    var positionRef = database.ref("tempspace/player"+(controlled_player+1));
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