from gpiozero import LED
import board
import time

led = LED(board.D20)

print("Starting script")
try:

    led.on()
    time.sleep(2)
    led.off() 
    time.sleep(2)
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0])

finally:
    print("-------   Script complete    -------")