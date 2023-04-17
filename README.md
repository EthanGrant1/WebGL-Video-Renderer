# Video Renderer

## What is this?
This is a functional proof of concept for image / video rendering in WebGL.

## Limitations
Due to rendering speed, the functionality of video rendering is infeasible at present. The reason is because it would simply take too much CPU / RAM / GPU power to perform all of the work required to sustain a reasonable framerate.

Currently, the project renders out images, albeit quite slowly. The idea is that WebGL could be used to render images quickly enough to simulate video playback. Pairing this with a MP3 / WAV / etc. audio file, you would effectively have a video without needing any video player.

## What does it do?
Using a separate program, we can extract frames from a video. We can then take these frames and extract pixel data (specifically the colors) from their images. We can then use this color data, along with a WebGL canvas to draw the images to the screen using WebGL triangle primatives. Do this fast enough, and you have a video.

The code will need to be optimized heavily, and take use of other techniques if it ever is to render at a speed sufficient enough to simulate a video at 30 frames per second.

## Conclusion
A theoretical model of this project would provide a program which is efficient enough to be ran 30 times per second. Another theoretical model would suggest a computer with high enough computing power to perform the actions required fast enough, as to not be bottlenecked by CPU / RAM / GPU.

[Go to web page](./src/index.html)
