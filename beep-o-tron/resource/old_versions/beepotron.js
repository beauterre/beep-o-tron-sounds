var context;

var recipe=createRecipe();

if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    /*jshint newcap:false*/
    context = new webkitAudioContext();
} else {
    window.alert("WebAudio isn't supported in this browser yet :-(");
    throw new Error('AudioContext not supported. :(');
}


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
	//o.s=s;
    o.o.frequency.value = o.f;
    o.g=context.createGain();
    o.gv=v;
    o.g.gain.value =o.gv;
    o.o.connect(o.g);
    return o;
}
function createRecipe(mods,tones)
{
	if(typeof(tones)=="undefined") tones=Math.floor(8*Math.random());
	if(typeof(mods)=="undefined") mods=Math.floor(8*Math.random());
	mods=parseInt(mods);
	tones=parseInt(tones);
	console.log("createRecipe request mods: "+mods+" tones: "+tones);
	var total_osc=mods+tones;
	while(total_osc>8)
	{ 
		console.log("have to reduce some "+total_osc+">8");
		if(tones>1) tones--;
		else mods--;
		total_osc=mods+tones;
	}
	console.log("createRecipe will create mods: "+mods+" tones: "+tones+" total of "+total_osc);

	var recipe={};
	recipe.o=[];
	recipe.l=0.1+Math.round(Math.random()*20)/10;
	recipe.e=[{t:0,v:1},{t:1,v:0}];// envelop fade
	recipe.v=1;
	var nr_of_osc=total_osc-mods;
	var nr_of_mod=mods;
	var i;
	for(i=0;i<nr_of_osc;i++)
	{
		var freq=100+1000*Math.random();
		recipe.o.push({
			t:Math.floor(Math.random()*4),
			f:freq,
			v:0.1+0.9*Math.random()/nr_of_osc,
			c:-1});// -1 is carrier
	}
	for(i=0;i<nr_of_mod;i++)
	{
		var r=Math.floor(Math.random()*total_osc);
		if(r==recipe.o.length)r=0; // never connect to self
		var freq=0.1+i*i*Math.random();
		recipe.o.push(
			{t:Math.floor(Math.random()*4),
			 f:freq,
			 v:-1000+2000*Math.random(),
			 c:r
			 });// modulator, modulate anything
	}
	// test if all mods connect to a oscillator, else, they need to reconnect.
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		if(o.c!=-1)
		{
			// follow it
			var has_output=false;
			var next=o.c;
			for(j=0;j<8 && has_output==false;j++)
			{
				var d=recipe.o[next];
				if(d.c==-1) has_output=true;
				else next=d.c;				
			}
			if(has_output==false)
			{
				// connect to random -1 connector.
				o.c=0;
				for(var j=0;j<recipe.o.length;j++)
				{
					if(recipe.o[j].c==-1 && Math.random()<0.5) o.c=j;
				}
			}
		}
	}
	
	
	
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

function createCarrier(f,t,v)
{
    var o={};
	o.c=-1;
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

function playBeepoTron(r,v,ps)
{
	var mod=[];
	var i;
	var mod=[];
	for(i=0;i<r.o.length;i++)
	{
		var d=r.o[i];
		if(d.c<0)
		{
			mod[i] =createCarrier(d.f,d.t,d.v);
		}else
		{
			mod[i] = createModulator(d.f,d.t,d.v);
		}
	}
	
    var l=r.l;
    var env = context.createGain();
    env.connect(out); //context.destination
    var now = context.currentTime;
    env.gain.cancelScheduledValues(now);
    env.gain.setValueAtTime(1, now);
    env.gain.linearRampToValueAtTime(0 , now + l);

	// create connections
	for(i=r.o.length-1;i>=0;i--)
	{
		var d=r.o[i];
		if(d.c<0)
		{
			mod[i].g.connect(env);	
		}else
		{
			var index=d.c;
			mod[i].g.connect(mod[index].o.frequency);				
		}
	}

	for(i=0;i<mod.length;i++)
	{
		if(mod[i].c==-1)
		{
			mod[i].o.start(now);
			mod[i].o.stop(now+l);
		}else
		{
//			console.log("phase shift:"+mod[i].s);
			mod[i].o.start(now); // +mod[i].s // phase shift them, might help.
			mod[i].o.stop(now+l);
		}
	}
    
};



