import { f_err } from '../../assets/styles/globalStyles';
import { addCommands, setLastCommand } from '../store/ir_slice'



export async function requestIr_learn({ source, commandName }, dispatch) {
  try {
    console.log(`At request, learning command (${commandName}) with source (${source})`)
    if (commandName === undefined || source === undefined) {
      throw new Error('malformed request')
    }
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, commandName }),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/epsIr_learn`,
      options
    );

    const { success, ir, error } = await response.json();


    if (!success)
      throw new Error(error ? error : "Bad response from server")
    else if (ir.commands.length < 1)
      throw new Error('Did not return any commands')

    dispatch(addCommands({ commands: ir.commands }))
    dispatch(setLastCommand({ lastCommand: ir.lastCommand }))

    console.log(`Successfully created command: `)
    console.log({ ir })

    return success
  } catch (e) {
    console.log(`%cError at request: ${e.message}`, f_err)
    return false
  }
}

export async function requestIr_emit({ source, commandName }) {
  const status = { success: false, error: '' }
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, commandName }),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/epsIr_emit`,
      options
    );

    const { success, error } = await response.json();
    status.success = success
    status.error = error

  } catch (e) {
    status.error = `At request: ${e.message}`
    status.success = false
    console.error(e)
  }

  return status
}

export async function requestIr_custom({ source, code }) {
  try {
    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/epsIr_test`
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, code }),
    };

    const response = await fetch(url, options);

    return await response.json();

  } catch (e) {
    return {
      success: false, error: `Error in request: ${e.message}`
    }
  }
}