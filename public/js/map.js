



// render icons 
var mapPin = L.Icon.extend({
    options: {
        iconSize: [32, 32],
    }
})

// pins
var greenPin = new mapPin({iconUrl: '/icons/green-pin.png'}),
    bluePin = new mapPin({iconUrl: '/icons/blue-pin.png'})

// Ask to access user location
document.getElementById("map").style.display = "none"
document.getElementById("vendorList").style.display = "none"
var map 
var locationPermission


$(document).ready(function(){
    startLoadingAnimation()
    navigator.geolocation.getCurrentPosition(success, failure, {
        maximumAge: 10000,
        timeout: 5000,
        enableHighAccuracy: true
    })
})  


//https://stackoverflow.com/a/8537672
function startLoadingAnimation(){
    var i = 0;
    setInterval(function(){
        i = ++i % 7
        if (document.getElementById('loading') != null){
            var loading = document.getElementById('loading')
            loading.innerHTML = "Loading the page"+Array(i+1).join(".")
        }
    }, 400)
    

    
}

function success(position){

    locationPermission = true
    // console.log(position.coords.latitude);
    // console.log(position.coords.longitude);
    document.getElementById('loading').remove()
    document.getElementById("welcomeText").style.display = "block"
    document.getElementById("welcomeText").innerHTML = "Welcome! Please select a van below to order from to continue!"    
    renderMap([position.coords.latitude, position.coords.longitude])

    // current position
    var customerPopup = `<b>We think you are here!</b>`
    var marker = new L.marker([position.coords.latitude, position.coords.longitude], {icon: greenPin}).addTo(map)
    marker.bindPopup(customerPopup)

    map.addLayer(new L.Popup().setLatLng([position.coords.latitude, position.coords.longitude]).setContent(customerPopup))
    
}

function failure(message) {

    navigator.permissions.query({name: 'geolocation'}).then(function(result){
        // failsafe 
        
        if (result.state == "granted"){

            navigator.geolocation.getCurrentPosition(success, failure, {
                maximumAge: 10000,
                timeout: 5000,
                enableHighAccuracy: true
            })
        }
        else{
            var welcomeText = document.getElementById('welcomeText')
            locationPermission = false
            document.getElementById('loading').remove()
            welcomeText.style.display = "block"
            welcomeText.style.fontSize = '25px'
            welcomeText.innerHTML = `It seems like you have your location disabled or your browser doesnt support it.
                                    If you can please enable it manually in your browser settings.
                                    <br>
                                    <a href='#' onclick='location.reload(true)'>
                                    After enabling it please click here to refresh the page!</a></br>
                                    Or you can continue to order but we wont be able to show you the nearest van.`
            renderMap([])
        }
    })
    
}

// render the map
function renderMap(coords){
    // magic
    document.getElementById("map").style.display = "block"
    document.getElementById("vendorList").style.display = "block"
    if (coords.length == 0){
        map = L.map('map').setView([-37.73, 144.928], 13.5)
    }
    else{
        map = L.map('map').setView(coords, 13.5)
    }
    // load the map 
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                // this key is unique for us only, other sites cannot use it 
                accessToken: 'pk.eyJ1IjoiYnJlYWRkb2ciLCJhIjoiY2tvcGxwZG5tMDcxdTJub2VxbmRsdnh3MiJ9.dJLwjpNqKCYyzHqRO9yeHQ'
    }).addTo(map);

    // post request to send customers current location to get 5 nearest vans 
    $.post('/customer/home', {customerLocation: JSON.stringify(coords)}, function(vendors){

        
        if (vendors.length == 0){
            $('#vendorList').append(`<p>Seems like there aren't any vans open yet,<br></br>
            please try ordering within our operating hours!</p>`)
        }
        else{
            // populate 
            $.each(vendors, function(i, vendor){
                var marker = new L.marker(Object.values(vendor.currentLocation), {icon: bluePin}).addTo(map)
                if (locationPermission){
                    marker.bindPopup(`<center><b>${JSON.stringify(vendor.vanName)}</b><br>
                                    ${JSON.stringify(vendor.address)}</br>
                                    ${vendor.distance}km away</center>`)
                }
                else{
                    marker.bindPopup(`<center><b>${JSON.stringify(vendor.vanName)}</b><br>
                                    ${JSON.stringify(vendor.address)}</br>
                                    </center>`)
                }
                
                
                renderOneVendorCard(vendor)
                
            })


        }
        
    }, "json")




}
// client side rendering for less calls 
function renderOneVendorCard(vendor){

    var $vendorList = $('#vendorList')

    $vendorList.append(`<div class="card" id='card${vendor.vendorID}' style="width: 20rem;">
            <h5 class="card-header">${vendor.vanName}</h5>
                <div class="card-body">
                   <p class="card-text" id='address${vendor.vendorID}'></p>
                        <div class="col">
                                <button name="checkStatus" class="btn btn-primary justify-content-center" href="/customer/menu"
                                    role="button" onclick="javascript:postVendorID(${vendor.vendorID})">Choose this van</button>
                        </div>
                    </div>
                </div>
            <br></br>`)

    // address
    if (locationPermission){
        document.getElementById(`address${vendor.vendorID}`).innerHTML = `${vendor.address}<br>(${vendor.distance}km away)</br>`
    }
    else{
        document.getElementById(`address${vendor.vendorID}`).innerHTML = `${vendor.address}`
    }


}


// send off vendorID to menu page to store in session 
function postVendorID(vendorID){

    var form = document.createElement('form')
    form.name = 'sendVendorID'
    form.method = 'POST'
    form.action = '/customer/menu'

    var field = document.createElement('input')
    field.type = 'hidden'
    field.name = 'vendorID'
    field.id = 'vendorID'
    field.value = vendorID

    form.appendChild(field)
    document.body.appendChild(form)

    form.submit()
}


