import { note_ops } from "./scripts/note_app";

(async function () {
    note_ops()
    .then(() => {
      console.log("Finished successfully");
    })
    .catch((error) => {
      console.error(error);
    });
})();
