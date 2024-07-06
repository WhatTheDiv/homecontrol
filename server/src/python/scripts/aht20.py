import board
import adafruit_ahtx0

sensor = adafruit_ahtx0.AHTx0(board.I2C())

temp = sensor.temperature * (9 / 5) + 32

print("\nTemperature: %0.1f C" % temp)
print("Humidity: %0.1f %%" % sensor.relative_humidity)