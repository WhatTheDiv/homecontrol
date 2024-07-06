import board
import adafruit_ahtx0

sensor = adafruit_ahtx0.AHTx0(board.I2C())

print("\nTemperature: %0.1f C" % sensor.temperature * (9 / 5) + 32)
print("Humidity: %0.1f %%" % sensor.relative_humidity)