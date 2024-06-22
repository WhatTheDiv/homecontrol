# import gpiod
# import time

# RELAY_1 = 19

# chip = gpiod.Chip('/dev/gpiochip4')
# relay_line = chip.get_line(RELAY_1)

# relay_line.request(consumer="RELAY_TEST", type=gpiod.LINE_REQ_DIR_OUT)

# print(' ')
# print(' Start ... ')
# print( ' ')
# try:
#   relay_line.set_value(1)
#   time.sleep(1)
#   relay_line.set_value(0)
#   time.sleep(1)
# finally: 
#   print('End of script')
#   relay_line.release()

import time
import gpiod
from gpiod.line import Direction, Value

RELAY_1 = 19
RELAY_2 = 20

print(' ')
print(' Start ... ')
print( ' ')

with gpiod.request_lines(
    "/dev/gpiochip4",
    consumer="blink-example",
    config={
        RELAY_1: gpiod.LineSettings(
            direction=Direction.OUTPUT
        ),
        RELAY_2: gpiod.LineSettings(
            direction=Direction.OUTPUT
        )
    },
) as request:
    try:
      request.set_value(RELAY_1, Value.INACTIVE)
      print('active, sleeping')
      time.sleep(1)
      request.set_value(RELAY_1, Value.ACTIVE)
      print('inactive, sleeping')
      time.sleep(1)
      request.set_value(RELAY_1, Value.INACTIVE)
      print('active, sleeping')
      time.sleep(1)
      request.set_value(RELAY_1, Value.ACTIVE)
      print('inactive, sleeping')
      time.sleep(1)
    except:
      print('Error handled')
      request.release()
    finally: 
      print('End of script')
      request.release()







