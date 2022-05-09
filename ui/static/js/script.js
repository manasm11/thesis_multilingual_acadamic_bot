var chat_id = String(Math.random());
var DEFAULT_LANG = "en";
var lang = DEFAULT_LANG;
var SpeechRecognition;
var recognition;
var micClicked = false;

$(document).ready(function () {
  send("Hello");
  // new speech recognition object
  SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  recognition = new SpeechRecognition();
});

//------------------------------on input/text enter---------------------------------------------------
$(".usrInput").on("keyup keypress", function (e) {
  var keyCode = e.keyCode || e.which;
  var text = $(".usrInput").val();
  if (keyCode === 13) {
    if (text == "" || $.trim(text) == "") {
      e.preventDefault();
      return false;
    } else {
      $(".usrInput").blur();
      setUserResponse(text);
      send(text);
      e.preventDefault();
      return false;
    }
  }
});

//------------------------------------- Set user response------------------------------------
function setUserResponse(val) {
  var UserResponse =
    '<img class="userAvatar" src=' +
    "./static/img/userAvatar.jpg" +
    '><p class="userMsg">' +
    val +
    ' </p><div class="clearfix"></div>';
  $(UserResponse).appendTo(".chats").show("slow");
  $(".usrInput").val("");
  scrollToBottomOfResults();
  // $('.suggestions').remove();
}

//---------------------------------- Scroll to the bottom of the chats-------------------------------
function scrollToBottomOfResults() {
  var terminalResultsDiv = document.getElementById("chats");
  terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
}

function send(message) {
  console.log("User Message:", message);

  $.ajax({
    url: "http://localhost:8080/message",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      message: message,
      chat_id: chat_id,
    }),
    success: function (data, textStatus) {
      if (data != null) {
        setBotResponse(data);
      }
      console.log("Bot Response: ", data, "\n Status:", textStatus);
    },
    error: function (errorMessage) {
      setBotResponse("");
      console.error("Error" + errorMessage);
    },
  });
}

//------------------------------------ Set bot response -------------------------------------
function setBotResponse(val) {
  setTimeout(function () {
    if (val.length < 1) {
      //if there is no response from Bot
      msg = "I cannot connect to server! Please try again!";

      var BotResponse =
        '<img class="botAvatar" src="./static/img/botAvatar.png"><p class="botMsg">' +
        msg +
        '</p><div class="clearfix"></div>';
      $(BotResponse).appendTo(".chats").hide().fadeIn(1000);
    } else {
      //if we get response from Bot
      for (i = 0; i < val.length; i++) {
        //check if there is text message
        if (val[i].hasOwnProperty("text")) {
          lang = val[i]["lang"] || DEFAULT_LANG;
          var BotResponse =
            '<img class="botAvatar" src="./static/img/botAvatar.png"><p class="botMsg">' +
            val[i].text;
          if (val[i].hasOwnProperty("buttons")) {
            for (j = 0; j < val[i]["buttons"].length; j++)
              BotResponse +=
                '<button class="lang_button" id="te_btn" onclick=\'send("' +
                val[i]["buttons"][j].payload +
                "\")'>" +
                val[i]["buttons"][j].title +
                "</button>";
          }
          BotResponse += '</p><div class="clearfix"></div>';

          $(BotResponse).appendTo(".chats").hide().fadeIn(1000);
        }

        //check if there is image
        if (val[i].hasOwnProperty("image")) {
          var BotResponse =
            '<div class="singleCard">' +
            '<img class="imgcard" src="' +
            val[i].image +
            '">' +
            '</div><div class="clearfix">';
          $(BotResponse).appendTo(".chats").hide().fadeIn(1000);
        }

        //check if there is  button message
        // if (val[i].hasOwnProperty("buttons")) {
        // 	addSuggestion(val[i].buttons);
        // }
      }
      scrollToBottomOfResults();
    }
  }, 500);
}

// ------------------------------------------ Toggle chatbot -----------------------------------------------
$("#profile_div").click(function () {
  $(".profile_div").toggle();
  $(".widget").toggle();
  scrollToBottomOfResults();
});

$("#close").click(function () {
  $(".profile_div").toggle();
  $(".widget").toggle();
});

// ------------------------------------------ Speech Recognition -----------------------------------------------
function runSpeechRecognition() {
  if (micClicked) recognition.stop();
  micClicked = !micClicked;
  // get output div reference
  var output = document.getElementById("keypad");
  // get action element reference
  var micbtn = document.getElementById("mic");

  /// or use next line instead of above two
  // var recognition = new webkitSpeechRecognition();

  // recognition.continuous = true;
  // recognition.interimResults = true;
  recognition.lang = lang;

  // This runs when the speech recognition service starts
  recognition.onstart = function () {
    console.log("listening, please speak...");
    $("#keypad").hide();
    $("#listening").show();
    micbtn.style.backgroundColor = "rgb(96,114,230)";
  };

  const onEndFunc = function () {
    console.log("stopped listening, hope you are done...");
    $("#keypad").show();
    $("#listening").hide();
    recognition.stop();
    micbtn.style.backgroundColor = "transparent";
  };

  recognition.onspeechend = onEndFunc;
  recognition.onend = onEndFunc;
  recognition.onerror = onEndFunc;

  // This runs when the speech recognition service returns result
  recognition.onresult = function (event) {
    var transcript = event.results[0][0].transcript;
    output.value = transcript;
    var confidence = event.results[0][0].confidence;
    console.log({ transcript, confidence });
    output.innerHTML =
      "<b>Text:</b> " +
      transcript +
      "<br/> <b>Confidence:</b> " +
      confidence * 100 +
      "%";
    output.classList.remove("hide");
    output.focus();
  };

  console.log(recognition);
  // start recognition
  recognition.start();
  // setTimeout(recognition.stop, 5000);
}

// ------------------------------------------ Suggestions -----------------------------------------------

// function addSuggestion(textToAdd) {
// 	setTimeout(function () {
// 		var suggestions = textToAdd;
// 		var suggLength = textToAdd.length;
// 		$(' <div class="singleCard"> <div class="suggestions"><div class="menu"></div></div></diV>').appendTo('.chats').hide().fadeIn(1000);
// 		// Loop through suggestions
// 		for (i = 0; i < suggLength; i++) {
// 			$('<div class="menuChips" data-payload=\''+(suggestions[i].payload)+'\'>' + suggestions[i].title + "</div>").appendTo(".menu");
// 		}
// 		scrollToBottomOfResults();
// 	}, 1000);
// }

// // on click of suggestions, get the value and send to bot
// $(document).on("click", ".menu .menuChips", function () {
// 	var text = this.innerText;
// 	var payload= this.getAttribute('data-payload');
// 	console.log("button payload: ",this.getAttribute('data-payload'))
// 	setUserResponse(text);
// 	send(payload);
// 	$('.suggestions').remove(); //delete the suggestions
// });
