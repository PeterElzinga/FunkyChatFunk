var blockedMembers = new Array();

function arrayRemove(arr, value) { 
  return arr.filter(function(ele){ 
      return ele != value; 
  });
}

function blockMember(member_id){
  if( member_id == user.id ){
    alert("Je kan jezelf niet blokkeren!");
    return;
  }
  
  if( !(blockedMembers.includes( member_id )) ){
    blockedMembers.push(member_id);
    $('li#member_'+member_id).find('img').first().attr('src', 'https://cdn-icons-png.flaticon.com/512/718/718672.png');
    alert("Gebruiker "+chatChannel.members.members[member_id].name+" is geblokkeerd");
  } else {
    blockedMembers = arrayRemove( blockedMembers, member_id );
    $('li#member_'+member_id).find('img').first().attr('src', chatChannel.members.members[member_id].image.src );
    alert("Gebruiker "+chatChannel.members.members[member_id].name+" is gedeblokkeerd");
  }
}

function isBlockedMember(member_id){
  return blockedMembers.includes( member_id );
}

function ifInactiveRedirectToLobby(){return false}
function redirectToLobby(){return false}

chatChannel.bind("pusher:member_added", function(member) {
  if( member.id == user.id ){
    return false;
  }

  //Wait for some seconds before continueing
  setTimeout(function () {
    //Member gone? abort!
    if( !( member.id in chatChannel.members.members ) ){
      return false;
    }
    $('#chatAudio2')[0].play();
  }, 6500);
});

chatChannel.bind("pusher:member_removed", function(member) {
  console.log(member.info.name + " left after "+(new Date() - Date.parse(member.info.time)) + "ms");
  //if member hasn't been online for more than X seconds
  if( ( new Date() - Date.parse(member.info.time) ) < 6000 ){
    return false;
  }
  $('#chatAudio3')[0].play();
});

/* Functions */
function appendToChat(element){
  $('div#chat-window-content').append(element);
  $('div#chat-window-content').animate({scrollTop: $('div#chat-window-content').prop("scrollHeight")}, 0);
}

/* Main code */
$(document).ready(function() { 
  //Add audio fragments
  $('<audio id="chatAudio1"><source src="https://raw.githubusercontent.com/IonDen/ion.sound/master/sounds/tap.mp3" type="audio/mpeg"></audio>').appendTo('body');
  $('<audio id="chatAudio2"><source src="https://raw.githubusercontent.com/IonDen/ion.sound/master/sounds/door_bell.mp3" type="audio/mpeg"></audio>').appendTo('body');
  $('<audio id="chatAudio3"><source src="https://raw.githubusercontent.com/IonDen/ion.sound/master/sounds/door_bump.mp3" type="audio/mpeg"></audio>').appendTo('body');

  //Remove useless parts
  $("#divHeaderTopContainer").remove();
  $("#headerContainer").remove();
  $(".menuDesktop").remove();
  $(".divFooterContainer").remove();
  $("href['/chatrooms/']").remove();
  $(".paddingContainer > .floatRight").remove();
  $("#chat-window-top").remove();

  //Adjustments
  $("div#chat-window-content").height('98vh');
  $("div#chat-container").height('98vh');
  $("div#chat-container").css("flex-direction","row-reverse")
  $("#message").attr('autocomplete', 'off');
  $("#siteInnerCon").css("width", '98vw');
  $("#siteInnerCon").css("max-width", '100vw');
  $("#chat-channel-occupants").css('flex-basis', '18%');
  $("#siteContainer").css("margin", "1vh");
  $("#siteContainer").css("padding", "0px");
  $("#contentContainer").css("max-height", "98vh");
  $("#main-container").css("padding", "0px");
  $("html").css('overflow: hidden');
});

function linkify(text, target="_blank") {
    var urlRegex =/(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    var giphyRegex = /(\b(?<=https:\/\/media\.giphy\.com\/media\/)[-A-Za-z0-9]*(?=\/giphy\.gif))/ig;

    if( null !== (giphyCode = text.match( giphyRegex )) ) {
      text = text.replace( giphyRegex, '');
      text = '<p>'+ text + '</p><iframe src="https://giphy.com/embed/'+ giphyCode +'" width="240" height="240" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>';
    } else {
      //other URL's
      text =  text.replace(urlRegex, function(url) {
        return '<a class="menu" href="' + url + '" target="'+target+'">' + url + '</a>';
      });
    }
    return text;
}



//Overriding the default function
function renderChatMessage(data){
  if( isBlockedMember(data.user.id) ){
    console.log("Message from blocked member "+data.user+":\n"+data.message.body);
    return false;
  }

  data.message.body = linkify(data.message.body);
  
  var template = '<div class="divFlex spaceBetween paddingSmall borderBottom color2br widthAuto"><div class="flexGrowDefault" style="padding-left: 5px"><div class="divFlex spaceBetween fontSmall"><div><strong>{{user.name}} - {{message.time}}</strong></div></div><div>{{{message.body}}}</div></div></div>';
  var messageTemplate = $(template).html();
  Mustache.parse(messageTemplate);
  //Don't play if message is from me
  if( data.user.id != user.id ){
    $('#chatAudio1')[0].play();
  }
  //Display message
  return Mustache.render(messageTemplate, data);
}

//Overriding the default function
function renderUserInfo(data){
  var messageTemplate='<div class="divFlex spaceBetween"><div class="marginRightMedium flexShrinkDefault"><a href="{{{user.url}}}" target="_blank"><img src="{{user.image.src}}" alt="{{user.image.alt}}" class="radiusSmall square80"></a><div class="clearBoth marginTopSmall">{{user.name}}</div><div class="clearBoth fontSmall">{{user.age}}, {{user.gender}}</div><div class="clearBoth fontSmall">{{user.profession}}</div><a href="javascript:blockMember({{user.id}});">Blokkeer</a> | <a class="kick-action color3 cursorP" data-id="{{user.id}}">Kick</a></div><div><div class="fontSmall color1d marginBottomSmall">In kanaal vanaf: {{timeInChannel}}</div><div class="doBold fontBig color3 marginBottomMedium">{{{user.bio.title}}}</div><div>{{user.bio.body}}</div></div></div>';
  Mustache.parse(messageTemplate);
  return Mustache.render(messageTemplate, data);
}
