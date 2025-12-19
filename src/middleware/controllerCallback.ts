const controllerCallback = async <I, R>(
  actionHandler: (arg: I, ctx?: unknown) => Promise<R>,
  args: I,
  ctx?: unknown
): Promise<R> => {
  try {
    return await actionHandler(args, ctx);
  } catch (error) {
    return error;
  }
};

export default controllerCallback;
