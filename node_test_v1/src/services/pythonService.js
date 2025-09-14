const { spawn } = require("child_process");
const path = require("path");

function runCreateGeemap(moduleId) {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(process.cwd(), "../.venv/bin/python3");
    const scriptPath = path.join(process.cwd(), "geemap_scripts", "create_geemap.py");

    const processPy = spawn(pythonPath, [scriptPath, moduleId], {
      stdio: ["inherit", "pipe", "pipe"],
    });

    let output = "";
    let error = "";

    processPy.stdout.on("data", (data) => {
      process.stdout.write(`[PYTHON] ${data}`);
      output += data.toString();
    });

    processPy.stderr.on("data", (data) => {
      process.stderr.write(`[PYTHON-ERR] ${data}`);
      error += data.toString();
    });

    processPy.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(error || `Python exited with code ${code}`);
    });
  });
}

module.exports = { runCreateGeemap };

