// Set the date we're counting down to
var order;
var list = document.getElementsByClassName("timeOrdered");

for(order = 0; order < list.length; order++) {
    countdown(order);

}



function countdown(order) {
    // Update the count down every 1 second
    var date = new Date(document.getElementsByClassName("timeOrdered")[order].innerHTML);
    var element = document.getElementsByClassName("timer")[order];
    var startingDate = date;
    startingDate.setMinutes(startingDate.getMinutes() + 15);
    var countDownDate = new Date(startingDate).getTime();

    var x = setInterval(function() {

        var now = new Date().getTime();
        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        element.innerHTML = minutes + " m " + seconds + " s";
        // If the count down is finished, write some text
        if (distance < 0 ) {
            clearInterval(x);
            element.innerHTML = "—";
        }

    }, 1000);

}