const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "node_modules");

const ignoreErrors = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            ignoreErrors(fullPath);
        } else if (file.endsWith(".d.ts")) {
            const content = fs.readFileSync(fullPath, "utf-8");
            const newContent = `// @ts-nocheck\n${content}`;
            fs.writeFileSync(fullPath, newContent);
        }
    }
};

ignoreErrors(basePath);
