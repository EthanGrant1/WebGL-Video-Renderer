# CV2 library has useful video and image methods that we can use
import cv2 as c

def main():

    # Grab our video file
    video = c.VideoCapture("./soup.mp4")

    # Current frame number
    frames = 0

    # Image extraction returns a boolean value
    extracted = 1
    while extracted:

        # Read the next frame from the video
        extracted, image = video.read()

        # Write the image to our frames directory
        c.imwrite("./frames/soup%d.jpg" % frames, image)

        # Increase the frame count for our image name
        frames += 1

if __name__ == "__main__":
    main()


