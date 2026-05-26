var context;


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

function playSfx(r,v,pt,pn,e) // recipe, volume, pitch, pan, effect
{
   var mod=[];
   var i;
   var mod=[];
   var l=r.l;
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
	
    var env = context.createGain(); // overal gain envelope!
    env.connect(out); //context.destination
    var now = context.currentTime;
    env.gain.cancelScheduledValues(now);
	for(i=0;i<r.e.length;i++)
	{
		if(i==0)
			env.gain.setValueAtTime(r.e[i].v*v*d.v, now);
		else
			env.gain.linearRampToValueAtTime(r.e[i].v*v*d.v, now + l*r.e[i].t);
	}

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
			//  modulator.gain.connect(carrier.osc.frequency);
			if(d.m=="v")
				mod[i].g.connect(mod[index].g); // is you want to change the volume, you connect to the gain!				
			else
				mod[i].g.connect(mod[index].o.frequency);				
		}
	}
	for(i=0;i<mod.length;i++)
	{
		var d=r.o[i];
		console.log("starting mod: "+JSON.stringify(d));
		// create the envelope if there is one!
		if(typeof(d.e)!="undefined")
		{
			console.log("do the envelop of: "+JSON.stringify(d.e)+" to "+JSON.stringify(mod[i]));
			// put a envelope on the oscillator
			//mod[i].g.gain.cancelScheduledValues(now);
			// we need to do something different for frequency and volume modifiers!
			var e;
			var vf=1; //d.v;
			if(d.m=="v")
			{
				 vf=1;
			}
			for(e=0;e<d.e.length;e++)
			{
				if(e==0)
					mod[i].g.gain.setValueAtTime(d.e[e].v*vf, now);
				else
					mod[i].g.gain.linearRampToValueAtTime(d.e[e].v*d.v , now + l*d.e[e].t);
			}

		}

		if(mod[i].c==-1)
		{
			//osc[osc.start ? 'start': 'noteOn']
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



