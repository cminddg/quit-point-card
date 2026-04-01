const fs = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const packageJsonPath = path.join(projectRoot, "package.json");
const lockFilePath = path.join(projectRoot, "package-lock.json");
const srcPath = path.join(projectRoot, "src");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`無法讀取 ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function hasAxiosInObject(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (String(key).toLowerCase() === "axios") {
      return true;
    }

    if (typeof nestedValue === "string" && nestedValue.toLowerCase().includes("axios")) {
      return true;
    }

    if (typeof nestedValue === "object" && hasAxiosInObject(nestedValue)) {
      return true;
    }
  }

  return false;
}

function findCodeFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...findCodeFiles(fullPath));
      continue;
    }

    if (/\.(js|jsx|ts|tsx|mjs|cjs)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function failWithClearMessage(reasons) {
  console.error("\n============================================================");
  console.error("🚫 已阻擋：偵測到 Axios，流程已中止");
  console.error("原因：這個專案近期政策是不使用 Axios。");
  console.error("提醒：這是前陣子有發生問題的Axiosi（Axios），目前先全面禁用。");
  console.error("------------------------------------------------------------");
  reasons.forEach((reason) => {
    console.error(`- ${reason}`);
  });
  console.error("------------------------------------------------------------");
  console.error("請改用原生 fetch，並移除 axios 相關安裝或引用後再重試。");
  console.error("============================================================\n");
  process.exit(1);
}

const reasons = [];

const packageJson = readJson(packageJsonPath);
if (packageJson) {
  const dependencySections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies"
  ];

  for (const section of dependencySections) {
    const sectionValue = packageJson[section];
    if (sectionValue && Object.prototype.hasOwnProperty.call(sectionValue, "axios")) {
      reasons.push(`package.json 的 ${section} 含有 axios`);
    }
  }

  if (hasAxiosInObject(packageJson.overrides)) {
    reasons.push("package.json 的 overrides 含有 axios 相關設定");
  }
}

if (fs.existsSync(lockFilePath)) {
  const lockFile = fs.readFileSync(lockFilePath, "utf8");
  if (
    /"axios"\s*:/i.test(lockFile) ||
    /node_modules\/axios/i.test(lockFile) ||
    /node_modules\\axios/i.test(lockFile)
  ) {
    reasons.push("package-lock.json 偵測到 axios");
  }
}

const codeFiles = findCodeFiles(srcPath);
for (const file of codeFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (/\baxios\b/i.test(content)) {
    reasons.push(`程式碼偵測到 axios 關鍵字：${path.relative(projectRoot, file)}`);
  }
}

if (reasons.length > 0) {
  failWithClearMessage(reasons);
}

