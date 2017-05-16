export default (ctx) => {
  return {
    init() {
      this.components = require('./components').default(ctx);
      this.socials = require('./socials').default;// (ctx);
      // this.models = require('./models').default(ctx);
      this.stores = require('./mobx').default(ctx);
      this.router = require('./router').default;
    },
  };
};
