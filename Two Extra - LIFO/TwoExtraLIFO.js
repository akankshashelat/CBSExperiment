//set the treatment number
// Treatment 2: drop off order: P2, P3, P1
let treatment = 2;
let delayNotice = false;
let generalSpeed = 0;
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
let p0 = 0, p1 = 0, p2 = 0, d0 = 0, d1 = 0, d2 = 0;
let p0Mod = 0, d0Mod = 0, p1Mod = 0, p2Mod = 0, d1Mod = 0, d2Mod = 0;

//up and down distances
let additionalDistance1, additionalDistance2 = 0;

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
    if (passengerID > 1) {
        countDown(passengerID);
    }

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
    else if (passengerID === 2) {
        clearInterval(timerInstance2);
        timerInstance2 = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                timer = 00;
            }
        }, 1000);
    }
    else if (passengerID === 3) {
        clearInterval(timerInstance3);
        timerInstance3 = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                timer = 00;
            }
        }, 1000);
    }
}

//displays start time from 1 minute and updates the timer.
function countDown(passengerID) {
    //start the timer from 1 minutes
    let countDown, countdownText;
    if (passengerID == 1) {
        countDown = 3;
        countdownText = "03:00"
    }
    else if (passengerID == 2){
        countDown = 2;
        countdownText = "02:00"
    }
    else{
        countDown = 1;
        countdownText = "01:00"
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

    //divides grid into equal portions to space out locations.
    //this is to account for screen sizes.
    var fifthWidth = Math.floor(width/5);
    var fifthHeight = Math.floor(height/5);

    //values for locations for Participant
    var participantPickup = startLocation + 2;
    p0 = participantPickup;
    p0Mod = p0 % width;
    orderOfLocations[p0Mod] = p0;

    d0 = endLocation - 2;
    d0Mod = d0 % width;
    orderOfLocations[d0Mod] = d0;

    //the width between p0 and d0
    var middleWidth = width - 6;

    //divides grid into equal portions to space out locations.
    //this is to account for screen sizes.
    var fourthWidth = Math.floor(middleWidth/4); //divide the middle space into 4 sections
    var fifthHeight = Math.floor(height/5);

    //values for locations for additional passengers
    p1 = (p0 + fourthWidth) - width;
    p1Mod = p1 % width;

    d1 = p0 + (fourthWidth * 4) + (fifthHeight * width);
    d1Mod = d1 % width;

    orderOfLocations[p1Mod] = p1;
    orderOfLocations[d1Mod] = d1;

    p2 = p0 + (2 * fourthWidth) + (fifthHeight * width);
    d2 = p0 + (3 * fourthWidth) - (fifthHeight * width);

    p2Mod = p2 % width;
    d2Mod = d2 % width;

    orderOfLocations[p2Mod] = p2;
    orderOfLocations[d2Mod] = d2;

    //go to the end location always
    // orderOfLocations[width] = endLocation;

    //makes a list of all locations in order.
    columnIndex = Object.keys(orderOfLocations);
}

//increases the timer when new passengers are added.
//displays the locations on screen for pick up only.
function addLocations(passengerID){
    var pickup;
    if(passengerID == 2){
        setTimeout(function (){
            //increase the timer for P1 (existing time + 180 seconds)
            let newDuration = parseInt(document.getElementById("timeP1").innerHTML.split(":")[0]) * 60 +
            parseInt(document.getElementById("timeP1").innerHTML.split(":")[1]) + 60;
            updateTimer(newDuration, 1);

            //calculates time for the announcement (existing time + 180 seconds)
            let minutes = parseInt(document.getElementById("timeP1").innerHTML.split(":")[0]);
            let seconds = parseInt(document.getElementById("timeP1").innerHTML.split(":")[1]) + 60;

            //adjust seconds and minutes based on added time.
            if(seconds >= 60) {
                let sec = seconds;
                seconds %= 60;
                minutes = minutes + Math.floor(sec / 60);
            }

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            let time = minutes + ":" + seconds;

            let timeAtOpen, timeAtClose;

            Swal.fire({
                title: "Alert!",
                text: "New Passenger added! New time is " + time,
                type: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                onOpen: function() {
                    delayNotice = true;
                    timeAtOpen = performance.now();
                },
                onClose: function() {
                    timeAtClose = performance.now();
                    responseTimes.push(Math.ceil((timeAtClose - timeAtOpen) / 1000));
                }
            });
        }, 20);
    }

    //display the displaced route
    //only if its the first stop since its handled separately
    $(".minorRoute").css("display", "block");

    //gets the DOM element for the pick up location.
    var pickup = $(".grid div:nth-child(" + (passengerID == 1 ? p0 : passengerID == 2 ? p1 : p2) + ")");

    if(passengerID == 1){
        //add the pick up image on the location.
        pickup.append("<img class='p1pick' src='images/d1p.png'"+
        "alt='Destination'><strong class= 'locTag p1Tag'> Your Pickup !</strong>");

        var dropoff = $(".grid div:nth-child(" + d0 + ")");
        dropoff.append("<img class='p1dest'src='images/d1d.png' alt='Destination'>"+
        "<strong class= 'p1Tag locTag' >Your Dropoff !</strong>");
    }
    else if(passengerID == 2){
        //add the pick up image on the location.
        pickup.append("<img class='pickup d2p' src='images/d2p.png'"+
        "alt='Destination'><strong class= 'locTag p2Tag pickupTag' >Pick up Passenger 2</strong>");
    }
    else{ //if(passengerID == 3)
        //add the pick up image on the location.
        pickup.append("<img class='pickup d3p' src='images/d3p.png' "+
        "alt='Destination'><strong class= 'locTag p3Tag' >Pick up Passenger 3</strong>");
        // calcDistance(2);
    }
}

// function setSpeed(distance, stops){
//     //global - don't need to return
//     generalSpeed = Math.floor(distance/ 180);
//     if(stops == 2){
//         generalSpeed = Math.floor(distance/ 60) + 3; //13
//         console.log("distance for p2", distance);
//         console.log("speed for p2", generalSpeed);
//     }
//     if(stops == 3){
//         //STILL TOO FAST ?????????? WHYYYY
//         let timeLeft = parseInt(document.getElementById("timeP1").innerHTML.split(":")[0]) * 60 +
//             parseInt(document.getElementById("timeP1").innerHTML.split(":")[1])
//             console.log("time for p1", timeLeft);
//         generalSpeed = Math.floor(distance/ timeLeft);
//         console.log("distance for p1", distance);
//         console.log("speed for p1", generalSpeed);
//     }
// }

// function calcDistance(stops){
//     // get the bounding rectangles
//     console.log(stops);

//     if(stops == 0){//pickup1
//         var div1rect = $(".p1pick")[0].getBoundingClientRect();
//         var div2rect = $(".p1dest")[0].getBoundingClientRect();
//     }
//     if(stops == 2){//pickup2
//         console.log("its getting here!");
//         var div1rect = $(".d2p")[0].getBoundingClientRect();
//         var div2rect = $(".d3p")[0].getBoundingClientRect();
//     }
//     if(stops == 3){//
//         var div1rect = $(".destination")[0].getBoundingClientRect();
//         var div2rect = $(".p1dest")[0].getBoundingClientRect();
//     }
//     // get div1's center point
//     var div1x = div1rect.left + div1rect.width/2;
//     var div1y = div1rect.top + div1rect.height/2;

//     // get div2's center point
//     var div2x = div2rect.left + div2rect.width/2;
//     var div2y = div2rect.top + div2rect.height/2;

//     // calculate the distance using the Pythagorean Theorem (a^2 + b^2 = c^2)
//     var distanceSquared = Math.pow(div1x - div2x, 2) + Math.pow(div1y - div2y, 2);
//     var distance = Math.sqrt(distanceSquared);
//     setSpeed(distance, stops);
// }

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
        //add the destination image to the screen along with the route.
        if(numStopsReached == 3){
            var dropoff = $(".grid div:nth-child(" + d2 + ")");
            dropoff.append("<img class='destination d3d' src='images/d3d.png' alt='Destination'><strong class= 'locTag p3Tag tagAbove' >Drop off Passenger 3</strong>");
        }
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
        if(numStopsReached == 4){
            var dropoff = $(".grid div:nth-child(" + d1 + ")");
            dropoff.append("<img class='destination d2d' src='images/d2d.png' alt='Destination'><strong class= 'locTag p2Tag' >Drop off Passenger 2</strong>");
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

        //display the displaced route
        //only if its not the first stop since that is handled separately
        if (numStopsReached > 1) {
            $(".minorRoute").css("display", "block");
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
                    addLocations(2);
                }, 5000);
            }

            //removes previous destination.
            // let children = $(".grid div:nth-child(" + cell + ")").children();
            // var i = dir == "down" ? 1 : 0;
            // for(i ; i < children.length; i++){
            //     children[i].remove();
            // }

            //change the image to have passengers in car.
            if(numStopsReached == 1 || numStopsReached == 5){
                document.getElementById("car").src = 'images/car1.png';
            }
            else if(numStopsReached == 2){
                document.getElementById("car").src = 'images/car2.png';
            }
            else if(numStopsReached == 3){
                document.getElementById("car").src = 'images/car4.png';
            }
            else if(numStopsReached == 4){
                document.getElementById("car").src = 'images/car2.png';
            }
            else{ //last stop 6 i.e car only has driver
                document.getElementById("car").src = 'images/car.png';
            }

            //ADD CALL TO ADD TIMER FOR P2
            if(numStopsReached == 2){
                updateTimer(120, 2);
            }
            else if(numStopsReached == 3){
                updateTimer(60, 3);
            }

            //update timers to remove them from screen once their destination is reached.
            if(numStopsReached == 5){
                clearInterval(timerInstance2);
                document.getElementById("p2Time").style.display = "none";
            }
            else if(numStopsReached == 4){
                clearInterval(timerInstance3);
                document.getElementById("p3Time").style.display = "none";
            }
            else if(numStopsReached == 6){
                clearInterval(timerInstance1);
                document.getElementById("p1Time").style.display = "none";
            }


            //add location of third passenger to the screen according to the treatment
            if(numStopsReached == 2){
                addLocations(3);
            }
            if(numStopsReached == 6){
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
    }

    function adjustRoute(){
        let carSpeed = 0;
        let prePickUpSpeed = 20;
        if(numStopsReached == 1 || numStopsReached == 5){
            generalSpeed = 5;
        }
        if(numStopsReached == 2){
            generalSpeed = 20;
        }
        if(numStopsReached == 3){
            generalSpeed = 8.5;
        }
        if(numStopsReached == 4){
            generalSpeed = 20;
        }
        carSpeed = generalSpeed;
        //the car is faster before P1 gets picked up.
        if(numStopsReached == 0){
            carSpeed = prePickUpSpeed;
        }
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
                case "u":
                    $("#car").css({
                        "-webkit-transform": "rotate(-90deg)",
                        "-moz-transform": "rotate(-90deg)",
                        "transform": "rotate(-90deg)"
                    });
                    $("#car").supremate({"top": "-=70"}, carSpeed, "linear", function(){
                        route.shift();
                        pauseAndRemove();
                        adjustRoute();
                    });
                    break;
                case "d":
                    $("#car").css({
                        "-webkit-transform": "rotate(90deg)",
                        "-moz-transform": "rotate(90deg)",
                        "transform": "rotate(90deg)"
                    });
                    $("#car").supremate({"top": "+=70"}, carSpeed, "linear", function(){
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