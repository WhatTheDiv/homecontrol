import board
import neopixel

pixels = neopixel.NeoPixel(board.NEOPIXEL, 12)
pixels[0] = (10, 0, 0)