
var controls=[];
var recipe=createRecipe(); //create a basic recipe to begin with.


var interfaceAudioContext; // the default context you are going to hear!
if (typeof AudioContext !== "undefined") {
    interfaceAudioContext = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    /*jshint newcap:false*/
    interfaceAudioContext = new webkitAudioContext();
} else {
    window.alert("WebAudio isn't supported in this browser yet :-(");
	// supported browsers include Chrome, Firefox, Edge, Safari, Opera
    throw new Error('AudioContext not supported. :(');
}


function createRange(label,text,min,max,val,step)
{
	var div=document.createElement("div");
	div.className ="range-container";
	var lab=document.createElement("span");
	lab.innerHTML=text;
	lab.className ="range-label";
	var v=document.createElement("span");
	v.innerHTML=val;
	v.className ="range-value";
	var r = document.createElement("INPUT");
	r.className="range-input";
	
	r.setAttribute("type", "range");
	r.setAttribute("min", min);
	r.setAttribute("max", max);
	r.setAttribute("value", val);
	r.setAttribute("step", step);
	r.setAttribute("id", "range"+controls.length);
	r.setAttribute("oninput", "rangeVal(this.id,this.value)");
	r.setAttribute("onchange", "rangeVal(this.id,this.value)");
	div.appendChild(lab);
	div.appendChild(r);
	div.appendChild(v);
	div.style.top=controls.length*25+"px";
	document.getElementById("controls").appendChild(div);
	controls.push({val:val,l:label,r:r,v:v,d:div});
}
function rangeVal(id,val)
{
	var nr=parseInt(id.substr(5,100));
	changeControl(nr,val);
}
function setControl(lab,val)
{
	console.log("setControl "+lab+" to "+val);
	var i;
	for(i=0;i<controls.length;i++)
	{	
		if(controls[i].l==lab)
		{
			controls[i].v.innerHTML=val;
			controls[i].r.value=val;
		}
	}
}
function changeControl(nr,val)
{	
	controls[nr].v.innerHTML=val;
	switch(controls[nr].l)
	{
		case "length":
			changeRecipeLength(parseFloat(val));
		break;
		default:
		 console.log("don't know how to handle range: "+controls[nr].l);
	}
	controls[nr].val=val;
}


window.onload=function(){
	document.getElementById("start").addEventListener("click", pressPlay);
	
	
	var e = document.getElementById("createKind");
	var i;
	for(i=0;i<saved.cat.length;i++)
		e.options[e.options.length] = new Option(saved.cat[i].lab, "mix_"+i);
	
	document.getElementById("distort").addEventListener("click", distort);
	document.getElementById("undistort").addEventListener("click", undistort);
	document.getElementById("normalise").addEventListener("click", normalise);
	document.getElementById("crunch_up").addEventListener("click", varyCrunchUp);
	document.getElementById("crunch_down").addEventListener("click", varyCrunchDown);
	document.getElementById("pitch_up").addEventListener("click", varyPitchUp);
	document.getElementById("pitch_down").addEventListener("click", varyPitchDown);
	document.getElementById("export").addEventListener("click", exportTemplates);
	
	document.getElementById("octave_up").addEventListener("click", varyOctaveUp);
	document.getElementById("octave_down").addEventListener("click", varyOctaveDown);
//	document.getElementById("createGame1").addEventListener("click", createNewGameSimpel);
//	document.getElementById("createGame2").addEventListener("click", createNewGameMedium);
//	document.getElementById("createGame3").addEventListener("click", createNewGameComplex);
//	document.getElementById("createMusical").addEventListener("click", createNewMusical);
//	document.getElementById("createRandom").addEventListener("click", createNewRandom);
	document.getElementById("createSelected").addEventListener("click", createNewSelected);
	document.getElementById("create").addEventListener("click", createNew);
	document.getElementById("vary_one").addEventListener("click", varyRecipeOne);
	document.getElementById("vary_two").addEventListener("click", varyRecipeTwo);
	document.getElementById("vary_all").addEventListener("click", varyRecipeAll);
	document.getElementById("varytone").addEventListener("click", varyRecipeTone);
	document.getElementById("varyenvelope").addEventListener("click", changeRecipeEnvelope);
	document.getElementById("loop").addEventListener("click", changeLoop);
	document.getElementById("save").addEventListener("click", saveRecipe);
	if(canWeExport()==false)
	{
		document.getElementById("download").style.display="none";
	}else{		
		console.log("we can export!");
	}
	document.getElementById("download").addEventListener("click", exportAsWav);
	// create ranges
	createRange("length","Lengte huidige geluid",0.1,5,recipe.l,0.05);
	createRange("complexity","Complexiteit nieuw geluid",0,7,4,1);
	createRange("harmony","Aantal tonen nieuw geluid",1,8,1,1);
	createNew(false);
	showSaved();
	setTimeout(playSound,100);
};
function createNewSelected()
{
	// get the value of what is selected.
	var e = document.getElementById("createKind");
	var strUser = e.options[e.selectedIndex].value;	console.log("create New "+createKind);
	if(strUser.indexOf("mix")!=-1)
	{
		// mix een nieuw geluid uit twee willekeurige geluiden van een category
		var parts=strUser.split("_");
		var cat1=Math.floor(Math.random()*saved.cat.length);
		var cat2=Math.floor(Math.random()*saved.cat.length);
		if(parts.length==2)
		{
			cat1=parseInt(parts[1]);
			cat2=parseInt(parts[1]);
		}
		var s1=Math.floor(saved.cat[cat1].snds.length*Math.random());
		var s2=Math.floor(saved.cat[cat2].snds.length*Math.random());
		var r1=saved.cat[cat1].snds[s1].r;
		var r2=saved.cat[cat2].snds[s2].r;
		console.log("create mix between: "+r1+" x "+r2);
		createNewMix(JSON.parse(r1),JSON.parse(r2),0.5);
		internallySetCategory(cat1);
		// zet de category op...
	}else
	{
		switch(strUser)
		{
			case "random": createNewRandom();
			break;
			case "musical": createNewMusical();
			break;
			case "game1": createNewGameSimpel();
			break;
			case "game2": createNewGameMedium();
			break;
			case "game3": createNewGameComplex();
			break;
			default:
			 console.log("Don't know how to create "+strUser);
		}		
	}
}
function createNewMusical()
{
	// we also set the controls for harmony and modulation
	var c=Math.floor(Math.random()*8);
	var d=1+Math.floor(Math.random()*7);
	var recipe=createRecipe(controls[1].val,controls[2].val,true);
	setControl("length",recipe.l); // reflect the change
	addToUndoBuffer(recipe);
	showRecipe(JSON.stringify(recipe));
	playSound();
}
function createNewGameSimpel()
{
	var c=2;
	var d=1;
	changeControl(1,c);
	changeControl(2,d);
	setControl("complexity",c);
	setControl("harmony",d);
	createNew(true);
}
function createNewGameMedium()
{
	var c=4;
	var d=1;
	changeControl(1,c);
	changeControl(2,d);
	setControl("complexity",c);
	setControl("harmony",d);
	createNew(true);
}
function createNewGameComplex()
{
	var c=7;
	var d=1;
	changeControl(1,c);
	changeControl(2,d);
	setControl("complexity",c);
	setControl("harmony",d);
	createNew(true);
}

function createNewRandom()
{
	// we also set the controls for harmony and modulation
	var c=Math.floor(Math.random()*8);
	var d=1+Math.floor(Math.random()*7);
	changeControl(1,c);
	changeControl(2,d);
	setControl("complexity",c);
	setControl("harmony",d);
	createNew(true);
}
function createNew(play)
{
	console.log("createNew "+controls[1].val+","+controls[2].val)
	var recipe=createRecipe(controls[1].val,controls[2].val,false);
	// set the value of length range.
	setControl("length",recipe.l);
	
	addToUndoBuffer(recipe);
	showRecipe(JSON.stringify(recipe));
	if(play)playSound();
}
function showRecipe(str)
{
	var ta=document.getElementById("recipe");
	str=basicRecipeFormatting(str);
	ta.value = str;
	drawOscillators(JSON.parse(str));
}
function changeLoop()
{
	var loop=document.getElementById("loop").checked;
	var play=document.getElementById("start");
	play.innerHTML="&#9658;";
}
function pressPlay()
{
	var loop=document.getElementById("loop").checked;
	var play=document.getElementById("start");
	console.log("play.innerHTML"+play.innerHTML);
	var looping=(play.innerHTML.length>1); // it's a pause thing, else it's a play thing, which is 1 character!
	if(looping)
	{
		console.log("we were looping");
		play.innerHTML="&#9658;";
		document.getElementById("loop").checked = false;
	}else
	{
		if(loop) // loop flag on, we'll be going into a loop
		{
			play.innerHTML="&#10074; &#10074;";
			// it's allready playing, guess you want to stop?
			playSound();
		}else
		{
			play.innerHTML="&#9658;";
			playSound();
		}

	}
}
function playSound()
{
	var r=recipe;
	var error=false;
    try{
        r=JSON.parse(document.getElementById("recipe").value);
    }catch(e){
		// show that it's wrong..
		error=true;
		r=undo[undo.length-1];// don't change it, until it is no longer broken.
    }
	if(error) document.getElementById("recipe").style.color="#f00";
	else document.getElementById("recipe").style.color="#000";
	console.log("play a beep in "+interfaceAudioContext);
	playSfx(r,1,0,0,interfaceAudioContext); // recipe, volume, pitch, pan
	var loop=document.getElementById("loop").checked;
	if(loop)
	{
		setTimeout(playSound,r.l*1000+300); // it doesn't slow down is l is made longer?
	}
}


function exportAsWav()
{
	var r=recipe;
	var error=false;
    try{
        r=JSON.parse(document.getElementById("recipe").value);
    }catch(e){
		// show that it's wrong..
		error=true;
		r=undo[undo.length-1];// don't change it, until it is no longer broken.
    }
	if(error) document.getElementById("recipe").style.color="#f00";
	else document.getElementById("recipe").style.color="#000";
	
	if(error==false)
	{
		var length=recipe.l;
//		playSfx(r,1,0,0); // recipe, volume, pitch, pan
		var exportContext=getExportContext(length); // we need an initial length for the buffer
		console.log("created a exportContext!"+exportContext);
		playSfx(r,1,0,0,exportContext); // recipe, volume, pitch, pan , context if not default!
		startExportOfContext(exportContext);

	}
}

