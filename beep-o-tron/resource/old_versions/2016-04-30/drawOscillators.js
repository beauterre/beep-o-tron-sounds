
function drawOscillators(r)
{
	var c=document.getElementById("canv");
	if(typeof(c)=="undefined" || c==null)
	{	
		console.log("element canv not found.");
		return;
	}
	var ctx=c.getContext("2d");
	ctx.clearRect(0,0,c.width,c.height);
	var i;
	var osc=[];
	for(i=0;i<8;i++)
	{
		var o={};
		/*
		var p=i;
		if(i!=0) p=8-i;
		o.x=p%4;
		o.y=Math.floor(p/4);
		o.x=25+50*o.x;
		o.y=25+50*o.y;
		*/
		var rad=i/8*Math.PI*2;
		o.x=150+100*Math.sin(rad);
		o.y=100+50*Math.cos(rad);
		o.on=false;
		o.c=-1;
		if(i<r.o.length)
		{
			o.on=true;
			o.t=r.o[i].t;
			o.f=r.o[i].f;
			o.v=r.o[i].v;

			if(r.o[i].c!=-1)
				o.c=r.o[i].c;
		}	
		osc.push(o);
	}
	// first draw the connections.
	for(i=0;i<8;i++)
	{
		if(osc[i].c!=-1)
		{
			var dx=osc[i].x-osc[osc[i].c].x;
			var dy=osc[i].y-osc[osc[i].c].y;
			var len=Math.sqrt(dx*dx+dy*dy);
			if(len!=0)
			{
				dx=-dx/len;
				dy=-dy/len;
				var mx=osc[i].x+dx*20;
				var my=osc[i].y+dy*20;
				ctx.beginPath();
				ctx.moveTo(osc[i].x,osc[i].y);
				ctx.lineTo(osc[osc[i].c].x,osc[osc[i].c].y);
				ctx.strokeStyle="#000";
				ctx.lineWidth=5;
				ctx.stroke();
				// also draw a little arrow!
				ctx.fillStyle="#000";
				ctx.beginPath();
				ctx.moveTo(mx+dx*10,my+dy*10);
				ctx.lineTo(mx-dx*10+dy*10,my-dy*10-dx*10);
				ctx.lineTo(mx-dx*10-dy*10,my-dy*10+dx*10);
				ctx.fill();
				
				ctx.beginPath();
				ctx.moveTo(osc[i].x,osc[i].y);
				ctx.lineTo(osc[osc[i].c].x,osc[osc[i].c].y);
				ctx.lineWidth=3;
				ctx.strokeStyle="#fff";
				ctx.stroke();
				// also draw a little arrow!
				ctx.fillStyle="#fff";
				ctx.beginPath();
				ctx.moveTo(mx+dx*8,my+dy*8);
				ctx.lineTo(mx-dx*8+dy*8,my-dy*8-dx*8);
				ctx.lineTo(mx-dx*8-dy*8,my-dy*8+dx*8);
				ctx.fill();
			}else
			{
				console.log("oscillator "+i+" connected to self..");
			}
		}
	}
	ctx.strokeStyle="#000";
	for(i=0;i<8;i++)
	{
		ctx.lineWidth=1;
		var rad=5;
		ctx.fillStyle="#000";
		if(osc[i].on)
		{
			rad=15;	
			if(osc[i].c==-1 )
				ctx.fillStyle="#f00";
			else
				ctx.fillStyle="#f80";
		}
		ctx.beginPath();
		ctx.arc(osc[i].x,osc[i].y,rad,0,Math.PI*2);
		ctx.fill();
		ctx.stroke();
		// draw a little symbol in there to show the type of oscillator
		ctx.fillStyle="#fff";
		switch(osc[i].t)
		{
			case 0: // sine
				ctx.beginPath();
				ctx.arc(osc[i].x,osc[i].y,5,0,Math.PI*2);
				ctx.fill();
			break;
			case 1: // pulse
				ctx.fillRect(osc[i].x-5,osc[i].y-5,10,10);
			break;
			case 2: // triangle
				ctx.beginPath();
				ctx.moveTo(osc[i].x,osc[i].y-7);
				ctx.lineTo(osc[i].x-7,osc[i].y+5);
				ctx.lineTo(osc[i].x+7,osc[i].y+5);
				ctx.fill();
			break;
			case 3: // sawtooth
				ctx.beginPath();
				ctx.moveTo(osc[i].x-5,osc[i].y+5);
				ctx.lineTo(osc[i].x+5,osc[i].y+5);
				ctx.lineTo(osc[i].x+2.5,osc[i].y-5);
				ctx.lineTo(osc[i].x,osc[i].y+5);
				ctx.lineTo(osc[i].x-2.5,osc[i].y-5);
				ctx.fill();
			break;
		}
		
	}	
}
