import * as url from "url";

const config = {
  PORT: 8080,
  DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
  SERVER: "ecommerce",
  get UPLOAD_DIR() {
    return `${this.DIRNAME}/public/img`;
  },
  MONGO_URL: "mongodb+srv://rmnew-ricar_21:NXoiPQH1WhFENExM@ricardo21.psjk541.mongodb.net/Ecommerce",
  SECRET: "113287484745753643170604",
};

export default config;
