function canWeExport()
{
	if(typeof(OfflineAudioContext)=="undefined")
	{
		return false;
	}
	return true;
}
function getExportContext(length)
{
	var export_ctx = new OfflineAudioContext(2, length * 48000, 48000);
	export_ctx.oncomplete = function(e) {
	  var audioBuffer = e.renderedBuffer;
	  saveAsWav(audioBuffer)
	};
	return export_ctx;	
}
function startExportOfContext(export_ctx)
{
	export_ctx.startRendering();
}
function saveAsWav(buf)
{
    var bufs=[];
	bufs[0]= buf.getChannelData(0);
	if(buf.numberOfChannels>1)
	bufs[1]= buf.getChannelData(1);
    var data = [];
    var samples = 0;
	
	    // Generate the sine waveform
    for (var i = 0; i < bufs[0].length; i++) {
        for (var c = 0; c < buf.numberOfChannels; c++) 
		{
			var clamped=32767*bufs[c][i];
			if(clamped>32767)clamped=32767;
    		if(clamped<-32767)clamped=-32767;
            data.push(pack("v",clamped ));
            samples++;
        }
	}
    data = data.join('');
	var bitsPerSample=16; // this is standard!
	var channels=2;       // this is standard!
    
    // Format sub-chunk
    var chunk1 = [
        "fmt ", // Sub-chunk identifier
        pack("V", 16), // Chunk length
        pack("v", 1), // Audio format (1 is linear quantization)
        pack("v", buf.numberOfChannels),
        pack("V", buf.sampleRate),
        pack("V", buf.sampleRate * buf.channels * bitsPerSample / 8), // Byte rate
        pack("v", buf.channels * bitsPerSample / 8),
        pack("v", bitsPerSample)
    ].join('');

    // Data sub-chunk (contains the sound)
    var chunk2 = [
        "data", // Sub-chunk identifier
        pack("V", samples * channels * bitsPerSample / 8), // Chunk length
        data
    ].join('');
    
    // Header
    var header = [
        "RIFF",
        pack("V", 4 + (8 + chunk1.length) + (8 + chunk2.length)), // Length
        "WAVE"
    ].join('');

    var out = [header, chunk1, chunk2].join('');
    var dataURI = "data:audio/wav;base64," + escape(btoa(out));
    downloadURI(dataURI,"jouw_geluid.wav");
}
// download directly.
function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.click();
}

// Base 64 encoding function, for browsers that do not support btoa()
// by Tyler Akins (http://rumkin.com), available in the public domain
if (!window.btoa) {
    function btoa(input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + 
                     keyStr.charAt(enc3) + keyStr.charAt(enc4);
        } while (i < input.length);

        return output;
    }
}

// pack() emulation (from the PHP version), for binary crunching
function pack(fmt) {
    var output = '';
    
    var argi = 1;
    for (var i = 0; i < fmt.length; i++) {
        var c = fmt.charAt(i);
        var arg = arguments[argi];
        argi++;
        
        switch (c) {
            case "a":
                output += arg[0] + "\0";
                break;
            case "A":
                output += arg[0] + " ";
                break;
            case "C":
            case "c":
                output += String.fromCharCode(arg);
                break;
            case "n":
                output += String.fromCharCode((arg >> 8) & 255, arg & 255);
                break;
            case "v":
                output += String.fromCharCode(arg & 255, (arg >> 8) & 255);
                break;
            case "N":
                output += String.fromCharCode((arg >> 24) & 255, (arg >> 16) & 255, (arg >> 8) & 255, arg & 255);
                break;
            case "V":
                output += String.fromCharCode(arg & 255, (arg >> 8) & 255, (arg >> 16) & 255, (arg >> 24) & 255);
                break;
            case "x":
                argi--;
                output += "\0";
                break;
            default:
                throw new Error("Unknown pack format character '"+c+"'");
        }
    }
    
    return output;
}
