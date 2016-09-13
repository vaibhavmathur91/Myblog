$(document).ready(function() {
    /* Infinite Scroll */
    var win = $(window);
    // Each time the user scrolls
    win.scroll(function() {
        // End of the document reached?
        if ($(document).height() - win.height() == win.scrollTop()) {
        }
    });

    /* register form submit */
    $(".register-form-submit").on("click", function(){
        var availability = "";
        var Passmatch = "";
        var Emailmatch = ""
        var usernamematch = ""
        var element = $(this);
        var User_name = $(this).closest(".register-form").find("#usrname");
        //availability = check_availability(User_name.val());
        check_availability(User_name.val(), function (message) {
            availability = message;
            if (User_name.val() == "") {
                UserAvailableMessage("empty");
                availability = "error"
            }
            var sEmail = $(element).closest(".register-form").find("#email");
            var firstname = $(element).closest(".register-form").find("#fname");
            var pwdConf = $(element).closest(".register-form").find("#password_confirm");
            var pwd = $(element).closest(".register-form").find("#password");
            if (pwd.val() == "" && pwdConf.val() == "") {
                PasswordMatch("empty");
                Passmatch = "error";

            }
            else if (pwd.val() != pwdConf.val()) {
                PasswordMatch("error");
                Passmatch = "error";
            }
            else {
                PasswordMatch("success");
                Passmatch = "success";
            }

            if (validateEmail(sEmail.val())) {
                Emailmatch = "success"
            }
            else {
                Emailmatch = "error"
            }
            if (firstname.val() != "" ){
                checkNamecss('success')
                usernamematch = "success"
            }
            else{
                checkNamecss('error')
                usernamematch = "error"
            }
            if(availability == "success" && Passmatch == "success" && Emailmatch == "success" && usernamematch == "success")
            alert("all is fine");
        });
        return false;
    });
    /* Check Availability */
    $("#check_username_availability").on("click", function() {
        var User_name = $(this).closest(".register-form").find("#usrname");
        if(User_name.val() == ""){
            UserAvailableMessage("empty")
        }
        else{
            check_availability(User_name.val());
        }
        return false;
    });
});//document.ready function

function check_availability(user_name, callback){
    var msg = '';
    $.ajax({
        type: "POST", 		//GET or POST or PUT or DELETE verb
        url: "home/check_avail", 		// Location of the service
        data:
        {
            'username': user_name
        }, 		//Data sent to server
        dataType: "json" 	//Expected data format from server
    }).done(function(json) {//On Successful service call
            var result = json.get_avail;
            UserAvailableMessage(result);
            msg = result;
            callback(msg);
    }).fail(function() {
            UserAvailableMessage("error");
            msg =  'error';
            callback(msg);
    });

}

function UserAvailableMessage(message){
    if(message == 'success'){
        if ($(".arrow-up").hasClass("arrow-up-error")){
            $(".arrow-up").removeClass("arrow-up-error")
        }
        if ($( ".user-exist-msg" ).hasClass( "user-msg-error")){
            $( ".user-exist-msg" ).removeClass( "user-msg-error")
        }
        $( ".arrow-up" ).addClass( "arrow-up-success" );
        $( ".user-exist-msg" ).addClass( "user-msg-success" );
        $( ".user-exist-tag").css("display","initial");
        $( ".user-exist-msg" ).html("Username Available")
    }
    else if(message == 'empty'){
        if ($(".arrow-up").hasClass("arrow-up-success")){
            $(".arrow-up").removeClass("arrow-up-success")
        }
        if ($( ".user-exist-msg" ).hasClass( "user-msg-success")){
            $( ".user-exist-msg" ).removeClass( "user-msg-success")
        }
        $( ".arrow-up" ).addClass( "arrow-up-error" );
        $( ".user-exist-msg" ).addClass( "user-msg-error" );
        $( ".user-exist-tag").css("display","initial");
        $( ".user-exist-msg" ).html("Username Field Empty")
    }
    else{
        $( ".arrow-up" ).addClass( "arrow-up-error" );
        $( ".user-exist-msg" ).addClass( "user-msg-error" );
        $( ".user-exist-tag").css("display","initial");
        $( ".user-exist-msg" ).html("Username Not Available")
    }
}


function PasswordMatch(message){
    if(message == 'error'){
        $(".password-mismatch-tag").css("display", "initial");
        $(".pass-mismatch").html("Password Not matched")
    }
    else if(message == 'empty'){
        $(".password-mismatch-tag").css("display", "initial");
        $(".pass-mismatch").html("Password Field Empty")
    }
    else{
        $(".password-mismatch-tag").css("display", "none");
    }
}

function validateEmail(sEmail) {
    var filter = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
    if (filter.test(sEmail)) {
        $("#email").css("border", "1px solid #ccc");
        return true;
    }
    else {
        $("#email").css("border-color", "red");
        return false;
    }
}

function checkNamecss(choice){
    if (choice=='success') {
        $("#fname").css("border", "1px solid #ccc");
    }
    else {
        $("#fname").css("border-color", "red");
    }
}