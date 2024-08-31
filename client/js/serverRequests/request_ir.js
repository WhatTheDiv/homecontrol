import { addCommands, setLastCommand } from '../store/ir_slice'

export async function requestIr({ source, command }, dispatch) {
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ learn: true, source, command }),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/epsIr`,
      options
    );

    console.log(response);
    const { success, ir } = await response.json();

    console.log({ success, ir });
    if (ir.commands.length < 1)
      throw new Error('Did not return any commands')

    dispatch(addCommands({ commands: ir.commands }))
    dispatch(setLastCommand({ lastCommand: ir.lastCommand }))

    return success
  } catch (e) {
    return false
  }
}