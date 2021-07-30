// listener on enter for either first or last name depending 
document.addEventListener('keydown', function (event) {
    var enter = (event.key === "Enter"),
        el = event.target,
        input = el.nodeName != 'INPUT' && el.nodeName != 'TEXTAREA',
        data = {};

    if (input) {
        if (enter) {

            // in case we have any html brackets in there 
            data[el.getAttribute('data-name')] = el.innerHTML.replace(/<[a-zA-Z\/]+>/, "");
            // retrieve customer id from url
            var link = window.location.href.split('/')
            var id = link[link.length - 1]

            // Send ajax request to update the field and save to db
            $.post(`${id}/updateName`, data,  
                // on return we get a message we need to show   
                function(msg){
                    alert(msg)
            })
                  
            el.blur();
            event.preventDefault();
        }
    }   
}, true);