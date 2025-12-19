const setHttpPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        console.log(response.body.singleResult.errors?.[0].code);
        if (
          response.body.kind === 'single' &&
          response.body.singleResult.errors?.[0]?.code ===
            'INTERNAL_SERVER_ERROR'
        ) {
          response.http.status = 400;
        }
      },
    };
  },
};

export default setHttpPlugin;
