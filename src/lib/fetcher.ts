/**
 * Function for SWR's useSWR function. Accepts JSON as generic parameter that you
 * expect to be returned, if not passed it will be set to any.
 * @param input RequestInfo
 * @param init RequestInit
 * @param args Other parameters SWR might pass. These are ignored if passed.
 * @returns
 */
export const fetcher = async <JSON = any>(
  input: RequestInfo,
  init: RequestInit,
  ...args: any[]
): Promise<JSON> => {
  const res = await fetch(input, init);
  return res.json();
};
