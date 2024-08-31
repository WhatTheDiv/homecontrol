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
    const data = await response.json();

    console.log(data);
    if (!data.commands)
      throw new Error('Did not return any commands')

    dispatch(addCommands({ commands: data.commands }))

    return data.success
  } catch (e) {
    return false
  }
}