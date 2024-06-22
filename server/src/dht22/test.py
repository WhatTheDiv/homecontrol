import gpiod
import time

RELAY_1 = 19

chip = gpiod.Chip('gpiochip4')
relay_line = chip.get_line(RELAY_1)

relay_line.request(consumer="RELAY_TEST", type=gpiod.LINE_REQ_DIR_OUT)

try:
  relay_line.set_value(1)
  time.sleep(1)
  relay_line.set_value(0)
  time.sleep(1)
finally: 
  relay_line.release()

# import time
# from gpiod.line import Direction, Value

# LINE = 5

# with gpiod.request_lines(
#     "/dev/gpiochip4",
#     consumer="blink-example",
#     config={
#         LINE: gpiod.LineSettings(
#             direction=Direction.OUTPUT, output_value=Value.ACTIVE
#         )
#     },
# ) as request:
#     while True:
#         request.set_value(LINE, Value.ACTIVE)
#         time.sleep(1)
#         request.set_value(LINE, Value.INACTIVE)
#         time.sleep(1)







