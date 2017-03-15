$(document).ready(function() {
    var userId = $("#textarea_chat").data('chat-from');
    var chatUserId = $("#textarea_chat").data('chat-to');
    var isTyping = false; //to avoid duplicate timeouts

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        console.log("browser do not support web sockets");
    }

    var connection = new WebSocket('ws://192.168.1.13:1337', 'echo-protocol');

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
          console.log("There's something wrong with the server");
        }
    }, 3000);

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        console.log("There's a problem with the connection");
        console.log(error);
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
      try {
          var msg = JSON.parse(message.data);

          if (msg.chatUserId == userId && msg.userId == chatUserId) { //check if message is for me
            if (msg.action == "typing") { //check if the user is still typing
              if (!isTyping) {
                $("#p_typing").show();
                isTyping = true;

                setTimeout(function() {
                  $("#p_typing").hide();
                  isTyping = false;
                }, 2000); //2 seconds after it will hide it again
              }
            } else if (msg.action == "sent") { //otherwise if message is sent
              $("#p_typing").hide();

              //build the chat bubble
              var chat_bubble_id = $("#ul_chat_list > li").length + 1; //new bubble id

              var li_chat_bubble = $("<li class='list-group-item text-left'></li>");
              $(li_chat_bubble).append(msg.msg + "<br>");

              $("#ul_chat_list").append(li_chat_bubble); //add the message

              $("#li_no_chat").remove(); //remove the "no chat" message
            }
          }
      } catch (e) {
          console.log('This doesn\'t look like a valid JSON: ', message.data);
          return;
      }
    };

    $("#form_message").submit(function(e) {
      e.preventDefault();

      if ($("#textarea_chat").val().length > 0) { //validate if the message is not empty
        var sendingMsg = {
          action: "sent",
          userId: userId,
          chatUserId: chatUserId,
          msg: $("#textarea_chat").val()
        }; //construct the message for "sent" action

        var chat_bubble_id = $("#ul_chat_list > li").length + 1; //new bubble id

        $.post("add_chat", sendingMsg, function(data) {
          try {
            var response = JSON.parse(data);

            if (response.status == 200) { //OK status
              $("#span_" + chat_bubble_id).html("Sent"); //mark the bubble as sent

              setTimeout(function() {
                $("#span_" + chat_bubble_id).hide();
              }, 2000); //hide after successful message
            } else {
              $("#span_" + chat_bubble_id).html("Failed"); //mark the bubble as failed
            }

            connection.send(JSON.stringify(sendingMsg)); //send the message to the server to send to all clients
          } catch (err) {
            console.log(err);
          }
        }); //save to database

        //build the chat bubble
        var li_chat_bubble = $("<li class='list-group-item text-right'></li>");
        $(li_chat_bubble).append($("#textarea_chat").val() + "<br>" + "<span id='span_" + chat_bubble_id + "'>Sending</span>");

        $("#ul_chat_list").append(li_chat_bubble); //add the message

        $("#li_no_chat").remove(); //remove the "no chat" message
        $("#textarea_chat").val(""); //clear the text box
      }
    });

    $("#textarea_chat").keyup(function() { //setup the onkeyup of the chat to send "typing..."
      var typingMsg = {
        action: "typing",
        userId: userId,
        chatUserId: chatUserId,
        msg: ""
      }; //construct the message for "typing" action

      connection.send(JSON.stringify(typingMsg)); //send the message to the server to send to all clients
    });
});
