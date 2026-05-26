var context;

var recipe={};
recipe.o=[];
recipe.v=1;
recipe.l=1;
recipe.e=[{t:0,v:1},{t:1,v:0}];// envelop fade
recipe.o.push({t:0,f:100,v:1,c:-1});// -1 is carrier
recipe.o.push({t:1,f:1,v:0.5,c:0,m:"f"});// >=0 is modulator , m=frequency
recipe.o.push({t:1,f:2,v:0.5,c:1,m:"f"});// >=0 is modulator
recipe.o.push({t:1,f:3,v:0.5,c:2,m:"f"});// >=0 is modulator
recipe.o.push({t:1,f:4,v:0.5,c:3,m:"f"});// >=0 is modulator
recipe.o.push({t:1,f:4,v:0.5,c:4,m:"f"});// >=0 is modulator
recipe.o.push({t:1,f:4,v:0.5,c:5,m:"f"});// >=0 is modulator

if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    /*jshint newcap:false*/
    context = new webkitAudioContext();
} else {
    window.alert("WebAudio isn't supported in this browser yet :-(");
    throw new Error('AudioContext not supported. :(');
}

var mod, modGain, osc;

var out = context.destination;
function getType(i)
{
    var tps=["sine","square","triangle","sawtooth"];
    return tps[i];
}
function createModulator(f,t,v)
{
    var o={};
    o.o=context.createOscillator();
    o.t=getType(t);
    o.o.type=o.t;
    o.f=f;
    o.o.frequency.value = o.f;
    o.g=context.createGain();
    o.gv=v;
    o.g.gain.value =o.gv;
    o.o.connect(o.g);
    return o;
}
function createCarrier(f,t,v)
{
    var o={};
    o.o=context.createOscillator();
    o.t=getType(t)
    o.o.type=o.t;
    o.f=f;
    o.o.frequency.value = o.f;
    o.g=context.createGain();
    o.gv=v;
    o.g.gain.value =o.gv;
    o.o.connect(o.g);
    return o;
}

function createRecipe()
{
	var recipe={};
	recipe.o=[];
	recipe.v=1;
	recipe.l=0.1+Math.round(Math.random()*20)/10;
	recipe.e=[{t:0,v:1},{t:1,v:0}];// envelop fade
	recipe.o.push({t:Math.floor(Math.random()*4),f:100+1000*Math.random(),v:1,c:-1});// -1 is carrier
	recipe.o.push({t:Math.floor(Math.random()*4),f:1*Math.random()+0.1,v:Math.random()*1000,c:0,m:"f"});// >=0 is modulator , m=frequency
	recipe.o.push({t:Math.floor(Math.random()*4),f:2*Math.random()+0.1,v:Math.random()*1000,c:1,m:"f"});// >=0 is modulator
	recipe.o.push({t:Math.floor(Math.random()*4),f:3*Math.random()+0.1,v:Math.random()*1000,c:2,m:"f"});// >=0 is modulator
	recipe.o.push({t:Math.floor(Math.random()*4),f:4*Math.random()+0.1,v:Math.random()*1000,c:3,m:"f"});// >=0 is modulator
	recipe.o.push({t:Math.floor(Math.random()*4),f:10*Math.random()+0.1,v:Math.random()*1000,c:4,m:"f"});// >=0 is modulator
	var i;
	// make values neater
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		o.f=Math.round(o.f*10)/10;
		o.t=Math.round(o.t*10)/10;
		o.v=Math.round(o.v*10)/10;
	}
	return recipe;
}
var playBeepoTron = function(r,v,ps)
{
    mod1 = createModulator(r.o[1].f,r.o[1].t,r.o[1].v);
    mod2 = createModulator(r.o[2].f,r.o[2].t,r.o[2].v);
    mod3 = createModulator(r.o[3].f,r.o[3].t,r.o[3].v);
    mod4 = createModulator(r.o[4].f,r.o[4].t,r.o[4].v);
    mod5 = createModulator(r.o[5].f,r.o[5].t,r.o[5].v);
	osc =createCarrier(r.o[0].f,r.o[0].t,r.o[0].v);
	
    var complex=r.o.length-1;
    if(complex>=4) mod5.g.connect(mod4.o.frequency);
    if(complex>=3) mod4.g.connect(mod3.o.frequency);
    if(complex>=2) mod3.g.connect(mod2.o.frequency);
    if(complex>=1) mod2.g.connect(mod1.o.frequency); // mod1.o.volume
    mod1.g.connect(osc.o.frequency);
    
    var l=r.l;
    
    var env = context.createGain();
    osc.g.connect(env);
    env.connect(out); //context.destination
    var now = context.currentTime;
    env.gain.cancelScheduledValues(now);
    env.gain.setValueAtTime(1, now);
    env.gain.linearRampToValueAtTime(0 , now + l);
    osc.o.start(now);
    osc.o.stop(now+l);
    mod1.o.start(now);
    mod1.o.stop(now+l);
    mod2.o.start(now);
    mod2.o.stop(now+l);
    mod3.o.start(now);
    mod3.o.stop(now+l);
    mod4.o.start(now);
    mod4.o.stop(now+l);
    mod5.o.start(now);
    mod5.o.stop(now+l);
};



