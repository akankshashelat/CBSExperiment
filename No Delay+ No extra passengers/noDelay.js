//set the treatment number
// Treatment 2: drop off order: P2, P3, P1
let treatment = 2;
let delayNotice = false;
let delayOver = false;
let alert = 0;
//sizeOfGrid
let gridSize = 70;

let width = Math.floor($(window).width()/gridSize);
let height = Math.floor($(window).height()/gridSize);

//previous timer instances
let timerInstance1;
let timerInstance2;
let timerInstance3;

//ROW RANGE CALCULATIONS
//rowRange divides the screen into 3 parts and uses the middle part only
let rowRange = Math.floor(height/3);
//COLUMN RANGE CALCULATIONS
let colRange = Math.floor(width/3);

//order in which car reaches the locations p1,p2,d1,d2
let orderOfLocations = {};
let columnIndex = [];

//p0 is the participant
//p1,p2,d1,d2
let p0 = 0, d0 = 0;
// p1 = 0, p2 = 0, , d1 = 0, d2 = 0;
let p0Mod = 0, d0Mod = 0;
// p1Mod = 0, p2Mod = 0, d1Mod = 0, d2Mod = 0;

//user rating
let ratingList = [];
let ratingInterval;

//response times in seconds to close alerts
let responseTimes = [];

//car route
let route = [];

//carLocation number
let carLocation = 0;

//startingLocation
let startLocation = 0;
//move car off the screen
let endLocation = 0;

//number of stops reached
let numStopsReached = 0;

//creates the grid layout of size W x H of screen
function createGrid() {
    var ratioW = Math.floor($(window).width()/gridSize),
        ratioH = Math.floor($(window).height()/gridSize);

    var parent = $('<div />', {
        class: 'grid',
        width: ratioW  * gridSize,
        height: ratioH  * gridSize
    }).addClass('grid').appendTo('body');

    for (var i = 0; i < ratioH; i++) {
        for(var p = 0; p < ratioW; p++){
            $('<div />', {
                width: gridSize - 1,
                height: gridSize - 1
            }).appendTo(parent);
        }
    }
}

// adds to screen: major horizontal route, the car, participants locations.
function addToScreen() {
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);

    carLocation = (carHeight * width) + 1;

    startLocation = (carHeight * width) + 1;
    endLocation = carLocation + width - 1;

    //add car to screen
    $(".grid div:nth-child("+ carLocation + ")").append("<img id='car' src='images/car.png' alt='Car'>");

    //adds the main path at the start location
    $(".grid div:nth-child("+ startLocation + ")").append("<hr class='majorRoute'>");
    $(".majorRoute").width($(".grid").width());

    //create and adjust height of the trail to the locations.
    $(".minorRoute").height($(".grid div").height());
}

//timer
function updateTimer(duration, passengerID) {

    var display = document.querySelector('#timeP' + passengerID);
    var timer = duration, minutes, seconds;

    if (passengerID === 1) {
        clearInterval(timerInstance1);
        timerInstance1 = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;
            //timer decreasing
            if (--timer < 0) {
                //if it reaches 00, keep it there.
                timer = 00;
            }
        }, 1000);
    }
}
//displays the countdown, countdown starts from 3 mins.
//calls updateTimer
function countDown(passengerID) {
    //start the timer from 1 minutes
    let countDown, countdownText;
    if (passengerID == 1) {
        countDown = 3;
        countdownText = "03:00"
    }
    else {
        countDown = 0;
        countdownText = "00:30"
    }
    let passengerTimer = document.getElementById("timeBoardP" + passengerID);
    passengerTimer.style.display = "block";

    let passengerTime = document.getElementById("timeP" + passengerID);
    passengerTime.innerHTML = countdownText;

    var numSeconds = 60 * countDown - 1;

    if (passengerID === 1) {
        updateTimer(numSeconds, passengerID);
    }
}

//creates locations for passengers
function getLocations(){
    var calcHeight = Math.floor((height/2));
    var carHeight = (calcHeight % 2 == 0 ? calcHeight-1 : calcHeight);
    var startLocation = (carHeight * width) + 1;

    //values for locations for Participant
    var participantPickup = startLocation + 2;
    p0 = participantPickup;
    p0Mod = p0 % width;
    orderOfLocations[p0Mod] = p0;

    orderOfLocations[width] = endLocation;

    //makes a list of all locations in order.
    columnIndex = Object.keys(orderOfLocations);
}
//increases the timer when new passengers are added.
//displays the locations on screen for pick up only.
function addLocations(passengerID){
    var pickup;
    //display the displaced route
    //only if its the first stop since its handled separately
    $(".minorRoute").css("display", "block");

    //gets the DOM element for the pick up location.
    // var pickup = $(".grid div:nth-child(" + (passengerID == 1 ? p0 : passengerID == 2 ? p1 : p2) + ")");
    var pickup = $(".grid div:nth-child(" + p0 + ")");

    if(passengerID == 1){
        //add the pick up image on the location.
        pickup.append("<img class='p1pick' src='images/d1p.png'"+
        "alt='Destination'><strong class= 'locTag p1Tag'> Your Pickup !</strong>");

        var dropoff = $(".grid div:nth-child(" + endLocation + ")");
        dropoff.append("<img class='p1dest'src='images/d1d.png' alt='Destination'>"+
        "<strong class= 'p1Tag locTag' >Your Dropoff !</strong>");
    }
}

//creates route to the next location
function updateRoute(cell){
    let displacedCells = 0; //number of cells moved up/down
    let direction = '';
    var dest = 0; //passengerID for drop off

    //get the best route between car and cell
    //if location in the same line => keep going right
    if(carLocation < cell && (cell - carLocation)/ width < 1 ){
        var j = cell - carLocation;
        for(var i = 0; i < j; i++){
            route.push("r");
            carLocation++;
        }
    }
    // if location is above
    else if (carLocation > cell){

        //direction is changed to "up" for animate to remove visited location
        direction = "up";
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation++;
        }
        //go up
        while (carLocation > cell){
            $(".grid div:nth-child("+ (carLocation) + ")").prepend("<div class='minorRoute'></div>");
            carLocation -= width;
            route.push("u");
            displacedCells++;
        }
//display the displaced route
        //only if its not the first stop since that is handled separately
        if (numStopsReached > 1) {
            $(".minorRoute").css("display", "block");
        }
    }
    //if location is down
    else if(carLocation + width < cell){
        //add the destination image to the screen along with the route.
        if(treatment == 2){
            //
        }
        //direction is changed to "down" for animate to remove visited location
        direction = "down";
        //gets to the same column
        while((carLocation % width) != (cell % width)){
            route.push("r");
            carLocation++;
        }
        //go down
        while(carLocation < cell){
            carLocation += width;

            //adds the route to destination on the screen.
            $(".grid div:nth-child("+ (carLocation) + ")").prepend("<div class='minorRoute'></div>");
            route.push("d");
            displacedCells++;
        }
    }
    //pause before going back to track
    route.push("p");

    if(numStopsReached == 0){
        addLocations(1);
    }
    setTimeout(function(){
        animateCar(cell, displacedCells, direction);
    }, 2500);

}
function redirectURL(){
    let numRatings = ratingList.length;
    let numResponses = responseTimes.length;

    let url ="https://umich.qualtrics.com/jfe/form/SV_6QHpFtdIs6UYZoN?";
    for(var i = 1; i <= numRatings; i++){
        url = url + "starRating" + i + "=" + ratingList[i-1] + "&";
    }

    for(var i = 1; i <= numResponses; i++){
        url = url + "respTime" + i + "=" + responseTimes[i-1] + "&";
    }
    //remove last & sign
    url = url.slice(0,-1);

    //console.log(url); FOR TESTING URL
    window.location.replace(url);
}

//animate car includes:
//pauseAndRemove - pauses the car at destinations,
//                 removes the destination image when visited, -- COMMENTED OUT
//                 changes the images of the car according to the passengers in it
//adjustRoute - rotates and moves the car up/down. Recursively calls itself to work through the route.
function animateCar(cell, displacedCells, dir){
    //index of destination
    let stopIndex = route.indexOf("p");

    //steps till cell
    let currStep = 0;

    //pause car at destination,
    function pauseAndRemove(){
        currStep++;
        if(stopIndex == currStep){
            numStopsReached++;

            //Participant is picked up
            if(numStopsReached == 1){
                countDown(1);
                let timeAtOpen, timeAtClose;
                Swal.fire({
                    title: "Alert!",
                    text: "Passenger 1, your driver has arrived. You will arrive in " + document.getElementById("timeP1").innerHTML,
                    type: "info",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    onOpen: function() {
                        timeAtOpen = performance.now();
                    },
                    onClose: function() {
                        timeAtClose = performance.now();
                        responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
                    }
                });

                setTimeout(function(){
                    //second passenger locations after 5 second delay
                    addLocations();
                }, 5000);
            }
            //change the image to have passengers in car.
            if(treatment == 2){
                if(numStopsReached == 1){
                    document.getElementById("car").src = 'images/car1.png';

                }
                else if(numStopsReached == 2){
                    document.getElementById("car").src = 'images/car.png';
                }
            }
            //add location of second passenger to the screen according to the treatment
            // if(treatment == 2 && numStopsReached == 3){
            //     addLocations(3);
            // }
            if(numStopsReached == 2){
                clearInterval(ratingInterval);

                let timeAtOpen, timeAtClose;
                Swal.fire({
                    title: "Notice",
                    text: "You have reached your destination!",
                    type: "success",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    onOpen: function() {
                        timeAtOpen = performance.now();
                    },
                    onClose: function() {
                        timeAtClose = performance.now();
                        responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
                        redirectURL();
                    }
                });
            }
            setTimeout(function(){
                //brings car back to track.
                if(dir == "up"){
                    for (var i = displacedCells; i > 0; i--){
                        route.push("d");
                        carLocation += width;
                    }
                }
                else {
                    for (var i = displacedCells; i > 0; i--){
                        route.push("u");
                        carLocation -= width;
                    }
                }
                //remove the visited location from the list.
                columnIndex.shift();
                if(columnIndex.length > 0){
                    //we know we've paused, so remove that pause from the route before calculating the rest
                    route.shift();
                    updateRoute(orderOfLocations[columnIndex[0]]);
                }
            }, 1000);
        }
    }//recursively calls itself to shift route
    function adjustRoute(){
        let normalSpeed = 6.5;
        let prePickUpSpeed = 20;

        let carSpeed = normalSpeed;

        if(route.length > 0){
            var direction = route[0];
            switch(direction) {
                //syntax for animation: $(selector).supremate(properties,speed,easing,callback);
                case "r":
                    $("#car").css({
                        "-webkit-transform": "rotate(0deg)",
                        "-moz-transform": "rotate(0deg)",
                        "transform": "rotate(0deg)"
                    });
                    //the car is faster before P1 gets picked up.
                    if(numStopsReached == 0){
                        carSpeed = prePickUpSpeed;
                    }
                    $("#car").supremate({"left": "+=70"}, carSpeed, "linear", function(){
                            route.shift();
                            pauseAndRemove();
                            adjustRoute();
                    });

                    break;
                case "p":
                    break;

                default: //shouldn't reach here
                    $("#car").css({
                        "-webkit-transform": "rotate(0deg)",
                        "-moz-transform": "rotate(0deg)",
                        "transform": "rotate(0deg)"
                    });

                    $("#car").supremate({"left": "+=70"}, carSpeed, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
            }
        }
    }
    adjustRoute();
}
function userRating() {
    let timeAtOpen, timeAtClose;
    Swal.fire({
        title: "Please leave a rating!",
        html:
            "<head><style>" +
            "#rate{display:inline-block;height:46px;padding:0 10px}#rate:not(:checked)>input{position:absolute;top:-9999px}" +
            "#rate:not(:checked)>label{float:right;width:1em;overflow:hidden;white-space:nowrap;cursor:pointer;" +
            "font-size:30px;color:#ccc}#rate:not(:checked)>label:before{content:url(images/unfilled.png);}#rate>input:checked~label{content:url(images/filled.png);}" +
            "#rate:not(:checked)>label:hover,#rate:not(:checked)>label:hover~label{content:url(images/filled.png);}#rate>input:checked + label:hover," +
            "#rate>input:checked + label:hover~label,#rate>input:checked~label:hover,#rate>input:checked~label:hover~label," +
            "#rate>label:hover~input:checked~label{color:#c59b08}" +
            "</style></head>" +
            "<body><form id='rate'>" +
                "<input type='radio' id='star7' name='rate' value='7' /><label for='star7' title='text'>7 stars</label>" +
                "<input type='radio' id='star6' name='rate' value='6' /><label for='star6' title='text'>6 stars</label>" +
                "<input type='radio' id='star5' name='rate' value='5' /><label for='star5' title='text'>5 stars</label>" +
                "<input type='radio' id='star4' name='rate' value='4' /><label for='star4' title='text'>4 stars</label>" +
                "<input type='radio' id='star3' name='rate' value='3' /><label for='star3' title='text'>3 stars</label>" +
                "<input type='radio' id='star2' name='rate' value='2' /><label for='star2' title='text'>2 stars</label>" +
                "<input type='radio' id='star1' name='rate' value='1' /><label for='star1' title='text'>1 star</label>" +
            "</form></body>",
        preConfirm: function() {
            ratingList.push(parseInt($('input[name=rate]:checked', '#rate').val()));
        },
        type: "question",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        onOpen: function() {
            timeAtOpen = performance.now();
        },
        onClose: function() {
            timeAtClose = performance.now();
            responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
        }
    });
}
//EXECUTION FROM HERE:
ratingInterval = setInterval(function(){
    userRating();
}, 30000);

createGrid();
addToScreen();
getLocations();
updateRoute(orderOfLocations[columnIndex[0]]);