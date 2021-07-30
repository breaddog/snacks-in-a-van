 // flip the dots and change the text around here and there
 function success(position){
    var coords = position.coords
    var address = document.getElementById('currentLocation').value

    // nothing valid added
    if (address.replace(" ", "").length < 10 || address.split('').length < 2 || !(address.includes(" "))){
        document.getElementById('errorFlash').style.display = "inline-block"
        document.getElementById('errorFlash').innerHTML = "Please enter something descriptive in the current location field that is at least 2 words"
    }
    else{
        // post address and see how the thing handles it
        var form = document.createElement('form')
        form.name = "vendorLocation"
        form.method = "POST"
        form.action = ''

        // create the location and address
        form.appendChild(createField('address', address))
        form.appendChild(createField('location', JSON.stringify([coords.latitude, coords.longitude])))

        //append to body
        document.body.appendChild(form)

        //submit
        form.submit()


    }


}
// stay on the page, force them to reload
function failure(){
    // remove form
    document.getElementById('locationTemp').remove()
    //remove error
    if (document.getElementById('errorFlash')){
        document.getElementById('errorFlash').remove()
    }


    // create new placeholder
    var parent = document.getElementById('placeholder')
    var child = document.createElement('h2')
    child.style.alignContent = 'center'
    child.style.textAlign = 'center'
    child.style.fontSize = "27px"
    child.style.paddingTop = '10px'
    child.style.paddingBottom = '30px'
    child.id = 'locationFail'
    child.innerHTML = "We didn't manage to record your location.<br>Please enable your geolocation manually and reload the app to proceed.</br>"

    parent.insertBefore(child, parent.childNodes[0])

    document.getElementById('primaryButton').value = "REFRESH THE PAGE "
    document.getElementById('primaryButton').onclick = reload
    document.getElementById('mainHeader').innerHTML = 'Error Recording Location'
}

function openVanAlert(){
    alert("We're opening your van right now. Redirecting you to your current orders.")
}
function reload(){
    window.location.reload()
}


// get geolocation
function getGeolocation(){
    // if nagivation has been activated
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(success, failure, {
            maximumAge: 30000,
            timeout: 27000,
            enableHighAccuracy: true
        })
    }

}

// adds new field to form
function createField(key, value){

    var field = document.createElement('input')
    field.type = 'hidden'
    field.name = key
    field.id = key
    field.value = value

    return field
}