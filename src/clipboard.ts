// clipboard.ts
const clipboard = {
  install: (app: any) => {
    app.config.globalProperties.$copyToClipboard = (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
          reject('Clipboard API not available');
          return;
        }

        navigator.clipboard.writeText(text).then(
            () => resolve(),
            (err) => reject(err)
        );
      });
    };
  },
};

export default clipboard;