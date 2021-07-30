var startingDate = new Date(document.getElementById("timeOrdered").innerHTML);
console.log(startingDate);
startingDate.setMinutes(startingDate.getMinutes() + 15);
console.log(startingDate);
var countDownDate = new Date(startingDate).getTime();
console.log(document.getElementById("status").innerHTML);

// Update the count down every 1 second
if (document.getElementById("status").innerHTML != "COMPLETED") {
    var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
    document.getElementById("timer").innerHTML = minutes + " m " + seconds + " s ";

    // If the count down is finished, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("timer").innerHTML = "Ready";
    }

    }, 1000);
}