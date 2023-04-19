######################################################
# This is a very naive way to get grid normalization #
# values. Went unused because loading the Javascript #
# was too slow to load.                              #
######################################################

def main():
    
    # 1280 x 720 grid
    grid = []
    
    for i in range(1281):
        grid.append([0,0])
    
    grid2 = []

    for i in range(721):
        grid2.append(grid)

    # Factors used to normalize to 0.0 - 1.0
    xfac = 1/640
    yfac = 1/360
    r = 0
    
    # Determine the quadrant that we are on and use positive / negative values for x and y
    for row in grid2: 

        if r == 0: y = 1
            
        elif r == 720: y = -1

        elif r < 360: y = 1 - (yfac * r)

        elif r == 360: y = 0

        elif r > 360: y = -(yfac * (r - 360))
        
        c = 0
        for col in row:

            if c == 0: x = -1

            elif c == 1280: x = 1

            elif c < 640: x = -(xfac * (640 - c))

            elif c == 640: x = 0

            elif c > 640: x = xfac * (c - 640)
            
            grid2[r][c] = [x, y]
            
            c += 1

        print(grid2[r])

        r += 1

if __name__ == "__main__":
    main()
