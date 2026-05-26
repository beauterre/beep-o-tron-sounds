    window.onload = initPage();

    var context;
    var mod, modGain, osc;

    var out = context.destination;

    function initPage() {
        if (typeof AudioContext !== "undefined") {
            context = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            /*jshint newcap:false*/
            context = new webkitAudioContext();
        } else {
            window.alert("WebAudio isn't supported in this browser yet :-(");
            throw new Error('AudioContext not supported. :(');
        }
    }

	function setPreset(str)
    {
        switch(str)
        {
            case "hit":
                document.getElementById("length").value=0.2;
                document.getElementById("crunch").value=4000;
                document.getElementById("complexity").value=4;
            break;
            case "explo":
                document.getElementById("length").value=1;
                document.getElementById("crunch").value=10000;
                document.getElementById("complexity").value=4;
            break;
            case "bonus":
                document.getElementById("length").value=0.5;
                document.getElementById("crunch").value=300;
                document.getElementById("complexity").value=1;
            break;
        }
        showVal(document.getElementById("complexity").value,'cv');
        showVal(document.getElementById("crunch").value,'crv');
        document.getElementById("start").click();
    }
    function showVal(v,w){
        document.getElementById(w).innerHTML=v;
    }// must be defined here, else the scope is onload!

	
    function randomType() {
        var tps = ["sine", "square", "triangle", "sawtooth"];
        return tps[Math.floor(Math.random() * tps.length)];
    }

    function deleteModulator(mod) {
        mod.o.stop(0);
        mod.g = null;
        mod.o = null;
        mod = null;
    }

    function createModulator(freq) {
        var o = {};
        o.o = context.createOscillator();
        o.t = randomType();
        o.o.type = o.t;
        o.f = Math.random() * freq + 0.1;
        o.o.frequency.value = o.f;
        o.g = context.createGain();
        var crunch = document.getElementById("crunch").value;
        o.gv = crunch * Math.random();
        o.g.gain.value = o.gv;
        o.o.connect(o.g);
        o.o.start(0);
        return o;
    }

    var startTest = function() {
        mod1 = createModulator(1);
        mod2 = createModulator(2);
        mod3 = createModulator(3);
        mod4 = createModulator(4);
        mod5 = createModulator(10);

        osc = context.createOscillator();
        osc.frequency.value = 20 + Math.random() * 1000;

        var complex = document.getElementById("complexity").value;
        if (complex >= 4) mod5.g.connect(mod4.o.frequency);
        if (complex >= 3) mod4.g.connect(mod3.o.frequency);
        if (complex >= 2) mod3.g.connect(mod2.o.frequency);
        if (complex >= 1) mod2.g.connect(mod1.o.frequency);
        mod1.g.connect(osc.frequency);

        var l = parseFloat(document.getElementById("length").value);

        var env = context.createGain();
        osc.connect(env);
        env.connect(out); //context.destination
        var now = context.currentTime;
        env.gain.cancelScheduledValues(now);
        env.gain.setValueAtTime(env.gain.value, now);
        env.gain.linearRampToValueAtTime(0, now + l);
        //    osc.connect(out);
        osc.start(0);
        started = true;
        setTimeout(stopTest, l * 1000);
    };

    function stopTest() {
        osc.stop(0);
        deleteModulator(mod1);
        deleteModulator(mod2);
        deleteModulator(mod3);
        deleteModulator(mod4);
        mod1 = mod2 = mod3 = mod4 = mod5 = osc = null;
        started = false;
        document.getElementById("start").innerHTML = "RandomNoise";
    }

    // UI

    var started = false;
    document.getElementById("start").onclick = function() {
        if (started) {
            this.innerHTML = "RandomNoise";
            stopTest();
        } else {
            this.innerHTML = "stop";
            startTest();
        }
    }