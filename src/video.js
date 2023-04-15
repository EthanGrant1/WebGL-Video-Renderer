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
var vertdata;   

// Contexts used to draw images to the canvas
var context2d;
var contextGL;

// Current frame being worked on
var frame = 0;

// Float factors used for noramalizing WebGL grid for 720x1280 video
var xFac = 1/1280;
var yFac = 1/720;

// Compression factor used to shrink the pixel amount
var compression = 5;

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

    // Set up WebGL on GL canvas
    gl = WebGLUtils.setupWebGL(canvasGL);    
    if (!gl) { alert("WebGL unavailable"); }
    
    // Configuring core WebGL components on GL canvas

    // Set viewport origin (x, y), and size of the viewport (height, width)
    gl.viewport(0, 0, canvasGL.width, canvasGL.height);

    // Specify the color used when clearing color buffers
    gl.clearColor(1.0, 0.0, 1.0, 1.0);
    
    // Initialize our shaders
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    
    // Location of color var
    var u_Color = gl.getUniformLocation(program, "u_Color");
    let imageColors = Array.from(Array(720), () => new Array(1280));
    console.log("image colors");
    console.log(imageColors);
    
    // Load all of images and place them in an array of promises
    for (let i = 18; i < 19; i++) {
        promises.push(loadImage("frames/frame" + i.toString() + ".jpg"));
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

                console.log("here 1");

                let compw = canvasGL.width / compression;
                let comph = canvasGL.height / compression;
                let red, green, blue;
                red = green = blue = 0;

                // For each image in our image array
                for (let i = 0; i < myImages.length; i++) {

                    // X by Y pixel canvas

                    // Rows. Height values.
                    for (let y = 0; y < comph; y++) {

                        // Cols. Width values.
                        for (let x = 0; x < compw; x++) {

                            // console.log("(" + y.toString() + ", " + x.toString() + ")");
                
                            // Grab RGB values from color data and normalize to floats 0.0 - 1.0
                            let red     = myImages[i][y][x][0] / 255;
                            let green   = myImages[i][y][x][1] / 255;
                            let blue    = myImages[i][y][x][2] / 255;

                            // Set our color variable to values we grabbed from this pixel 
                            gl.uniform4f(u_Color, red, green, blue, 1);

                            // Normalized values for x and y values on the
                            // WebGL grid.
                            
                            let normalx = 0;
                            let normaly = 0;

                            // Left half. Negative x values.
                            if (x <= (compw / 2)) {
                                // x = 0 -> normal x = -1, x = width / 2 -> normal x = 0
                                normalx = -(((compw/2) - x) / (compw / 2));  
                            }

                            // Right half. Positive x values.
                            else {
                                // x tends towards 1
                                normalx = (x - (compw / 2)) / (compw / 2);
                            }

                            // Top half. Positive y values. Note that we are
                            // processing the pixels from the top down,
                            // so the y index value will increase as we go lower
                            if (y <= (comph / 2)) {
                                // y tends towards 0
                                normaly = (y + (comph / 2)) / (comph / 2);
                            }

                            // Bottom half. Negative y values.
                            else {
                                normaly = -((y - (comph / 2)) / (comph / 2));
                            }
                
                            // Positions of vertices on shared edge.
                            // Using x and y factors to normalize to values 0-1
                            
                            let top_right_corner = vec2(((normalx + 1) * xFac) * compression, (normaly * yFac));
                            let bottom_left_corner = vec2(normalx * xFac, ((normaly + 1) * yFac) * compression);
                            
                            // Prepare and render two triangles to form this square
                            vertdata = 
                                [
                                    vec2(normalx * xFac, normaly * yFac), // top left
                                    top_right_corner,
                                    bottom_left_corner
                                ];

                            load_and_set(gl, vertdata, program);
                            render_tri();
                            
                            vertdata = [];
                            vertdata =
                                [
                                    top_right_corner,
                                    bottom_left_corner,
                                    vec2(((normalx + 1) * xFac) * compression, ((normaly + 1) * yFac) * compression) // bottom right
                                ];

                            load_and_set(gl, vertdata, program);
                            render_tri();
                        }
                    }
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
