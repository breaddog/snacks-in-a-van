function clock(){
    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();
    document.querySelectorAll('.clock')[0].innerHTML = checkTime(hours) + ":" + checkTime(minutes);

    // the function itself is meant to add leading zeroes to time
    // so we would have 09:05 instead of 9:5
    function checkTime(standIn) {
        if (standIn < 10) {
            standIn = '0' + standIn
        }
        return standIn;
    }
}
setInterval(clock, 1000);