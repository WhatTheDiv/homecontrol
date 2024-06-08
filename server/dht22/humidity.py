import time
import adafruit_dht
import board

dht_device = adafruit_dht.DHT22(board.D17)

try:
    temperature_c = dht_device.temperature
    temperature_f = temperature_c * (9 / 5) + 32
    humidity = dht_device.humidity
    print("Temp:{:.1f} C / {:.1f} C    Humidity: {}%".format(temperature_c, temperature_f, humidity))

except RuntimeError as error:
  print(err.args[0])
  