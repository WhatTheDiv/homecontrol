
from gpiozero import LED
import time
import sys
import select
from signal import pause
import adafruit_ahtx0
import board
from array import array
from smbus2 import SMBus, i2c_msg


print("* ")
print("-------   Starting AudioRelays.py   -------")
print(" ", flush=True)


try: 

    z_1_L = LED(pin=18, initial_value=False)
    z_1_R = LED(pin=19, initial_value=False)
    z_2_L = LED(pin=20, initial_value=False)
    z_2_R = LED(pin=21, initial_value=False)
    aht20 = adafruit_ahtx0.AHTx0(board.I2C())
    slave_nano_addr = 0x8

    def toggleAudioZone(zone, set_state):
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
        # 1:a/z1-0\n                      = audio  =    [ count : name / zone - state ]
        # 2:l/at&z0-s0\n                  = lights =    [ count: name  / action_toggle & zone - state ]
        # 3:l/aa&a1\n                     = lights =    [ count: name / action_animation & animationId ]
        # 4:l/ac&c-colorName(0,0,0,0)\n   = lights =    [ count: name / action_colorChange & color - name(r,g,b,w) ]            -- 13 char max length name
        # 5:l/as&\n                       = lights =    [ count: name / action_getState ]

        count = input[:input.find(':')]
        command = input[input.find(':') + 1:input.find(':') + 2]

        if command == 'a':
          # Toggle Audio
            zone_index = input.find('z') + 1
            state_index = input.find('-') + 1
            zone = input[zone_index:zone_index + 1]
            state = input[state_index:]
            # print(f'* zone:{zone}',flush=True)
            # print(f'* state:{state}',flush=True)
            passed = toggleAudioZone(int(zone), int(state))

            return f"{count}:Success-{passed}"
        
        elif command == 's':
          #  Get State
            with SMBus(1) as bus:
              z1_active = str(not z_1_L.is_lit)
              z2_active = str(not z_2_L.is_lit)
              temp = round(aht20.temperature * (9 / 5) + 32, 1)
              humidity = round(aht20.relative_humidity, 1)
              
              block = bus.read_i2c_block_data(slave_nano_addr, 0, 16)
              string = ''.join(chr(x) for x in block)

              lights_active = string[string.index('S:')+2:string.index(',A:')]
              animation_index = string[string.index(',A:') + 3:string.index(']')]

            return f"{count}:z1-{z1_active[0:1]},z2-{z2_active[0:1]},t-{temp},h-{humidity},l-{lights_active},a-{animation_index}"

        elif command == 'l':
          # Handle lights
            with SMBus(1) as bus:
              t = bytes(input[4:-1], 'utf-8')
              if(len(t) > 31):
                print(f"String too long to send to arduino slave! (Len: {len(t)})", flush=True)

              bus.write_i2c_block_data(slave_nano_addr, 0, t)
            return f"{count}:Success"

    while True:
        inp = sys.stdin.readline()

        if inp.strip() == 'q':
            print('* quitting-',flush=True)
            break
        elif bool(inp.strip()) == False:
            break
        elif inp.strip() == 't':
            with SMBus(1) as bus: 
              block = bus.read_i2c_block_data(slave_nano_addr, 0, 16)
              string = ''.join(chr(x) for x in block)
              print(string[:string.index(']')+1],flush=True)
              # trimmed = string[:string.find("]")+1]
        else:
            print(f'{process_input(inp)}',flush=True)


except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0], flush=True)

finally:
    print(" ")
    print("-------   Script Terminated    -------")
    print(" ", flush=True)