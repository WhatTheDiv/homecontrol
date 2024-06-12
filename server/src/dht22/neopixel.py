import board
import neopixel

pixels = neopixel.NeoPixel(board.NEOPIXEL, 12, auto_write=False)
pixels[0] = (10, 0, 0, 10)
pixels[0] = (0, 10, 0, 10)

pixels.show()