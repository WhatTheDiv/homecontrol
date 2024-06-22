# import gpiod
# import time

# RELAY_1 = 19

# chip = gpiod.Chip('gpiochip4')
# relay_line = chip.get_line(RELAY_1)

# relay_line.request(consumer="RELAY", type=gpiod.LINE_REQ_DIR_OUT)

import gpiod

with gpiod.Chip("/dev/gpiochip4") as chip:
    info = chip.get_info()
    print(" ")
    print("---------- Start ---------- ")
    print(" ")
    print(f"{info.name} [{info.label}] ({info.num_lines} lines)")