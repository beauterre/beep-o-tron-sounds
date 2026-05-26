window.onload=init;

var audioCtx;
if (typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    /*jshint newcap:false*/
    audioCtx = new webkitAudioContext();
} else {
    window.alert("WebAudio isn't supported in this browser yet :-(");
    throw new Error('AudioContext not supported. :(');
}
var mod, modGain, osc;
var out = audioCtx.destination;
	 var channels = 2;
	// Create an empty two second stereo buffer at the
	// sample rate of the AudioContext
	var frameCount = audioCtx.sampleRate * 2.0;
	var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);


function init()
{
	var started = false;
	document.getElementById("start").onclick = startTest;
}



function startTest()
{
	 console.log("test");
  //just random values between -1.0 and 1.0
  for (var channel = 0; channel < channels; channel++) {
   // This gives us the actual ArrayBuffer that contains the data
   var nowBuffering = myArrayBuffer.getChannelData(channel);
   var value=0,low_pass=0,a=0;
   for (var i = 0; i < frameCount; i++) {
     // Math.random() is in [0; 1.0]
     // audio needs to be in [-1.0; 1.0]
	 
	 var p;
	 p=Math.floor(i/440)%4;
	// if(Math.random()<0.1)
		//p=Math.floor(Math.random()*4);
	 switch(p%4)
	 {
		case 0:
			 a=a*1.08+0.1 ; // decent test tone;			
		break;
		case 1:
			 a=-1.1*a-0.3; // decent test tone;			
		break;
		case 2:
			 a=a*0.9-0.3 ; // decent test tone;			
		break;
		case 3:
			 a=a*0.9+0.05 ; // decent test tone;			
		break;
	 }
	 value=Math.sin(a/2) ; // decent test tone;			
	 low_pass=low_pass*0.99+0.01*value;
     nowBuffering[i] = low_pass;
   }
  }

  // Get an AudioBufferSourceNode.
  // This is the AudioNode to use when we want to play an AudioBuffer
  var source = audioCtx.createBufferSource();
  // set the buffer in the AudioBufferSourceNode
  source.buffer = myArrayBuffer;
  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(audioCtx.destination);
  // start the source playing
  source.start();
}

// UI
