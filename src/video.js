/*
 * video.js
 *
 * Creates a video render from pixel data in WebGL
 *
 * CIS367
 * Ethan Grant
 */

// Important global variables for canvases

// 2D canvas to get color data
var canvas2d;

// Canvas used to draw WebGL primatives
var canvasGL;

// Important variables for GL canvas
var gl;
var render;
var positionLocation;
var colorLocation;
var matrixLocation;
var positionBuf;
var colorBuf;

// Contexts used to draw images to the canvas
var context2d;
var contextGL;

// Current frame being worked on
var frame = 0;

// This will contain all of our image data
var myImages = [];

// Promises that will resolve to our images
var promises = [];

// Number of processed images and total number of images
// var processed = 0;
var dirLen = 6108;

// Exectutes WebGL code after webpage is loaded, so we can
// execute this code anywhere in our webpage and wait until
// the canvas is ready.
window.onload = function init() { 

    // Set up our canvases
    canvas2d = document.getElementById('2d-canvas');
    canvasGL = document.getElementById("gl-canvas");

    // Contexts for canvas information
    context2d = canvas2d.getContext("2d")
    contextGL = canvasGL.getContext("webgl");

    // Configuring core WebGL components on GL canvas

    // Set viewport origin (x, y), and size of the viewport (height, width)
    contextGL.viewport(0, 0, canvasGL.width, canvasGL.height);

    // Specify the color used when clearing color buffers
    contextGL.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Initialize our shaders
    var program = initShaders(contextGL, 'vertex-shader', 'fragment-shader');
    contextGL.useProgram(program);
    
    // Location of WebGL variables
    positionLocation = contextGL.getAttribLocation(program, "aPosition");
    colorLocation = contextGL.getUniformLocation(program, "aColor");

    matrixLocation = contextGL.getUniformLocation(program, "uMatrix");
    
    positionBuf = contextGL.createBuffer();
    for (let y = 0; y < canvasGL.height; y++) {
        for (let x = 0; x < canvasGL.width; x++) {
            let temp = new Float32Array([
                x, y,
                (x + 1), y,
                x, (y + 1),
                (x + 1), y,
                x, (y + 1),
                (x + 1), (y + 1)
            ]);

            positionBuf = positionBuf.concat(temp);        
        }
    }

    colorBuf = contextGL.createBuffer();

    let imageColors = Array.from(Array(720), () => new Array(1280));
    // console.log("image colors");
    // console.log(imageColors);
    
    // Load all of images and place them in an array of promises
    for (let i = 0; i < 1; i++) {
        promises.push(loadImage("frames/soup" + i.toString() + ".jpg"));
    }

    // Await all image loading promises to resolve
    Promise.all(promises).then(

        // With the promises collection as "images"
        (images) => {

            // For each image
            images.forEach(

                // With our image file as "image"
                (image) => {
                
                    // Draw the image to the 2D canvas
                    context2d.drawImage(image, 0, 0, canvas2d.width, canvas2d.height);

                    // console.log("getting image data");

                    // Grab pixel data from the image
                    let imageData = context2d.getImageData(0, 0, canvas2d.width, canvas2d.height);
                    let data = imageData.data;

                    // Iterate over the pixels of the image
                    for (let x = 0; x < imageColors.length; x++) {
                        for (let y = 0; y < imageColors[x].length; y++) {
                        
                            // Because image data is returned as one contiguous array of numbers,
                            // we must iterate over 4 elements at a time. The array follows the structure:
                            // [R, G, B, A, ... R, G, B, A, ... R, G, B, A]
                            let index = (canvas2d.width * x + y) * 4;
                        
                            // Grab the important values of our image color.
                            // We will default to using max alpha value 1.0
                            imageColors[x][y] = [data[index], data[index + 1], data[index + 2], data[index + 3]];
                        }
                    }

                    // Add this to our images array for drawing
                    myImages.push(imageColors);
                    
                    /* debug print statements
                     *
                     * console.log("imageColors");
                     * console.log(imageColors);
                     * myImages.push(imageColors);
                     * console.log("images");
                     * console.log(myImages);
                     * console.log("Image processed: Image #" + processed.toString());
                     * processed++;
                     */
                })

        // After all images are processed for their data
        }).then(() => {
                
                /* debug testing WebGL canvas
                 *
                 * console.log("rendering");
                 * 
                 * gl.uniform4f(u_Color, 1, 0, 1, 1);
                 * 
                 * vertdata = [vec2(-1, 1), vec2(1, 1), vec2(-1, -1)];
                 * load_and_set(gl, vertdata, program); 
                 * render_tri();
                 * 
                 * vertdata = [vec2(1, 1), vec2(-1, -1), vec2(1, -1)];
                 * load_and_set(gl, vertdata, program); 
                 * render_tri();
                 */

                // console.log("here 1");

                let red, green, blue;
                red = green = blue = 0;

                // For each image in our image array
                for (let i = 0; i < myImages.length; i++) {

                    colorBuf = [];

                    // X by Y pixel canvas

                    // Rows. Height values.
                    for (let y = 0; y < canvasGL.height; y++) {

                        // Cols. Width values.
                        for (let x = 0; x < canvasGL.width; x++) {

                            // console.log("(" + y.toString() + ", " + x.toString() + ")");
                
                            let red     = myImages[i][y][x][0] / 255;
                            let green   = myImages[i][y][x][1] / 255;
                            let blue    = myImages[i][y][x][2] / 255;

                            colorBuf = coloBuf.concat(new Float32Array([
                                red, green, blue, 1,
                                red, green, blue, 1,
                                red, green, blue, 1,
                                red, green, blue, 1,
                                red, green, blue, 1,
                                red, green, blue, 1
                            ]));
                        }
                    }

                    contextGL.bindBuffer(contextGL.ARRAY_BUFFER, colorBuf);
                    setupBuf(contextGL, colorBuf);
                    
                    draw();
                }
            }); 
};

// This function loads images asynchronously and returns them through a promise
function loadImage(src) {

    // Return a promise with two instance variables that
    // will be used to determine the state of the image object
    return new Promise((resolve, reject) => {
        // Instantiate a blank image object
        const img = new Image();

        // Point to the file of a particular image
        img.src = src;

        // Resolve the promise and return the image object
        img.onload = () => resolve(img);

        // If something goes wrong, the promise is rejected
        img.onerror = reject;
    });
}

function setupBuf(gl, buf) {
    gl.bufferdata(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
}

function draw() {
    contextGL.enableVertexAttribArray(positionLocation);
    contextGL.bindBuffer(contextGL.ARRAY_BUFFER, positionBuf);
    contextGL.vertexAttribPointer(positionLocation, 2, contextGL.FLOAT, false, 0, 0);

    contextGL.enableVertexAttribArray(colorLocation);
    contextGL.bindBuffer(contextGL.ARRAY_BUFFER, colorBuf);
    contextGL.vertexAttribPointer(colorLocation, 4, contextGL.FLOAT, false, 0, 0);

    var matrix = m3.projection(contextGL.canvas.clientWidth, contextGL.canvas.clientHeight);
    contextGL.uniformMatrix3fv(matrixLocation, false, matrix);

    contextGL.drawArrays(contextGL.TRIANGLES, 0, (positionBuf.length / 2));
}

function beginRender() {
    render = setInterval(function() {
        let image = new Image();
    
        image.onload = function() {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };

        image.src = "./frames/frame" + frame.toString() + ".jpg";
    
        frame++;

        if (frame < dirLen) {
            console.log("requesting");
            window.requestAnimationFrame(render);
        }

    else { frame = 0; }

    }, 1000/30);

    render;
}

// Load buffers and get ready to render
function load_and_set(gl, vertdata, program) {
    // Load data into GPU
    var bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertdata), gl.STATIC_DRAW);

    // Set position and render
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition); 
}

// Render a triangle given our vertex data
function render_tri() { gl.drawArrays(gl.TRIANGLES, 0, vertdata.length); }

Float32Array.prototype.concat = function() {
	var bytesPerIndex = 4, buffers = Array.prototype.slice.call(arguments);
	
	// add self
	buffers.unshift(this);

	buffers = buffers.map(function (item) {
		if (item instanceof Float32Array) {
			return item.buffer;
		}

		else {
			throw new Error('You can only concat Float32Array');
		}
	});

	var concatenatedByteLength = buffers
		.map(function (a) {return a.byteLength;})
		.reduce(function (a,b) {return a + b;}, 0);

	var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);

	var offset = 0;
	buffers.forEach(function (buffer, index) {
		concatenatedArray.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});

	return concatenatedArray;
};
