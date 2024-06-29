import time
import adafruit_dht
from board import 18

dht_device = adafruit_dht.DHT22(18)

try:
    temperature_c = dht_device.temperature
    temperature_f = temperature_c * (9 / 5) + 32

    humidity = dht_device.humidity

    print("Temp:{:.1f}F  -  Humidity:{}%".format(temperature_f, humidity))

except RuntimeError as err:
    print("RuntimeError:" + err.args[0])

dht_device.exit()