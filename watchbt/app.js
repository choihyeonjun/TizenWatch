

var SPP_SERVICE_UUID = "00001101-0000-1000-8000-00805F9B34FB";//data 송수신 스타일
var adapter = tizen.bluetooth.getDefaultAdapter();
var mSocket;
//Holds currently open socket
var serviceSocket = null;
var chatServiceHandler = null;
var audio;
var vol = tizen.sound.getVolume("MEDIA");   
var app;


function chatServiceSuccessCb(recordHandler) {
    chatServiceHandler = recordHandler;
    document.getElementById("text_log").innerHTML = "service registration";

    //socket wating
    chatServiceHandler.onconnect = function(socket) {
    	document.getElementById("text_log").innerHTML = "Client connected: " + socket.peer.name;
    	document.getElementById("btnfind").style.visibility = 'visible';
    	serviceSocket = socket;
        mSocket = socket;
        // Messages received from remote device
        socket.onmessage = function() {
             var data = serviceSocket.readData();
             var result = ""; 
           for(var i = 0; i < data.length ; i++ ){
                 result += String.fromCharCode(data[i]);
           }
              if(result === 'find'){      
                    audiostart();
               }
        };
       socket.onclose = function() {
               serviceSocket = null;
           };
        };   
    }

 function errorCb(e) {
     document.getElementById("text_log").innerHTML = e.message;
 }
 
 function audiostart(){
	   vol = tizen.sound.getVolume("MEDIA");
	    tizen.sound.setVolume("MEDIA", 1);
	    audio.play();
	    document.getElementById("btnStop").style.visibility = 'visible';
	}
 
 window.onload = function(){
	   // add eventListener for tizenhwkey
	    ( function () {
	    	window.addEventListener( 'tizenhwkey', function( ev ) {
	    		if( ev.keyName === "back" ) {
	    			var page = document.getElementsByClassName( 'ui-page-active' )[0],
	    				pageid = page ? page.id : "";
	    			if( pageid === "main" ) {
	    				try {
	    					tizen.application.getCurrentApplication().hide();
	    				} catch (ignore) {
	    				}
	    			} else {
	    				window.history.back();
	    			}
	    		}
	    	} );
	    } () );
	    
	    document.getElementById("btnStop").style.visibility = 'hidden';
	    document.getElementById("btnfind").style.visibility = 'hidden';
	    app = tizen.application.getCurrentApplication();

	    tizen.power.request("CPU", "CPU_AWAKE");
	    
	    // 오디오 설정중
	    audio = new Audio('1.mp3');
	    audio.loop = true;


	    
	    audio.addEventListener("pause", function() {
	       tizen.sound.setVolume("MEDIA", vol);

	    }, false);
	    
	    audio.addEventListener("ended", function() {
	       tizen.sound.setVolume("MEDIA", vol);

	       audio.pause();
	    });

	    document.getElementById("btnStop").addEventListener("click", function(){
	       audio.pause();
	        document.getElementById("btnStop").style.visibility = 'hidden';
	        audio.currentTime=0;

	    }, false);

	    // 오디오 설정 여기까지

	   document.getElementById("btnService").addEventListener("click", function() {
	      adapter.registerRFCOMMServiceByUUID(SPP_SERVICE_UUID, "SPP", chatServiceSuccessCb, errorCb );
	   }, false);

};//on load

	document.getElementById("btnfind").addEventListener("click", function() {
	    var data = "find";
	   var result = [];
	   //text를 읽음 -> 유니코드로 문자의 길이만큼 변환해서 result의 배열에 넣는다.
	   for(var i = 0; i < data.length; i++ ) {
	      result.push(data.charCodeAt(i));//index에 해당하는 문자의 unicode 값을 리턴
	    }try {
	        if (mSocket !== null && mSocket.state === 'OPEN') {
	           mSocket.writeData(result);
	            document.getElementById("text_result").innerHTML = "Sended data: " + data;
	        }
	    } catch (error) {
	       document.getElementById("text_result").innerHTML = "sendPing : " + error.message;
	    }
	}, false);
