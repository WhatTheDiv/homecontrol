import time
import adafruit_dht
import board

dht_device = adafruit_dht.DHT22(board.D17)

try:
    temperature_c = dht_device.temperature
    temperature_f = temperature_c * (9 / 5) + 32

    humidity = dht_device.humidity

    print("Temp:{:.1f}F  -  Humidity:{}%".format(temperature_f, humidity))
    return
    
except RuntimeError as err:
    print(err.args[0])
    return
