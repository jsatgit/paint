var svgLink = "http://www.w3.org/2000/svg";
var penWidth = 5;
var points = [];
var penColour = "red";
var tval = 0.5;
var isInPage = 0;
var tb_up = 0;
var cpWidth = 256;
var tbWidth = cpWidth;
var spWidth = cpWidth;

function mousedown(evt) {
	isInPage = 1;
	pa_processPoints(evt);
}

// there is bug switching windows

function mouseenter(evt) {
	// mouseenter seems to bubble
	if (isInPage) {
		return;
	}

	isInPage = 1;

	if (evt.which == 1) {
		mousedown(evt);
	}
}

function mouseup(evt) {
	points = [];
}

function mouseleave(evt) {
	isInPage = 0;
	pa_processPoints(evt);
	points = [];
}

function mousemove(evt) {
	if (evt.which == 1 && isInPage) {
		pa_processPoints(evt);
	}
}

function pa_processPoints(evt) {
	var x = evt.clientX;
	var y = evt.clientY;
	var p = {x:x, y:y, cx:x, cy:y};

	if (points.length == 0) {
		pa_dot(p);
	}
	else if (points.length == 1) {
		pa_line(points[0], p);
	}
	else if (points.length == 2) {
		var cps = pa_control(points[0], points[1], p, tval);	
		pa_eraseLast();

		np1 = points[1];
		np1.cx = cps[0].x;
		np1.cy = cps[0].y;
		pa_curve(points[0], np1);

		np1.cx = cps[1].x;
		np1.cy = cps[1].y;
		pa_curve(np1, p);

		points.shift();
	}
	else {
		alert("Error, point count: " + points.length.toString());
	}

	points.push(p);
}

function pa_eraseAll(node) {
	while(node.hasChildNodes()) {
		node.removeChild(node.firstChild)
	}
}

function keydown(evt) {
	// key 'l'
	if (evt.which == 76) {
		var paintarea = document.getElementById("paintarea");
		pa_eraseAll(paintarea)
	}
	// key 'u'
	if (evt.which == 85) {
		var paintarea = document.getElementById("paintarea");
		pa_eraseLast(paintarea)
	}
	// key 'm'
	if (evt.which == 77) {
		if (tb_up) {
			tb_destroy();
			tb_up = 0;
		}
		else {
			var tb = document.getElementById("toolbox");
			if (tb) {
				tb.style.display = "block";
			}
			else {
				tb_create();
			}
			tb_up = 1;
		}
	}
}

function rgb(r, g, b) {
	return "rgb(" + r + "," + g + "," + b + ")";
}

function toPix(n) {
	return n.toString() + "px";
}

function chooseSize(evt) {
	var x = evt.clientX;
	penWidth = (spWidth/4)*(x/spWidth);
}

function tb_create() {
	var tb = document.createElement("div");
	tb.setAttribute("id", "toolbox");
	tb.style.width = toPix(tbWidth); 
	tb.style.height = toPix(cpWidth); 
	tb.style.marginTop = toPix(-cpWidth/2);
	tb.style.marginLeft = toPix(-tbWidth/2);
	document.body.appendChild(tb);
	
	var cp = document.createElementNS(svgLink, "svg");
	cp.setAttribute("id", "colourpicker");
	cp.style.width = toPix(cpWidth); 
	cp.style.height = toPix(cpWidth/2); 
	tb.appendChild(cp);
	
	var sp = document.createElementNS(svgLink, "svg");
	sp.setAttribute("id", "sizepicker");
	sp.setAttribute("onclick", "chooseSize(evt)");
	sp.style.width = toPix(spWidth); 
	sp.style.height = toPix(spWidth/2); 
	sp.style.top = toPix(spWidth/8); 
	tb.appendChild(sp);

	tb_isotri(0, 0, spWidth, spWidth/4, "black");

	
	var hw = cpWidth/2;
	for (var i = 0; i < hw; ++i) {
		for (var j = 0; j < hw; ++j) {
			tb_sq(i, j, 1, rgb(j*2, cpWidth - i*2, 0));
		}
	}
	for (var i = hw; i < cpWidth; ++i) {
		for (var j = 0; j < hw; ++j) {
			tb_sq(i, j, 1, rgb(j*2,0,(i-hw)*2));
		}
	}
}

function tb_destroy() {
	var tb = document.getElementById("toolbox");
	tb.style.display = "none";
	//document.body.removeChild(tb);
}

function triStr(p0, p1, p2) {
	var p0s = p0.x + "," + p0.y + " ";
	var p1s = p1.x + "," + p1.y + " ";
	var p2s = p2.x + "," + p2.y;
	return p0s + p1s + p2s;
}

function tb_isotri(x, y, width, height, colour) {
	var cp = document.getElementById("sizepicker");
	var tri = document.createElementNS(svgLink, "polygon");
	var p0 = {x:x, y:y};
	var p1 = {x:x, y:height};
	var p2 = {x:width, y:height/2};
	var triPoints = triStr(p0, p1, p2);
	tri.setAttribute("points", triPoints)
	tri.setAttribute("fill", colour);	
	cp.appendChild(tri);
}

function tb_sq(x, y, w, colour) {
	var cp = document.getElementById("colourpicker");
	var rect = document.createElementNS(svgLink, "rect");
	rect.setAttribute("x", x);
	rect.setAttribute("y", y);
	rect.setAttribute("width", w);
	rect.setAttribute("height", w);
	rect.setAttribute("fill", colour);
	cp.appendChild(rect);
}

function pa_create() {
	var pa = document.createElementNS(svgLink, "svg");
	pa.setAttribute("id", "paintarea");
	pa.setAttribute("onmousedown", "mousedown(evt)");
	pa.setAttribute("onmouseup", "mouseup()");
	pa.setAttribute("onmousemove", "mousemove(evt)");
	pa.setAttribute("onmouseenter", "mouseenter(evt)");
	pa.setAttribute("onmouseleave", "mouseleave(evt)");
	document.body.appendChild(pa);	
}

function pa_dot(p) {
	var paintarea = document.getElementById("paintarea");
	var circle = document.createElementNS(svgLink, "circle");
	var rad = penWidth/2;
	circle.setAttribute("cx", p.x);
	circle.setAttribute("cy", p.y);
	circle.setAttribute("r", rad.toString());
	circle.setAttribute("fill", penColour);
	paintarea.appendChild(circle);
}

function pa_line(p0, p1) {
	var paintarea = document.getElementById("paintarea");
	var line = document.createElementNS(svgLink, "line");
	line.setAttribute("x1", p0.x);
	line.setAttribute("y1", p0.y);
	line.setAttribute("x2", p1.x);
	line.setAttribute("y2", p1.y);
	line.setAttribute("stroke", penColour);
	line.setAttribute("stroke-width", penWidth.toString());
	line.setAttribute("stroke-linecap", "round");
	line.setAttribute("stroke-linejoin", "round");
	paintarea.appendChild(line);
}

/*
 * Using algorithm from:
 * http://scaledinnovation.com/analytics/splines/aboutSplines.html
 */
function pa_control(p0, p1, p2, t) {
    var d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
    var d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
	var fa = t * d01 / (d01 + d12);   
    var fb = t * d12 / (d01 + d12);   
	var c0x = p1.x - fa * (p2.x - p0.x);    
    var c0y = p1.y - fa * (p2.y - p0.y);    
    var c1x = p1.x + fb * (p2.x - p0.x);
    var c1y = p1.y + fb * (p2.y - p0.y);  
	return [{x:c0x, y:c0y}, {x:c1x, y:c1y}]
}

function pa_bezierStr(p0, p1) {
	var start = "M" + p0.x + "," + p0.y + " "; 
	var c0 = "C" + p0.cx + "," + p0.cy + " ";
	var c1 = p1.cx + "," + p1.cy + " "; 
	var end = p1.x + "," + p1.y; 
	return start + c0 + c1 + end;	
}
	
function pa_eraseLast(node) {
	var node = document.getElementById("paintarea");
	node.removeChild(node.lastChild);
}

function pa_curve(p0, p1) {
	var paintarea = document.getElementById("paintarea");
	var path = document.createElementNS(svgLink, "path");
	var bez = pa_bezierStr(p0, p1);
	path.setAttribute("d", bez);
	path.setAttribute("stroke", penColour);
	path.setAttribute("stroke-width", penWidth.toString());
	path.setAttribute("stroke-linecap", "round");
	path.setAttribute("fill", "none");
	paintarea.appendChild(path);
}

function main() {
	pa_create();
	document.onkeydown = keydown;
}

main()
