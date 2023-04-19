import os
import cv2 as c

def main():
    video = c.VideoCapture("./soup.mp4")
    frames = 0
    extracted = 1

    while extracted:
        extracted, image = video.read()
        c.imwrite("./frames/soup%d.jpg" % frames, image)
        frames += 1

if __name__ == "__main__":
    main()


