
var previewImage = function(){
	var canvas = document.getElementById('canvas');
	var previewImage = document.getElementById('imgPreview');
	
	previewImage.src = canvas.toDataURL();
};

var drawColorPicker = function(){
    var canvas = document.getElementById('colorPicker');
	var ctx = canvas.getContext('2d');
	
	var colorPickerBG = new Image();
	colorPickerBG.src = "color-picker.png";
	colorPickerBG.onload = function(){
		ctx.drawImage(colorPickerBG,0,0,canvas.width,canvas.height);
	};
	colorPickerBG.onerror = function(){alert('could not load color picker image')};
};

var drawColorPickerCursor = function(x,y){
    var canvas = document.getElementById('colorPicker');
	var ctx = canvas.getContext('2d');
    var radius = 5;
    
    ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'gray';
	ctx.stroke();
}

var initCanvas = function(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

var initialize = function(){
	initCanvas();
	drawColorPicker();
}

$(function(){

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var brushColor = {r:50,g:50,b:50};
var brushSize = 10;
var brushSizeIncrementFactor = 1.1;
var cursorLastPos = {x:0,y:0};

// init functions
initialize();

var rgbArrayToHex = function(rgbArray){
	return rgbToHex('rgb('+rgbArray[0]+','+rgbArray[1]+','+rgbArray[2]+')');
}

var rgbStringToArray = function(rgbString){
	
	// split the rgb values from an rgb string into an array
	var stringArray = rgbString.replace(/[^\d,]/g, '').split(',');
	
	// convert those string values into ints
	$(stringArray).each(function(i,item){
		stringArray[i] = parseInt(item);
	});
	
	return stringArray;
};

var  rgbToHex = function(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
};
	
var hexToRgb = function(hex){
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

var changeBrushColor = function(color){
	brushColor = hexToRgb(color);
	$('#brushColorPreview').css('backgroundColor',color);
	$('input[type=color]').value = color;
};

var drawBrushCircle = function(context,position){
	var radius = brushSize / 2;
	
	context.beginPath();
	context.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
	context.lineWidth = 1;
	context.strokeStyle = 'gray';
	context.stroke();
}

var drawUI = function(canv,mousePos){
	var context = canv.getContext('2d');
	context.clearRect(0,0,canv.width,canv.height);
	
	// drawBrush
	drawBrushCircle(context,mousePos);
	
	
};
	
var drawBlobs = function(x,y){

	var percent = {
		r:Math.round(Math.random() * 100) / 100,
		g:Math.round(Math.random() * 100) / 100,
		b:Math.round(Math.random() * 100) / 100
	};

	var baseValue = Math.round(Math.random() * (255-50)+50);
	
	var numberOfBlobs = 20;
	var offsetMax = brushSize / 2;
	var sizeParams = {min:1,max:10};
	var jitterAmount = 30;
	
	for(var i = 0;i < numberOfBlobs;i++){
		
		var jitter = Math.round(Math.random() * (jitterAmount * 2) - jitterAmount);
	
		var color = {
			r:Math.round(brushColor.r + jitter),
			g:Math.round(brushColor.g + jitter),
			b:Math.round(brushColor.b + jitter)
		};
		
		console.log('color.r: '+color.r);
	
		var rgb = 'rgb('+color.r+','+color.g+','+color.b+')';
	
		ctx.fillStyle = rgb;
	
	
		var xoffset = Math.round(Math.random() * (offsetMax -(-offsetMax)) - offsetMax);
		var yoffset = Math.round(Math.random() * (offsetMax -(-offsetMax)) - offsetMax);
		var size = Math.round(Math.random() * (sizeParams.max - sizeParams.min) + sizeParams.min);
		
		ctx.fillRect(x + xoffset,y + yoffset,size,size);
	}
};

var pushColorToHistory = function(hexColor){
	// push the color to the color history panel
	var colorBox = $('<div></div>')
	.addClass('colorBox')
	.css('backgroundColor',hexColor)
	.on('click',function(){
		var rgbArray = rgbStringToArray($(this).css('backgroundColor'));
		
		// conver the array into an rgb string and then into hex, then change the brush color
		changeBrushColor(rgbToHex('rgb('+rgbArray[0]+','+rgbArray[1]+','+rgbArray[2]+')'));
		console.log('the brush color red is now ' + brushColor.r);
	})
	.appendTo('#colorHistoryContainer');
};

var mouseDown = false;
$('#canvOverlay').on('mousedown',function(e){
	if(e.button != 2){
		console.log('mousedown');
		mouseDown = true;
	}
	
}).on('mouseup',function(e){
	console.log('mouse up');
	mouseDown = false;
    previewImage();
}).on('mousemove',function(e){
	
	// calculate mouse position
	var rect = this.getBoundingClientRect();
	var position = {
		x:e.clientX - rect.left,
		y:e.clientY - rect.top
	};
	
	cursorLastPos = position;
	
	// draw the UI
	drawUI(document.getElementById('canvOverlay'),position);
	
	
	if(mouseDown){
		console.log('dragging');
		drawBlobs(position.x,position.y);
	}
}).on('mouseleave',function(){
	mouseDown = false;
});

var newcolor;
var colorPickerMouseDown = false;

var colorPick = function(e){
	var canvas = document.getElementById('colorPicker');
    var mouseCoords = {
		x:e.clientX - canvas.getBoundingClientRect().left,
		y:e.clientY - canvas.getBoundingClientRect().top
	};
    
    console.log('mouseCoords.x = ' + mouseCoords.x)
	
	drawColorPicker();
	setTimeout(function(){drawColorPickerCursor(mouseCoords.x,mouseCoords.y)},50);
    var rgba = canvas.getContext('2d').getImageData(mouseCoords.x,mouseCoords.y,1,1).data;
    newcolor = rgbArrayToHex([rgba[0],rgba[1],rgba[2]]);
	changeBrushColor(newcolor);
	console.log(brushColor);
};

$('#colorPicker').on('mousedown',function(e){
	
	colorPickerMouseDown = true;
	colorPick(e);
	
}).on('mousemove',function(e){
    if(colorPickerMouseDown){
		colorPick(e);
	}
    
}).on('mouseup',function(e){
	colorPickerMouseDown = false;
    pushColorToHistory(newcolor);
});

$('input[type=color]').on('change',function(){
	// change the global brush color and preview
	changeBrushColor(this.value);

	// push color to history
	pushColorToHistory(this.value);
	
	
	console.log('color changed! brushColor.r is ' + brushColor.r);
});

$(window).on('keydown',function(e){
	switch(e.which){
		case 221: // bracket up
			brushSize *= brushSizeIncrementFactor;
			break;
		case 219:
			brushSize = (brushSize / brushSizeIncrementFactor) >= 1 ? brushSize / brushSizeIncrementFactor : brushSize;
			break;
		default:
			break;
	}
	drawUI(document.getElementById('canvOverlay'),cursorLastPos);
});

});