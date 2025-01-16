const yargs = require("yargs");
const argv = yargs.option("name", {
  alias: "n",
  description: "The name of the person",
  type: "string",
  demandOption: true,
}).argv;

console.log(argv.name);
