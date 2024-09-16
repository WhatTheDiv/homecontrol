
import sys
from signal import pause
import adafruit_ahtx0
import board
from smbus2 import SMBus, i2c_msg


print("* ")
print("-------   Starting AudioRelays.py   -------")
print(" ", flush=True)


try: 

    aht20 = adafruit_ahtx0.AHTx0(board.I2C())
    slave_nano_addr = 0x8
    slave_bedroom_nano = 0x22
    lights_slave = 0x24


    def get_Audio_State():
      _zone1, _zone2, _success, _err = 0,0,0,""

      try:
        with SMBus(1) as bus:
            t = bytes(f"getAudio", "utf-8")
            bus.write_i2c_block_data(slave_bedroom_nano, 0, t)
            block = bus.read_i2c_block_data(slave_bedroom_nano, 0, 20)
            string = ''.join(chr(x) for x in block)

            if(string.find("success") >= 0):  
              _success = 1  
              _zone1 =  string[string.find('z1-') + 3 : string.find('z1-') + 4]
              _zone2 =  string[string.find('z2-') + 3: string.find('z2-') + 4]  
            elif(string.find("fail") >= 0):
              _success = 0
              _err = "fail"     
            else: 
              _success = 0
              _err = "unexpectedResponse"
      except:
        _success = 0
        _err = "runntimeError"

      # print(f"Audio state: z1-{_zone1}, z2-{_zone2}, success-{_success}, err-{_err}", flush=True)
      return _zone1, _zone2, _success, _err
    def set_Audio(zone=-1, state=-1):
      _success, _err = 0,""
      
      if(zone == -1 or state == -1):
        _fail = 1
        _err = "badInput"
      
      else:
        try:
          with SMBus(1) as bus:
              t = bytes(f"setAudio/z{zone}-{state}", "utf-8")
              bus.write_i2c_block_data(slave_bedroom_nano, 0, t)
              block = bus.read_i2c_block_data(slave_bedroom_nano, 0, 20)
              string = ''.join(chr(x) for x in block)

              if(string.find("success") >= 0):  
                _success = 1  
              elif(string.find("fail") >= 0):
                _success = 0
                _err = string[string.find("fail") + 5:]    
              else: 
                _success = 0
                _err = "unexpectedResponse"
        except RuntimeError as e:
          _success = 0
          _err = "runntimeError"
          print(f"error from python: {e}")

      return _success, _err
    

    def process_input(input):
        count = input[:input.find(':')]
        command = input[input.find(':') + 1:input.find(':') + 2]
        action = input[input.find('/') +1]

        if command == 'z': #   Get Audio & Temp State    ***** working
          temp_ =  round(aht20.temperature * (9 / 5) + 32, 1)    
          humi_ = round(aht20.relative_humidity, 1)               
          # print(f" temp {temp_} and humi {humi_}")             
          zone1, zone2, success, error = get_Audio_State()
          # zone1, zone2, success, error = 0, 0, True, False

          if(not success):
            return f"{count}:z1-{0}/z2-{0}/e-{error}/t-{temp_}/h-{humi_}"
             

          return f"{count}:z1-{zone1}/z2-{zone2}/e-0/t-{temp_}/h-{humi_}"
        
        elif command == 't': #                                          Get Temp State            *****
          return f"{count}:t-{round(aht20.temperature * (9 / 5) + 32, 1)}/h-{round(aht20.relative_humidity, 1)}"
        
        elif command == 'a' and action == 's': #                        Get Audio State           *****

          zone1, zone2, success, error = get_Audio_State()

          if(not success):
            return f"{count}:z1-{0}/z2-{0}/e-{error}"
             
          return f"{count}:z1-{zone1}/z2-{zone2}/e-0"
        
        elif command == 'a': #                                          Set Audio                 ***** working  
          zone_index = input.find('z') + 1
          state_index = input.find('-') + 1
          zone = input[zone_index:state_index - 1]
          state = input[state_index:state_index+1]

          success, error = set_Audio(zone, state)

          if(not success):
            return f"{count}:success-false/e-{error}"
          
          else:
            return f"{count}:z{zone}-{state}/e-0"

        
        elif command == 'l' and action == 's': #                        Get Lights State          ***** 
          try:
            with SMBus(1) as bus:
              t = bytes("state", "utf-8")

              bus.write_i2c_block_data(lights_slave, 0, t)
              block = bus.read_i2c_block_data(lights_slave, 0, 10)

              string = ''.join(chr(x) for x in block)

              if(string.find("fail") >= 0):
                return f"{count}:success-false"
              
              elif(string.find("success") >= 0):
                #  "success/s{ active? }/a{ animationId }"
                indLightsActice = string.find('/')+2
                indAnimation = string.find('/', indLightsActice)+2
                lightsActive = string[indLightsActice:indLightsActice+1]
                animationId = string[indAnimation: indAnimation+1] 
                return f"{count}:l-{lightsActive}/a-{animationId}"
              else:
                return f"{count}:success-false"

          except:
            return f"{count}:success-false"
          # return f"{count}:l-{0}/a-{1}"
          # return f"{count}:l-{lights_active}/a-{animation_index}"
        
        # [ ] Set animation
        elif command == 'l' and action[:input.find('-')] == 'a': #     Set Animation             *****            #--------- 
          return f"{count}:l-{0}/a-{1}"
        
        # [ ] Toggle Lights
        elif command == 'l' and action[:input.find('-')] == 'l': #     Toggle Lights             *****            #--------- 
          try:
            with SMBus(1) as bus:
              t = bytes("lightsToggle/" + action[input.find('-') + 1], "utf-8")

              bus.write_i2c_block_data(lights_slave, 0, t)
              block = bus.read_i2c_block_data(lights_slave, 0, 10)

              string = ''.join(chr(x) for x in block)

              if(string.find("fail") >= 0):
                return f"{count}:success-false"
              
              elif(string.find("success") >= 0):
                #  "success/s{ active? }/a{ animationId }"
                indLightsActice = string.find('/')+2
                indAnimation = string.find('/', indLightsActice)+2
                lightsActive = string[indLightsActice:indLightsActice+1]
                animationId = string[indAnimation: indAnimation+1] 
                return f"{count}:l-{lightsActive}/a-{animationId}"
              else:
                return f"{count}:success-false"

          except:
            return f"{count}:success-false"
        
        # [ ] Set Color
        elif command == 'l' and action[:input.find('-')] == 'c': #     Set Color                 *****            #--------- 
          print( f'(Python) Incomplete: {input}', flush=True)
          return f"{count}:success-false"
             
        elif command == 'i' and action == 'r': #                       Read Signal            *****
          try:
            with SMBus(1) as bus:
              t = bytes("newIr", "utf-8")

              bus.write_i2c_block_data(slave_bedroom_nano, 0, t)
              block = bus.read_i2c_block_data(slave_bedroom_nano, 0, 10)

              # string = ''.join(chr(x) for x in block)
              # if(string == "success"):
              #    return f"{count}:success-true"
              # else:
              #   return f"{count}:success-false"

              return f"{count}:success-true"

              
          except RuntimeError as err:
             return f"{count}:success-false"
          
        elif command == 'i' and action == 'x': #                       Report Signal            *****
          try:
            with SMBus(1) as bus:
              t = bytes("getIr", "utf-8")

              bus.write_i2c_block_data(slave_bedroom_nano, 0, t)
              block = bus.read_i2c_block_data(slave_bedroom_nano, 0, 10)

              return f"{count}:x-{block[0]}"
          except RuntimeError as err:
             return f"{count}:success-false"

        elif command == 'i' and action[:input.find('-')] == 'c': #     Send Ir Command           *****
          try:
            with SMBus(1) as bus:
              t = bytes("sendCommand", "utf-8")

              bus.write_i2c_block_data(slave_bedroom_nano, 0, t)
              block = bus.read_i2c_block_data(slave_bedroom_nano, 0, 10)

              return f"{count}:success-true"
            
          except RuntimeError as err:
             return f"{count}:success-false"
        
        else:
           print( f'(Python) Out of bounds: {input}', flush=True)
           return f"{count}:success-false"
        


    while True:
        inp = sys.stdin.readline()

# Command - Quit
        if inp.strip() == 'q':
            print('* quitting-',flush=True)
            break
# Command - Error, no string
        elif bool(inp.strip()) == False:
            break
# Command - Test
        elif inp.strip() == 't':
            with SMBus(1) as bus: 
              block = bus.read_i2c_block_data(slave_nano_addr, 0, 16)
              string = ''.join(chr(x) for x in block)
              print(string[:string.index(']')+1],flush=True)
              # trimmed = string[:string.find("]")+1]
# Command Received
        else:
            print(f'{process_input(inp)}',flush=True)


except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0], flush=True)

finally:
    print(" ")
    print("-------   Script Terminated    -------")
    print(" ", flush=True)