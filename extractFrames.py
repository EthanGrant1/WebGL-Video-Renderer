import os
import cv2 as c

def main():
    video = c.VideoCapture("./Renai Circulation.mp4")

    frames = 0

    extracted = 1

    while extracted:

        extracted, image = video.read()

        c.imwrite("./frames/frame%d.jpg" % frames, image)

        frames += 1

if __name__ == "__main__":
    main()


