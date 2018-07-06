var config = {
    apiKey: "AIzaSyAWG-YVexo9WXq1MTTUJABk2U95A05ArP8",
    authDomain: "rps-multiplayer-ef51c.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-ef51c.firebaseio.com",
    projectId: "rps-multiplayer-ef51c",
    storageBucket: "Users",
    messagingSenderId: "971708011081"
  };

  firebase.initializeApp(config);

  var database = firebase.database();
  var player1 = false;
  var player2 = false;
  var spectator = false;
  var player1Ref = database.ref('/player1/name');
  var player2Ref = database.ref('/player2/name');
  var queue;
  var wins = 0;
  var losses = 0;
  var turn = "p1";

  $( document ).ready(function(){ 


    var nameForm = $("<form id='name-form'>");


    var nameInput = $("<input type='text'>");
    nameInput.attr("id", "name-input");
    nameInput.attr("placeholder", "Name");


    var nameButton = $("<button>");
    nameButton.attr("id", "name-submit");
    nameButton.addClass("btn btn-sm btn-success");
    nameButton.text("Start");

    nameForm.append(nameInput);
    nameForm.append(nameButton);

    $("#player-assign").append(nameForm);

});

$(document).on("click","#name-submit", function(event) {

    event.preventDefault();   

    var name = $("#name-input").val().trim();
    var playerGreeting = $("<div>");
    var playerPosition = $("<div>");
   

    database.ref().once("value").then(function(snapshot) {



        if(snapshot.val().player1.name == false){

            player1 = true;

            player1Constructor(name);

            $("#name-form").remove();

            playerGreeting.text("Hello " + name + ", you are Player 1!");
            playerPosition.text("Position: " + queue);

            $("#player-assign").append(playerGreeting);

            $("#p1-name").text(name);
            $("#p1-score").text("Wins: " + wins + "  Losses: " + losses);
     
           
        }else if(snapshot.val().player2.name == false) {

            player2 = true;

            player2Constructor(name);

            $("#name-form").remove();

            playerGreeting.text("Hello " + name + ", you are Player 2!");
            playerPosition.text("Position: " + queue);

            $("#player-assign").append(playerGreeting);

            $("#p2-name").text(name);
            $("#p2-score").text("Wins: " + wins + "  Losses: " + losses);
   
        
        }else{
            
            spectator = true;

            $("#name-form").remove();

            userQueueConstructor(name);

            database.ref().once("value").then(function(snapshot) {

                queue = snapshot.child('userQueue').numChildren();


                playerGreeting.text("Hello " + name + ", you are spectating.");
                playerPosition.text("Position: " + queue);

                $("#player-assign").append(playerGreeting);
                $("#player-assign").append(playerPosition);
                

            });
           
        }


    });
    


});

function player1Constructor(name) {

    var addPlayer = {
        name: name,
        choice: false
    }

    database.ref('/player1').set(addPlayer);
    player1Ref.onDisconnect().set(false);


    console.log(player1);
    console.log(player1.name);

}

function player2Constructor(name) {

    var addPlayer = {
        name: name,
        choice: false
    }

    database.ref('/player2').set(addPlayer);
    player2Ref.onDisconnect().set(false);
    console.log(player2);
  

}

function userQueueConstructor(name) {

    var addPlayer = {
        name: name
    }

    var user = database.ref('/userQueue').push(addPlayer);  
    user.onDisconnect().remove();

    console.log(user.key);
    console.log(user);
    
}

database.ref().on("value", function(snapshot) {

    if(snapshot.val().player1.name != false && snapshot.val().player2.name != false){

        gameControl(snapshot);

    
    }else if(snapshot.val().player1 == false || snapshot.val().player2 == false) {

        if(snapshot.val().userQueue != null){
            
            populateFromQueue();
        
        }else{}

    }else{

    }

    
});

function gameControl(snapshot) {

    var choices = $("<div>");
    choices.addClass("choices-div");

    var rockButton = $("<button>");
    rockButton.addClass('btn btn-lg choice-button');
    rockButton.attr("value", "R");
    rockButton.text("Rock");

    var scissorButton = $("<button>");
    scissorButton.addClass('btn btn-lg choice-button');
    scissorButton.attr("value", "S");
    scissorButton.text("Scissor");

    var paperButton = $("<button>");
    paperButton.addClass('btn btn-lg choice-button');
    paperButton.attr("value", "P");
    paperButton.text("Paper");

    choices.append(rockButton);
    choices.append(paperButton);
    choices.append(scissorButton);


    if(snapshot.val().player1.choice == false) {

        turn = "p1";

        if(player1 == true){

            $("#game-control").text("It's Your Trun!");
            $("#p1-choices").append(choices);


        }else{

            $("#game-control").text("Waiting for " + snapshot.val().player2.name + " to choose.");

        }

    }else if(snapshot.val().player2.choice == false) {

        turn = "p2";

        if(player2 == true){

            $("#game-control").text("It's Your Trun!");
            $("#p1-choices").append(choices);


        }else{

            $("#game-control").text("Waiting for " + snapshot.val().player2.name + " to choose.");

        }
      

    }

    if(snapshot.val().player1.choice != false && snapshot.val().player2.choice != false) {


        playRound(snapshot);


    }





}

$( document ).on("click", ".choice-button", function() {

    if(turn == "p1") {

        var choice = $(this).val();
        database.ref('/player1/choice').set(choice);

        if(player2 != true) {

            $("p1-choices").text(choice);

        }else{

        }


    }else{

        var choice = this.val();
        database.ref('/player2/choice').set(choice);

        if(player1 != true) {

            $("p2-choices").text(choice)

        }else{

        }

    }

    


});

function playRound(snapshot) {

    var p1choice = snapshot.val().player1.choice;
    var p2choice = snapshot.val().player2.choice;

    switch(p1choice){

        case "R":   
            
            switch(p2choice){

                case "R":

                    tie();

                case "P":

                    p2win();

                case "S":

                    p1win()
            
            }

        
        
        case "P":

            switch(p2choice){

                case "R":

                    p1win();

                case "P":

                    tie();

                case "S":

                    p2win();

            }

        
        
        
        case "S":

            switch(p2choice){

                case "R":

                    p2win();

                case "P":

                    p1win();

                case "S":

                    tie();

            }
        
    }

}

function p1win() {

    console.log("p1 wins");


}

function p2win() {

    console.log("p2 wins");

    
}

function tie() {

    console.log("tie");

    
}





