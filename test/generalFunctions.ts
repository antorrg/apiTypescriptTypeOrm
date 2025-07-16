import { throwError } from '../src/Configs/errorHandlers.js'

interface DeleteResult {
  success: true
  message: string
}
export async function mockDeleteFunction (url: string, result: boolean): Promise<DeleteResult> {
  if (result) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      success: true,
      message: `ImageUrl ${url} deleted succesfully`
    }
  } else {
    await new Promise(reject => setTimeout(reject, 1500))
    throwError(`Error processing ImageUrl ${url}`, 500)
    throw new Error()
  }
}
export const deletFunctionTrue = async (url: string, _result?: boolean): Promise<DeleteResult> => {
  // console.log('probando deleteFunction: ', url);
  return {
    success: true,
    message: `ImageUrl ${url} deleted succesfully`
  }
}
export const deletFunctionFalse = async (url: string, _result?: boolean): Promise<never> => {
  // console.log('probando deleteErrorFunction: ', url);
  throwError(`Error processing ImageUrl: ${url}`, 500)
  throw new Error()
}
