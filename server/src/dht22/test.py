import RPi.GPIO as GPIO 

GPIO.setmode(GPIO.BOARD)
GPIO.setup(19, GPIO.OUT)

print ("Setting up GPIO 19 as output")

GPIO.cleanup()