
function createRecipe(mods,tones,musical)
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
	if(musical) recipe.l=1+Math.round(Math.random()*30)/10;
	recipe.e=[{t:0,v:1},{t:1,v:0}];// envelop fade
	if(Math.random()<0.5)
	{
		var envelope=[];
		envelope.push({t:0,v:Math.floor(Math.random()*10)/10});
		envelope.push({t:1,v:Math.floor(Math.random()*10)/10});
		var a=2*Math.random();
		for(i=0;i<a;i++)
		{
			var v=Math.random() ;
			envelope.push({t:Math.floor( Math.random()*10) /10 ,v:Math.floor(v*10) /10 } );
		}
		envelope.sort(sortOnTime);
		recipe.e=envelope;

	}
	var nr_of_osc=total_osc-mods;
	var nr_of_mod=mods;
	var i;
	var center_note=0; //-10+Math.floor(Math.random()*88);
	console.log("center-note="+center_note);
	
	var scales=[];
	scales.push([0,4,7,12,16,19,-12,-24]);// major
	scales.push([0,4,7,11,16,19,-12,-24]);// major 7
	scales.push([0,4,8,12,16,20,-12,-24]);// augmented
	scales.push([0,4,6,12,16,18,-12,-24]);// diminished
	scales.push([0,4,6,10,16,18,-12,-24]);// major chord minor 7
	scales.push([0,3,6,10,15,18,-12,-24]);// minor chord minor 7
	scales.push([0,3,7,12,15,19,-12,-24]);// minor
	scales.push([0,2,7,12,14,19,-12,-24]);// sus 2
	scales.push([0,5,7,12,17,19,-12,-24]);// sus 4
	
	var r=Math.floor(Math.random()*scales.length)
	var harmonies=scales[r];
	for(i=0;i<nr_of_osc;i++)
	{
		var freq=100+1000*Math.random();
		if(musical)
		{
			freq=440+(center_note+harmonies[i])*Math.pow(2,1/12);
			if(Math.random()<0.5) freq=440+(center_note)*Math.pow(2,1/12);
		}
		recipe.o.push({
			t:Math.floor(Math.random()*4),
			f:freq,
			v:0.1+0.9*Math.random()/nr_of_osc,
			c:-1});// -1 is carrier
	}
	for(i=0;i<nr_of_mod;i++)
	{
		var rc=Math.floor(Math.random()*total_osc);
		if(rc>=recipe.o.length)rc=i-1; // never connect to self

		if(Math.random()<0.6) // mostly
		{
			// frequency modulator
			var freq=0.1+i*i*Math.random();
			var v=-1000+2000*Math.random();
			if(rc=0 && Math.random()<0.5)freq=recipe.o.f*(Math.floor(Math.random()*12)/12); // harmonise
			if(musical)
			{
				freq=440+(center_note+harmonies[i])*Math.pow(2,1/12);
				if(Math.random()<0.5) 
				{
					freq=32*Math.random();// small frequency also good
					v=(-0.5+Math.random())*64;
				}
			}
			recipe.o.push(
				{t:Math.floor(Math.random()*4),
				 f:freq,
				 v:v,
				 c:rc
				 });// modulator, modulate anything
			if(musical || Math.random()<0.1)
			{
				// give the modulator an envelop (adsr, normally!)
				var envelope=[];
				envelope.push({t:0,v:Math.floor(Math.random()*10)/10});
				envelope.push({t:1,v:Math.floor(Math.random()*10)/10});
				var a=6*Math.random();
				for(i=0;i<a;i++)
				{
					envelope.push({t:Math.floor( Math.random()*10) /10 ,v:  Math.floor(  Math.random()*10)/10 }   );
				}
				envelope.sort(sortOnTime);
				console.log(envelope+" put in osc i");
				recipe.o[recipe.o.length-1].e=envelope;
			}
		}else
		{
			// volume modulator
			var freq=0.1+3*i*i*Math.random(); // can be more for ring modulations.
			if(musical)
			{
				freq=440+(center_note+harmonies[i])*Math.pow(2,1/12);
				if(1) freq=440+(center_note)*Math.pow(2,1/12);
			}
			recipe.o.push(
				{t:Math.floor(Math.random()*4),
				 f:freq,
				 m:"v",
				 v:-1+2*Math.random(), //  modulation should be done a bit more carefull
				 c:rc
				 });// modulator, modulate anything
			
		}
	}
	// test if all mods connect to a oscillator, else, they need to reconnect.
	console.log("connection setup sofar: "+JSON.stringify(recipe));
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
				if(next==-1)
				{
					has_ouput=true; // do not take another step!
				}else
				{
					var d=recipe.o[next];
					console.log(i+","+j+"=>"+d+" "+next);
					if(d.c==-1) has_output=true; // do not take another step!
					else next=d.c;				
				}
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
		if(Math.abs(o.f)>1)
			o.f=Math.round(o.f*10)/10;
		else
			o.f=Math.round(o.f*1000)/1000;
		o.t=Math.round(o.t);
		if(Math.abs(o.v)>1)
			o.v=Math.round(o.v*10)/10;
		else
			o.v=Math.round(o.v*1000)/1000;

	}
	return recipe;
}
function sortOnTime(a,b)
{
	if(a.t<b.t) return -1;
	if(a.t>b.t) return 1;
	return  0;
}


function basicRecipeFormatting(str)
{
	str=str.replace(":[", ":[\n");
	str=str.replace('"f":', '"f":');
	for(var i=0;i<recipe.o.length;i++)
		str=str.replace('},{"t"', '},\n{"t"');
	str=str.replace('},{"t"', '},\n{"t"');
	str=str.replace("],", "\n],\n");
	str=str.replace('"l"', '\n"l"');
	str=str.replace('"e"', '\n"e"');
	return str;
}
function changeRecipeLength(l)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	recipe.l=l;
	showRecipe(JSON.stringify(recipe));
}
function changeRecipeEnvelope()
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
		var envelope=[];
		envelope.push({t:0,v:Math.floor(Math.random()*10)/10});
		envelope.push({t:1,v:Math.floor(Math.random()*10)/10});
		var a=2*Math.random();
		for(i=0;i<a;i++)
		{
			envelope.push({t:Math.floor( Math.random()*10) /10 ,v:  Math.floor(  Math.random()*10)/10 }   );
		}
		envelope.sort(sortOnTime);
		recipe.e=envelope;
	showRecipe(JSON.stringify(recipe));
	playSound();
}


function varyRecipeTone()
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	recipe.e=[{t:0,v:1},{t:1,v:0}];// envelop fade
	recipe.v=1;
	var i;
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		o.t=Math.floor(Math.random()*4);
	}
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
	playSound();
}
function varyRecipeOne()
{
	varyRecipe(1);
}
function varyRecipeTwo()
{
	varyRecipe(2);
}
function varyRecipeAll()
{
	varyRecipe(8);
}

function createNewMix(r1,r2,blend)
{
	var f1=blend;
	var f2=1-blend;

	
	recipe.l=r1.l*f1+f2*r2.l;
	recipe.v=r1.v*f1+f2*r2.v;
	recipe.e=r1.e; // other option ghosted under this one.
//	recipe.e=r1.e.concat(r2.e); // concatenate envelop, we might want to undouble those times..
//	undoubleEnvelop(recipe.e);

	var max_o=r1.o.length;
	if(max_o<r2.o.length) max_o=r2.o.length;
	recipe.o=[];
	for(i=0;i<max_o;i++)
	{
		var o1,o2;
		if(i<r1.o.length) 
			o1=r1.o[i];
		else
		{
			o1=JSON.parse(JSON.stringify(r2.o[i]));
			o1.v=0;
		}
		if(i<r2.o.length) 
			o2=r2.o[i];
		else
		{
			o2=JSON.parse(JSON.stringify(r1.o[i]));
			o2.v=0;
		}
		// now we have two valid operators, we can mix.
		var o={};
		o.f=o1.f*f1+f2*o2.f;
		o.v=o1.v*f1+f2*o2.v;

		if(Math.random()<blend) o.t=o1.t;
		else o.t=o2.t;
		if(Math.random()<blend) o.c=o1.c;
		else o.c=o2.c;

		// if either has an envelope, it's going to be in there
		if(typeof(o1.e)) o.e=o1.e;
		if(typeof(o2.e)) o.e=o2.e;
		recipe.o.push(o);
	}
	setControl("length",recipe.l);
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
	playSound();
	
}

function varyRecipe(nr_of_changes)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	recipe.l+=0.1+Math.round(Math.random()*0.2);
	recipe.e=[{t:0,v:1},{t:1,v:0}];// envelop fade
	recipe.v=1;
	var i;
	var nr_of_osc=0;
	var random_order=[];
	for(i=0;i<recipe.o.length;i++) random_order.push(i);
	random_order.sort(hussle);
	for(i=0;i<recipe.o.length;i++)
		if(recipe.o[i].c==-1) nr_of_osc++;
	for(var q=0;q<random_order.length && q<nr_of_changes;q++)
	{
		i=random_order[q];
		var o=recipe.o[i];
		o.f*=0.9+0.2*Math.random();
		if(o.c==-1)
		{
			o.v=(Math.random()*0.9+0.1)/nr_of_osc;
		}else
		{
			o.v*=0.9+0.2*Math.random();
		}
		// make values neater
		if(Math.abs(o.f)>1)
			o.f=Math.round(o.f*10)/10;
		else
			o.f=Math.round(o.f*1000)/1000;
		o.t=Math.round(o.t);
		if(Math.abs(o.v)>1)
			o.v=Math.round(o.v*10)/10;
		else
			o.v=Math.round(o.v*1000)/1000;
	}
	setControl("length",recipe.l);
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
	playSound();
}
function hussle(a,b)
{
	if(Math.random()<0.5)
	{
		return -1;
	}else return 1;
}
function varyCrunchUp()
{
	varyCrunchFactor(1.5);
}
function varyCrunchDown()
{
	varyCrunchFactor(0.75);
}
function varyCrunchFactor(f)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		if(o.c!=-1) o.v*=f;
		else o.v*=1/f;
	}
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
	playSound();
}

function varyPitchUp()
{
	varyFrequencyFactor(Math.pow(2,1/12));
}
function varyPitchDown()
{
	varyFrequencyFactor(1/Math.pow(2,1/12));
}
function varyOctaveUp()
{
	varyFrequencyFactor(2);
}
function varyOctaveDown()
{
	varyFrequencyFactor(0.5);
}
function varyFrequencyFactor(f)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		o.f*=f;
		if(Math.abs(o.f)>1)
			o.f=Math.round(o.f*10)/10;
		else
			o.f=Math.round(o.f*1000)/1000;
	}
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
	playSound();
}

function undistort(f)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		if(o.c==-1)
		{
			o.v=o.v*0.3;
		}
		if(Math.abs(o.v)>1)
			o.v=Math.round(o.v*10)/10;
	}
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
		playSound();
}
function distort(f)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		if(o.c==-1)
		{
			o.v=o.v*3.3;
		}
		if(o.v==0) o.v=0.000001;
		if(Math.abs(o.v)>1)
			o.v=Math.round(o.v*10)/10;
	}
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
		playSound();
}


function normalise(f)
{
	addToUndoBuffer(recipe);
	recipe=JSON.parse(document.getElementById("recipe").value);
	for(i=0;i<recipe.o.length;i++)
	{
		var o=recipe.o[i];
		o.f=o.f*0.999+0.001*440;
		o.v=o.v*0.9+0.1;
		if(Math.abs(o.f)>1)
			o.f=Math.round(o.f*10)/10;
		else
			o.f=Math.round(o.f*1000)/1000;
		if(Math.abs(o.v)>1)
			o.v=Math.round(o.v*10)/10;
		else
			o.v=Math.round(o.v*1000)/1000;
	}
	showRecipe(JSON.stringify(recipe));
	var loop=document.getElementById("loop").checked;
	if(!loop)
		playSound();
}
