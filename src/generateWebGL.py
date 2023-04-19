####################################
# This is a python script that was #
# used to automatically generate   #
# a large amount of WebGL code.    #
# This ultimately went unused      #
# because loading the js file was  #
# too large. It was very slow.     #
####################################

import os
import numpy as n
from PIL import Image as i

# Get color data from an image
def getColors(path):

    # Open image file and determine size
    image = i.open(path, "r")
    w, h = image.size

    # Get color data
    colors = list(image.getdata())
    
    # Get number of color channels
    if image.mode == "RGB": c = 3

    elif image.mode == "L": c = 1
    
    else:
        print("Unknown mode: %s" % im.mode)
        return None
    
    # Create a W x H grid of color values
    colors = n.array(colors).reshape((w, h, c))
    return colors


# Generate code
def main():
    
    #######################################################
    # Generating a normalization grid                     #
    #######################################################

    # Factors for normalizing 720p video (1280x720 pixels) to a unit grid
    xfac = 1/640
    yfac = 1/360
    grid = []

    # Path to all of the video frames
    path = os.path.abspath('./frames') + '/'
    colorData = getColors(path + os.listdir('./frames')[356])

    rowCount = len(colorData)
    colCount = len(colorData[0])

    # 720 rows
    for r in range(rowCount + 1):

        grid.append([])
        
        # First row, y value it at its highest point
        if r == 0: y = 1

        # Last row, y value is at its lowest point
        elif r == rowCount: y = -1

        # Less than 360 pixels down. Start at 1 and work down to 0.
        elif r < rowCount / 2: y = 1 - (yfac * r)

        # On the x-axis line, y value is 0
        elif r == rowCount / 2: y = 0

        # More than 360 pixels down. Start at 0 and work down to -1.
        elif r > rowCount / 2: y = -(yfac * (r - 360))
        
        # 1280 columns
        for c in range(colCount + 1):
            
            # First column, x value is at its lowest point
            if c == 0: x = -1

            # Last column, x value is at its highest point
            elif c == colCount: x = 1

            # Less than 640 pixels across. Start at -1 and work up to 0
            elif c < colCount / 2: x = -(xfac * (640 - c))

            # On the y-axis line, x value is 0 
            elif c == colCount / 2: x = 0

            # More than 640 pixels across. Start at 0 and work up to 1.
            elif c > colCount / 2: x = xfac * (c - 640)
            
            grid[r].append([x, y])
    
    
    #############################################
    # Use color data to generate code           #
    #############################################

    # For every frame in the frame directory
    codeString = ''
    
    # Index the rows
    i = 0

    # For every row and column in the pixel data matrix
    for row in colorData:
        for col in colorData[row]:
            
            # Index the columns
            j = 0

            # Extract RGB color values from each pixel
            r, g, b = [int(value) for value in ' '.join(map(str, colorData[i][j])).split()]
            
            # Code template for each square
            frameCode = \
"""
gl.uniform4f(u_Color,{},{},{},1);
vertdata=[vec2({},{}),vec2({},{}),vec2({},{})];
var bufferID=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,bufferID);
gl.bufferData(gl.ARRAY_BUFFER,flatten(vertdata),gl.STATIC_DRAW);
var vPosition=gl.getAttribLocation(program,'vPosition');
gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vPosition);
gl.drawArrays(gl.TRIANGLES,0,vertdata.length);

vertdata=[vec2({},{}),vec2({},{}),vec2({},{})];
var bufferID=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,bufferID);
gl.bufferData(gl.ARRAY_BUFFER,flatten(vertdata),gl.STATIC_DRAW);
var vPosition=gl.getAttribLocation(program,'vPosition');
gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vPosition);
gl.drawArrays(gl.TRIANGLES,0,vertdata.length);
"""
            # Positions for vertdata to draw a square
            topLeft = grid[i][j]
            topRight = grid[i][j + 1]
            bottomLeft = grid[i + 1][j]
            bottomRight = grid[i + 1][j + 1]

            # Format the string with our calculated values
            frameCode = frameCode.format (
                    r, g, b,                        # Color data
                    topLeft[0], topLeft[1],         # First tri, first vert
                    topRight[0], topRight[1],       # First tri, second vert
                    bottomLeft[0], bottomLeft[1],   # First tri, third vert
                    bottomLeft[0], bottomLeft[1],   # Second tri, first vert
                    topRight[0], topRight[1],       # Second tri, second vert
                    bottomRight[0], bottomRight[1]  # Second tri, third vert
            )
            
            # Add our code to our full code string
            codeString += frameCode
            
            # Increment our indicies
            j += 1
        i += 1
    
    print(codeString)

if __name__ == "__main__":
    main()

