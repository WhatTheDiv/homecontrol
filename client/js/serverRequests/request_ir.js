import { addCommands, setLastCommand } from '../store/ir_slice'

export async function requestIr_learn({ source, command }, dispatch) {
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ learn: true, source, command }),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/epsIr_learn`,
      options
    );

    console.log(response);
    const { success, ir } = await response.json();

    console.log({ success, ir });
    if (ir.commands.length < 1)
      throw new Error('Did not return any commands')

    dispatch(addCommands({ commands: ir.commands }))
    dispatch(setLastCommand({ lastCommand: ir.lastCommand }))
    console.log(`%cSuccessfully created command: `)
    console.log(ir)

    return success
  } catch (e) {
    return false
  }
}

export async function requestIr_emit(command, dispatch) {
  console.log('checkpoint')
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: command.source, commandName: command.name }),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/epsIr_emit`,
      options
    );

    const { success, error, ir } = await response.json();

    dispatch(setLastCommand({ lastCommand: command }))

    return success
  } catch (e) {
    console.error('Failed to emit ir: ', e.message)
    return false
  }
}