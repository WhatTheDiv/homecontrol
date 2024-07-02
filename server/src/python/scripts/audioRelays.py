
from gpiozero import LED
import time
import sys
import select
from signal import pause

try: 

    z_1_L = LED(pin=18, initial_value=True)
    z_1_R = LED(pin=19, initial_value=True)

    z_2_L = LED(pin=20, initial_value=True)
    z_2_R = LED(pin=21, initial_value=True)

    def toggleZone(zone, set_state):
        if zone == 1:
            curr_state = z_1_L.is_lit
            print(f"* Zone 1 currently{curr_state}", flush=True)
            if curr_state == bool(set_state):
                print("* New state matches current, do nothing")
                return True
            elif bool(set_state):
                print("* Setting zone 1 to active")
                z_1_L.on()
                z_1_R.on()
                return True
            else:
                print("* Setting zone 1 to inactive")
                z_1_L.off()
                z_1_R.off()
                return True
        elif zone == 2:
            curr_state = z_2_L.is_lit
            print(f"* Zone 2 currently{curr_state}", flush=True)
            if curr_state == bool(set_state):
                print("* New state matches current, do nothing")
                return True
            elif bool(set_state):
                print("* Setting zone 2 to active")
                z_2_L.on()
                z_2_R.on()
                return True
            else:
                print("* Setting zone 2 to inactive")
                z_2_L.off()
                z_2_R.off()
                return True
        else:
            return False


    def process_input(input):
        count = input[:1]
        command_index = input.find(':') + 1
        command = input[command_index:command_index + 1]
        print(f'* count:{count}',flush=True)
        print(f'* command:{command}',flush=True)

        if command == 'a':
            zone_index = input.find('z') + 1
            state_index = input.find('-') + 1
            zone = input[zone_index:zone_index + 1]
            state = input[state_index:]
            print(f'* zone:{zone}',flush=True)
            print(f'* state:{state}',flush=True)
            passed = toggleZone(int(zone), int(state))
            print(f"{count}:Success:{passed}", flush=True)
              
        
        
        

      

    print("* ")
    print("-------   Starting AudioRelays.py   -------")
    print(" ", flush=True)


    while True:
        inp = sys.stdin.readline()

        if inp.strip() == 'q':
            print('* quitting-',flush=True)
            break
        elif bool(inp.strip()) == False:
            break
        else:
            print(f'{inp}',flush=True)
            process_input(inp)
            # TODO pull out command and set relays. print success command


      
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0], flush=True)

finally:
    print(" ")
    print("-------   Script Terminated    -------")
    print(" ", flush=True)