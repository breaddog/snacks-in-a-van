var startingDate2 = new Date(document.getElementById("timeOrdered").innerHTML);
console.log(startingDate2);
startingDate2.setMinutes(startingDate2.getMinutes() + 15);
console.log(startingDate2);
var countDownDate2 = new Date(startingDate2).getTime();

// Update the count down every 1 second
var x2 = setInterval(function() {

  // Get today's date and time
  var now2 = new Date().getTime();

  // Find the distance between now and the count down date
  var distance2 = countDownDate2 - now2;

  // Time calculations for days, hours, minutes and seconds
  var days2 = Math.floor(distance2 / (1000 * 60 * 60 * 24));
  var hours2 = Math.floor((distance2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes2 = Math.floor((distance2 % (1000 * 60 * 60)) / (1000 * 60));
  var seconds2 = Math.floor((distance2 % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("discountTimer").innerHTML = minutes2 + " minutes " + seconds2 + " seconds ";

  // If the count down is finished, write some text
  if (distance2 < 0) {
    clearInterval(x2);
    document.getElementById("discountTimer").innerHTML = "Discounted";
  }
}, 1000);