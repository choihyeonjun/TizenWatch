var SPP_SERVICE_UUID = "00001101-0000-1000-8000-00805F9B34FB";//data 송수신 스타일
var adapter = tizen.bluetooth.getDefaultAdapter();
var mSocket;
var mDevice;
var audio;
var vol = tizen.sound.getVolume("MEDIA");   
var app;

var discoverDevicesSuccessCallback =
{
   /* When a device is found */
   ondevicefound: function(device)
   {
      mDevice = device;
      var selectValue = document.getElementById("address");
      selectValue.add(new Option(device.name, device.address));
      
   }
};
//Bonding
function onBondingSuccessCallback(device)
{
    mDevice = device;
    
    mDevice.connectToServiceByUUID(SPP_SERVICE_UUID, function(sock) {
	      mSocket = sock;
	      sock.onmessage = function () {
	             var data = sock.readData();
	             var result = "";
	             
	             for(var i = 0; i < data.length ; i++ ) {
	                result += String.fromCharCode(data[i]);
	             }
	             if(result === 'find'){      
	                audiostart();
	             }  
	        };
	        document.getElementById("findwatch").style.visibility = 'visible';
	    },
	    function() {
	    });   
}
function onBondingErrorCallback(){
	
}
function audiostart(){
   vol = tizen.sound.getVolume("MEDIA");
    tizen.sound.setVolume("MEDIA", 1);
    audio.play();
    document.getElementById("btnStop").style.visibility = 'visible';
}
function snackBar1() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
function change(message){
    document.all("snackbar").innerHTML=message;
  }
function snackBar(message){
	change(message);
	snackBar1();
}
window.onload = function(){
   // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
               app.hide();
            } catch (ignore) {
            	
            }
        }
    });
    document.getElementById("btnStop").style.visibility = 'hidden';
    document.getElementById("findwatch").style.visibility = 'hidden';
    app = tizen.application.getCurrentApplication();
    
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
    document.getElementById("btnSearch").addEventListener("click", function() {
    	if(adapter.powered){
    		adapter.discoverDevices(discoverDevicesSuccessCallback, null);
    	}else{
    		snackBar("Please Turn on Bluetooth");
    	}
     }, false);
    
   document.getElementById("btnService").addEventListener("click", function() {
      ////SPP_SERVICE_UUID
	  var data = document.getElementById("address").value;
	  //adapter.createBonding("AC:EE:9E:BE:C3:22", onBondingSuccessCallback, onBondingErrorCallback);
	  adapter.createBonding(data, onBondingSuccessCallback, onBondingErrorCallback);
   }, false);
};//on load

document.getElementById("findwatch").addEventListener("click", function() {
    var data = "find";
   var result = [];
   //text를 읽음 -> 유니코드로 문자의 길이만큼 변환해서 result의 배열에 넣는다.
   for(var i = 0; i < data.length; i++ ) {
      result.push(data.charCodeAt(i));//index에 해당하는 문자의 unicode 값을 리턴
    }try {
        if (mSocket !== null && mSocket.state === 'OPEN') {
           mSocket.writeData(result);
        }
    } catch (error) {
    }
}, false);