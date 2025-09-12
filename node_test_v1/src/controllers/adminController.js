

const { spawn } = require("child_process");
const path = require("path");

exports.getAdministration = (req, res) => res.render("administration", { error: null });

exports.postAdministration = (req, res) => {
  const userInput = req.body.pataIn;

  const py = spawn("python3", ["geemap_scripts/create_geemap.py"]);
  let result = "";

  py.stdout.on("data", (data) => {
    result += data.toString();
    console.log(result);
  });

  py.stderr.on("data", (data) => console.error(`stderr: ${data}`));

  py.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    res.send(`<pre>${result}</pre>`);
  });

  py.stdin.write(userInput);
  py.stdin.end();
};

