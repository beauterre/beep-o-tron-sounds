// set a default for the saved data.
var default_file={
 v:1.0,
 current_cat:0,
 cat:[{lab:"jumps",snds:[]},{lab:"hits",snds:[]},{lab:"spawns",snds:[]},{lab:"bonuses",snds:[]},{lab:"enemy",snds:[]},{lab:"bad",snds:[]}]
}
// put some defaults in.
	default_file.cat[0].snds.push({name:"jump",r:'{"o":[{"t":2,"f":376.9,"v":0.9,"c":-1},{"t":1,"f":0.1,"v":287,"c":6},{"t":2,"f":0.8,"v":14,"c":2},{"t":3,"f":1.1,"v":376.6,"c":5},{"t":3,"f":6.1,"v":316.1,"c":0},{"t":1,"f":6.2,"v":731.1,"c":3},{"t":1,"f":5.3,"v":274,"c":2},{"t":1,"f":34.4,"v":882,"c":6}],"l":0.30000000000000004,"e":[{"t":0,"v":1},{"t":1,"v":0}],"v":1}'});
	default_file.cat[1].snds.push({name:"boom",r:'{"o":[{"t":0,"f":128.7,"v":1,"c":-1},{"t":2,"f":1,"v":670.7,"c":0,"m":"f"},{"t":3,"f":1.7,"v":985.7,"c":1,"m":"f"},{"t":2,"f":1.2,"v":422.5,"c":2,"m":"f"},{"t":2,"f":1.7,"v":48.4,"c":3,"m":"f"},{"t":2,"f":5.5,"v":284.1,"c":4,"m":"f"}],"v":1,"l":1.1,"e":[{"t":0,"v":1},{"t":1,"v":0}]}'});
	default_file.cat[2].snds.push({name:"blirp",r:'{"o":[{"t":2,"f":1052.5,"v":1,"c":-1},{"t":3,"f":0.4,"v":758.7,"c":0,"m":"f"},{"t":2,"f":1.6,"v":121.7,"c":1,"m":"f"},{"t":3,"f":0.5,"v":70.1,"c":2,"m":"f"},{"t":1,"f":0.4,"v":995.6,"c":3,"m":"f"},{"t":0,"f":1.2,"v":280.7,"c":4,"m":"f"}],"v":1,"l":0.2,"e":[{"t":0,"v":1},{"t":1,"v":0}]}'});
	default_file.cat[3].snds.push({name:"pickup",r:'{"o":[{"t":0,"f":644.4,"v":1,"c":-1},{"t":3,"f":0.4,"v":699.9,"c":0,"m":"f"},{"t":2,"f":1.4,"v":406.1,"c":1,"m":"f"},{"t":1,"f":1.9,"v":70.9,"c":2,"m":"f"},{"t":3,"f":2.5,"v":202.7,"c":3,"m":"f"},{"t":0,"f":2.9,"v":813.8,"c":4,"m":"f"}],"v":1,"l":0.4,"e":[{"t":0,"v":1},{"t":1,"v":0}]}'});
	default_file.cat[4].snds.push({name:"alien",r:'{"o":[{"t":0,"f":668.5,"v":1,"c":-1},{"t":0,"f":0.6,"v":461.6,"c":0,"m":"f"},{"t":3,"f":1.5,"v":915.3,"c":1,"m":"f"},{"t":1,"f":2.9,"v":966.6,"c":2,"m":"f"},{"t":0,"f":1.7,"v":8.5,"c":3,"m":"f"},{"t":2,"f":9.8,"v":0,"c":4,"m":"f"}],"v":1,"l":1.6,"e":[{"t":0,"v":1},{"t":1,"v":0}]}'});

var saved=JSON.parse(JSON.stringify(default_file));// clone into saved!
	
// get the cookie if it's there!
if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
	var stored_stuff=localStorage.beepotron;
	if(typeof(stored_stuff)=="undefined")
	{
		console.log("no previous cookie, initialising for ya");
		localStorage.setItem("beepotron", JSON.stringify(saved));
	}else
	{
		saved=JSON.parse(stored_stuff);
		console.log("saved file of version "+saved.v);
		if(typeof(saved.v)==="undefined")
		{
			// you are getting the defaults.
			console.log("previous cookie not usefull, initialising for ya");
			localStorage.setItem("beepotron", JSON.stringify(default_file));
			saved=JSON.parse(JSON.stringify(default_file));// clone into saved!
		}else
		{
			console.log("your recipes loaded from cookie!");
		}
	}
} else {
    // Sorry! No Web Storage support..
	console.log("no web storage support, so just added some defaults");
}
// bestandsbeheer

function loadRecipe(w,cat)
{
	var saved_array=saved.cat[cat].snds;
	var str=saved_array[w].r;
	var ta=document.getElementById("recipe");
	str=basicRecipeFormatting(str);
	ta.value = str;
	// MAAR DOE WEL EVEN DE LOOP UIT!
	document.getElementById("loop").checked=false;
	playSound();
	
	// set Details of this recipe!
	setFileDetails(w,cat);
}


function setFileDetails(nr,cat)
{
	var saved_array=saved.cat[cat].snds;
	var div=document.getElementById("details");
	var str="geluid "+(nr+1)+"/"+saved.cat[cat].snds.length+" van categorie "+saved.cat[cat].lab+", grootte "+saved_array[nr].r.length+" bytes";
	str+="<hr>Naam: <input type='text' id='renamesoundinput' value='"+saved_array[nr].name+"'></input><button onClick='javascript:renameSound("+nr+","+cat+")'>Hernoem</button>";
	div.innerHTML=str;
}
function mixRecipe(nr,cat)
{
	alert("sorry, dit werkt nog niet.");
}

function renameSound(nr,cat)
{
	var new_name=document.getElementById("renamesoundinput").value;
	console.log("renameSound(nr,cat,"+new_name+")");
	saved.cat[cat].snds[nr].name=new_name;
	showSaved();
	setFileDetails(nr,cat);	
}
function removeRecipe(nr,cat)
{
	var saved_array=saved.cat[cat].snds;
	saved_array.splice(nr,1);
	showSaved();
}
function moveRecipe(nr,cat,d)
{
	var saved_array=saved.cat[cat].snds;
	if(nr==0 && d==1)
	{
		return;
	}
	if(nr==(saved.length-1) && d==-1)
	{
		return;
	}
	var temp=saved_array[nr];
	saved_array.splice(nr,1);
	saved_array.splice(nr-d, 0, temp); 
	showSaved();
}

function saveRecipe()
{
	var error=false;
    try{
        recipe=JSON.parse(document.getElementById("recipe").value);
    }catch(e){
		// show that it's wrong..
		error=true;
		window.prompt("Current JSON contains errors and cannot be saved.");
		return;
    }


	var saved_array=saved.cat[saved.current_cat].snds;
	var name=saved.cat[saved.current_cat].lab+" "+(saved_array.length+1);
	name=window.prompt("New sound name?",name);
	if(name!=null)
	{
		saved_array.push({name:name,r:JSON.stringify(recipe)});
		showSaved();
	}
}
function internallySetCategory(x)
{
	if(x<0) x=0;
	if(x>=saved.cat.length) x=saved.cat.length-1;
	saved.current_cat=parseInt(x);
	showSaved();
}
function setCategory()
{
	// user changed categories.
	var x = document.getElementById("categories").value;
	internallySetCategory(x);
}
function showSaved()
{
	// if we need to show it, we also need to copy it to local storage!
	localStorage.setItem("beepotron", JSON.stringify(saved));
	var saved_array=[];
	if(parseInt(saved.current_cat)==-1)
	{
		var i;
		for(i=0;i<saved.cat.length;i++)
		{
			var j=0;
			var arr=saved.cat[i].snds;
			for(j=0;j<arr.length;j++)
			{	
				var o=JSON.parse(JSON.stringify(arr[j]));
				o.cat=i;
				o.nr=j;
				o.name="["+saved.cat[i].lab.substr(0,3)+"] "+o.name;
				saved_array.push(o);
			}
		}
		// we moeten even iets anders doen!
	}else
	{
		console.log("saved.current_cat="+saved.current_cat);
		saved_array=saved.cat[saved.current_cat].snds;
	}
	var str="<table><tr><td>Geluiden</td><td>Acties</td><td>";
	str+="</td></tr>";
	var cat=saved.current_cat;
	for(i=0;i<saved_array.length;i++)
	{
		var nr=i;
		if(saved.current_cat==-1)
		{
			cat=saved_array[i].cat;
			nr=saved_array[i].nr;
		}
		str+="<tr><td><a href='javascript:loadRecipe("+nr+","+cat+");'>"+(i+1)+" &#9658; "+saved_array[i].name+"</a></td>";
		str+="<td>";
	//		str+="<a href='javascript:exportRecipe("+i+");'>Export to Wav</a>";
		str+=" <a href='javascript:mixRecipe("+nr+","+cat+");'>Mix</a></td>";
		str+="<td><a href='javascript:moveRecipe("+nr+","+cat+",1);'>&#x25B2;</a>";
		str+="<a href='javascript:moveRecipe("+nr+","+cat+",-1);'>&#x25BC;</a>";
		str+="<a href='javascript:removeRecipe("+nr+","+cat+");'>X</a></td></tr>";
	}
	str+="</table>"
	document.getElementById("saved").innerHTML=str;
	
	// show categorieen.

	var str="";
		str+="<select id='categories' onChange='setCategory()'>";
	var i;
	for(i=0;i<saved.cat.length;i++)
	{
		var extra="";
		if(i==saved.current_cat)
		{
			extra="selected";
		}		
		str+="<option "+extra+" value='"+i+"'>"+saved.cat[i].lab+"</option>";
	}
	extra="";
	if(saved.current_cat==-1) extra="selected";
	str+="<option "+extra+" value='-1'>Alles</option>";
	str+="</select><button onClick='createCategory();'>+</button><button onClick='deleteCategory();'>-</button><button onClick='renameCategory();'>hernoem</button>";
	var cat_div=document.getElementById("cat-container").innerHTML=str;
}
function createCategory()
{
	var name=prompt("Geef een naam op voor de nieuwe categorie");
	if(name!=null)
	{
		var i=0;
		var bestaat_al=false;
		for(i=0;i<saved.cat.length;i++)
		{
			if(saved.cat[i].lab==name)
			{
				saved.current_cat=i;
				bestaat_al=true;
			}
		}
		if(bestaat_al==false)
		{
			saved.current_cat=saved.cat.length;
			saved.cat.push({lab:name,snds:[]});
			
		}else
		{
			window.alert("deze categorie bestaat al.");
		}
	}
	showSaved();
}
function deleteCategory()
{
	if(saved.current_cat==-1)
	{
		if(confirm("Weet je heel zeker, dat ALLE geluiden wilt verwijderen?"))
		{
			saved.cat=[];
		}
	}else{
		if(saved.cat[saved.current_cat].snds.length==0)
		{
			saved.cat.splice(saved.current_cat,1);
			saved.current_cat--;
		}
		else if(confirm("Weet je zeker, dat je alle ("+saved.cat[saved.current_cat].snds.length+") geluiden uit de categorie: '"+saved.cat[saved.current_cat].lab+"' wilt verwijderen?"))
		{
			saved.cat.splice(saved.current_cat,1);
			saved.current_cat--;
		}
	}
	showSaved();
}
function renameCategory()
{
	if(saved.current_cat==-1) return;
	var name=prompt("Geef een nieuwe naam op voor categorie: '"+saved.cat[saved.current_cat].lab+"'");
	if(name!=null)
	{
		saved.cat[saved.current_cat].lab=name;
		showSaved();
	}

}
