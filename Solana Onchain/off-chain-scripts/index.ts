import { hello_world } from "./scripts/hello_world";

(async function () {
  hello_world()
    .then(() => {
      console.log("Finished successfully");
    })
    .catch((error) => {
      console.error(error);
    });
})();
