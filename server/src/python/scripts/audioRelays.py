
from gpiozero import LED
import time
import sys
import select
from signal import pause


print("* ")
print("-------   Starting AudioRelays.py   -------")
print(" ", flush=True)


try: 

    z_1_L = LED(pin=18, initial_value=False)
    z_1_R = LED(pin=19, initial_value=False)
    z_2_L = LED(pin=20, initial_value=False)
    z_2_R = LED(pin=21, initial_value=False)

    def toggleZone(zone, set_state):
        if zone == 1:
            curr_state = not z_1_L.is_lit
            # print(f"* Zone 1 currently {curr_state}", flush=True)
            if curr_state == bool(set_state):
                # print("* New state matches current, do nothing")
                return True
            elif bool(set_state):
                # print("* Setting zone 1 to active")
                z_1_L.off()
                z_1_R.off()
                return True
            else:
                # print("* Setting zone 1 to inactive")
                z_1_L.on()
                z_1_R.on()
                return True
        elif zone == 2:
            curr_state = not z_2_L.is_lit
            # print(f"* Zone 2 currently {curr_state}", flush=True)
            if curr_state == bool(set_state):
                # print("* New state matches current, do nothing")
                return True
            elif bool(set_state):
                # print("* Setting zone 2 to active")
                z_2_L.off()
                z_2_R.off()
                return True
            else:
                # print("* Setting zone 2 to inactive")
                z_2_L.on()
                z_2_R.on()
                return True
        else:
            return False


    def process_input(input):
        count = input[:input.find(':')]
        command_index = input.find(':') + 1
        command = input[command_index:command_index + 1]
        # print(f'* count:{count}',flush=True)
        # print(f'* command:{command}',flush=True)

        if command == 'a':
          # Toggle Audio
            zone_index = input.find('z') + 1
            state_index = input.find('-') + 1
            zone = input[zone_index:zone_index + 1]
            state = input[state_index:]
            # print(f'* zone:{zone}',flush=True)
            # print(f'* state:{state}',flush=True)
            passed = toggleZone(int(zone), int(state))

            return f"{count}:Success-{passed}"
        
        elif command == 's':
          #  Get State
            z1_active = not z_1_L.is_lit
            z2_active = not z_2_L.is_lit

            return f"{count}:z1-{z1_active},z2-{z2_active}"


    while True:
        inp = sys.stdin.readline()

        if inp.strip() == 'q':
            print('* quitting-',flush=True)
            break
        elif bool(inp.strip()) == False:
            break
        else:
            print(f'{process_input(inp)}',flush=True)


except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0], flush=True)

finally:
    print(" ")
    print("-------   Script Terminated    -------")
    print(" ", flush=True)