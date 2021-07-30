
// anything sus about the fields?
function checkIfFieldsEmpty(a, b, message){
    if (a.length == 0 || b.length == 0){
        return true
    }
    return false
}

// create cookie
function createCookie(name, value){
    if (!checkIfFieldsEmpty(name, value, "Its empty you dingus")){
        document.cookie = `${name}=${value}; SameSite=Strict`
    }
}

// get a cookie
function getCookie(name){
    if (name.length == 0){
        return undefined
    }
    
        
    // try to find that cookie 
    var cookie = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
    // .split('=')[0];

    // empty
    if (cookie === undefined){
        return undefined
    }
    

    // then otherwise we just return it?
    // all cookies are an object file
    
    // how do we want to return it 
    return cookie
}

// return value of cookie
function getCookieValue(name){
    var cookie = getCookie(name)

    if (cookie !== undefined){
        return cookie.split('=')[1]
    }
    return undefined
    
}

// remove cookie
function removeCookie(name){

    if (!name.length){
        return false
    }

    // find the cookie we want to yeet
    var cookie = getCookie(name)

    // if cookie exists
    if (cookie !== undefined){

        cookie = cookie.split('=')
        // set it to a value of expires now
        document.cookie = `${cookie[0]}=; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=localhost; path=/`


    }
    return false


}