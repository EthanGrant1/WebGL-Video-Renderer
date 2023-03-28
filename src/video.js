/*
 * video.js
 *
 * Creates a video render from pixel data in WebGL
 *
 * CIS367
 * Ethan Grant
 */

// Important global variables for WebGL canvas
var canvas2d;
var canvasGL;
var gl;
var render;

var context2d;
var contextGL;

var frame = 0;

var xFac = 1/1280;
var yFac = 1/720;

var images = [];
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

    // Set up WebGL on GL canvas
    gl = WebGLUtils.setupWebGL(canvasGL);
    
    if (!gl) { alert("WebGL unavailable"); }
    
    // Configuring core WebGL components on GL canvas

    // Set viewport origin (x, y), and size of the viewport (height, width)
    gl.viewport(0, 0, canvasGL.width, canvasGL.height);

    // Specify the color used when clearing color buffers
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    
    // Location of color var
    var u_Color = gl.getUniformLocation(program, "u_Color");
    
    // Process images on 2D canvas
    for (let i = 18; i < 19; i++) {
        
        let image = new Image();

        // Wait for image to load and then draw it to the canvas
        image.onload = function() {

            console.log("drawing");
            context2d.drawImage(image, 0, 0, canvas2d.width, canvas2d.height);


            console.log("getting image data");
            // Grab pixel data from the image
            let imageData = context2d.getImageData(0, 0, canvas2d.width, canvas2d.height);
            let data = imageData.data;

            let imageColors = []

            for (let x = 0; x <= canvas2d.width; x++) {

                imageColors.push([]);

                for (let y = 0; y <= canvas2d.height; y++) {

                    imageColors[x].push([]);
                    let index = (canvas2d.width * x + y) * 4;
            
                    imageColors[x][y].push([data[index], data[index + 1], data[index + 2], data[index + 3]]);
                }
            }
            
            console.log("image colors");
            images.push(imageColors);
        };
        
        console.log("setting image source");
        // Source of the image in the frames folder
        // image.crossOrigin = "";
        image.src = "./frames/frame" + i.toString() + ".jpg";
        console.log(image.src);
    }
           
    console.log(images);
    
};

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

// Render a triangle
function render_tri() {
    gl.drawArrays(gl.TRIANGLES, 0, vertdata.length);
}


