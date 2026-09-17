// index.yaml editing. Every regex here is anchored on `\n`, and a Windows checkout hands us `\r\n` —
// so every function normalises before matching and restores the file's own ending before writing.
//
// Skipping that is not a cosmetic bug. It silently returns "" for a name that IS set, which makes
// `identityIsPlaceholder` true, which makes `setProductIdentity` return early: the installer reports
// nothing and writes nothing, on every CRLF repo. Found 2026-08-18 on the first real install into a
// Windows product repo, where `policy.doc_language` printed empty while the file plainly said `id`.

// FREE TEXT, not an enum. The consumer is a model, and a model does not need a list: "English",
// "Bahasa Indonesia", "id", "Indonesia" all read the same to it. Fencing this into two values would
// force the owner to translate their intent into the installer's vocabulary first, and nothing is
// bought with that.
export const DEFAULT_DOC_LANGUAGE = "English";

/** LF view of the text, plus how to put the original endings back. */
function lf(text) {
  const crlf = text.includes("\r\n");
  return { body: crlf ? text.replaceAll("\r\n", "\n") : text, crlf };
}

function restore(body, crlf) {
  return crlf ? body.replaceAll("\n", "\r\n") : body;
}

export function yamlQuote(value) {
  return `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

/**
 * Generic block-level key upsert that preserves comments, indentations, and existing sibling keys.
 */
export function upsertBlockKeys(body, blockName, pairs) {
  const entries = Array.isArray(pairs) ? pairs : Object.entries(pairs);
  const validEntries = entries.filter(([_, v]) => v !== undefined);
  if (validEntries.length === 0) {
    return body;
  }

  const lines = body.split("\n");
  // Header must start at column 0 to prevent matching nested keys
  const headerRegex = new RegExp(`^${blockName}:[ \\t]*(?:#.*)?$`);
  const headerIndex = lines.findIndex((l) => headerRegex.test(l));

  if (headerIndex === -1) {
    const blockContent = validEntries.map(([k, v]) => `  ${k}: ${v}`).join("\n");
    const newBlockLines = [`${blockName}:`, ...validEntries.map(([k, v]) => `  ${k}: ${v}`)];

    // If adding policy and product exists, place policy right after product block
    if (blockName === "policy") {
      const productHeaderRegex = /^product:[ \t]*(?:#.*)?$/;
      const productHeaderIndex = lines.findIndex((l) => productHeaderRegex.test(l));
      if (productHeaderIndex !== -1) {
        let nextIndex = lines.length;
        for (let i = productHeaderIndex + 1; i < lines.length; i++) {
          if (/^[a-zA-Z0-9_-]+:|^---/.test(lines[i])) {
            nextIndex = i;
            break;
          }
        }
        let lastIndented = productHeaderIndex;
        for (let i = nextIndex - 1; i > productHeaderIndex; i--) {
          if (/^\s/.test(lines[i])) {
            lastIndented = i;
            break;
          }
        }
        if (lines[lastIndented + 1] === "") {
          const insertLines = nextIndex < lines.length ? [...newBlockLines, ""] : newBlockLines;
          lines.splice(lastIndented + 2, 0, ...insertLines);
        } else {
          const insertLines = nextIndex < lines.length ? ["", ...newBlockLines, ""] : ["", ...newBlockLines];
          lines.splice(lastIndented + 1, 0, ...insertLines);
        }
        return lines.join("\n");
      }
    }

    const cleanBody = body.replace(/^\uFEFF/, "");
    return cleanBody ? `${blockName}:\n${blockContent}\n\n${cleanBody}` : `${blockName}:\n${blockContent}\n`;
  }

  // End of block is reached at the next top-level mapping key or document separator
  let nextBlockIndex = lines.length;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    if (/^[a-zA-Z0-9_-]+:|^---/.test(lines[i])) {
      nextBlockIndex = i;
      break;
    }
  }

  let lastIndentedIndex = headerIndex;
  for (let i = nextBlockIndex - 1; i > headerIndex; i--) {
    if (/^\s/.test(lines[i])) {
      lastIndentedIndex = i;
      break;
    }
  }

  const toAppend = [];
  for (const [key, value] of validEntries) {
    // Only match direct children at 2 spaces indentation
    const keyRegex = new RegExp(`^  ${key}:[ \\t]*`);
    let foundIndex = -1;
    for (let i = headerIndex + 1; i < nextBlockIndex; i++) {
      if (keyRegex.test(lines[i])) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      // Preserve any trailing inline comment
      const commentMatch = lines[foundIndex].match(/(?:[ \t]+#.*)$/);
      const inlineComment = commentMatch ? commentMatch[0] : "";
      lines[foundIndex] = `  ${key}: ${value}${inlineComment}`;
    } else {
      toAppend.push(`  ${key}: ${value}`);
    }
  }

  if (toAppend.length > 0) {
    lines.splice(lastIndentedIndex + 1, 0, ...toAppend);
  }

  return lines.join("\n");
}

function readBlockValue(body, blockName, key) {
  const lines = body.split("\n");
  const headerRegex = new RegExp(`^${blockName}:[ \\t]*(?:#.*)?$`);
  const headerIndex = lines.findIndex((l) => headerRegex.test(l));
  if (headerIndex === -1) return "";

  let nextBlockIndex = lines.length;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    if (/^[a-zA-Z0-9_-]+:|^---/.test(lines[i])) {
      nextBlockIndex = i;
      break;
    }
  }

  const quotedRegex = new RegExp(`^  ${key}:[ \\t]*"((?:[^"\\\\]|\\\\.)*)"`);
  const bareRegex = new RegExp(`^  ${key}:[ \\t]*([^\\n#]*)`);

  for (let i = headerIndex + 1; i < nextBlockIndex; i++) {
    const quoted = lines[i].match(quotedRegex);
    if (quoted) {
      return quoted[1].replaceAll('\\"', '"').replaceAll('\\\\', '\\').trim();
    }
    const bare = lines[i].match(bareRegex);
    if (bare) return bare[1].trim();
  }
  return "";
}

export function readProductIdentity(text) {
  const { body } = lf(text);
  return {
    name: readBlockValue(body, "product", "name"),
    client: readBlockValue(body, "product", "client"),
  };
}

export function writeProductIdentity(text, { name, client }) {
  const { body, crlf } = lf(text);
  const pairs = [
    ["name", yamlQuote(name)],
    ["client", yamlQuote(client ?? "")],
  ];
  const nextBody = upsertBlockKeys(body, "product", pairs);
  return restore(nextBody, crlf);
}

export function identityIsPlaceholder(name) {
  return !name || name === "{product}";
}

// ---------------------------------------------------------------------- policy (language & branches)
//
// Language settings:
//   doc_language           the PROSE of working documents in .what/ .how/ .control/
//   doc_filename_language  the SLUG part of a document filename
//
// Branch settings:
//   primary_branch         trunk / production branch (defaults to "main")
//   development_branch     active development branch (defaults to "main")

function readPolicyValue(body, key) {
  return readBlockValue(body, "policy", key);
}

export function readLanguagePolicy(text) {
  const { body } = lf(text);
  return {
    docLanguage: readPolicyValue(body, "doc_language"),
    docFilenameLanguage: readPolicyValue(body, "doc_filename_language"),
  };
}

export function writeLanguagePolicy(text, { docLanguage, docFilenameLanguage }) {
  const { body, crlf } = lf(text);
  const pairs = [];
  if (docLanguage !== undefined) pairs.push(["doc_language", yamlQuote(docLanguage)]);
  if (docFilenameLanguage !== undefined) pairs.push(["doc_filename_language", yamlQuote(docFilenameLanguage)]);
  const nextBody = upsertBlockKeys(body, "policy", pairs);
  return restore(nextBody, crlf);
}

export function readBranchPolicy(text) {
  const { body } = lf(text);
  const primary = readPolicyValue(body, "primary_branch");
  const development = readPolicyValue(body, "development_branch");
  return {
    primaryBranch: primary || "main",
    developmentBranch: development || "main",
  };
}

export function writeBranchPolicy(text, { primaryBranch, developmentBranch }) {
  const { body, crlf } = lf(text);
  const pairs = [];
  if (primaryBranch !== undefined) pairs.push(["primary_branch", yamlQuote(primaryBranch)]);
  if (developmentBranch !== undefined) pairs.push(["development_branch", yamlQuote(developmentBranch)]);
  const nextBody = upsertBlockKeys(body, "policy", pairs);
  return restore(nextBody, crlf);
}

// A first install has nowhere to read a product name from, so the folder is the best guess available —
// and a guess the owner can accept with Enter beats a field they must type. `acme-billing-portal`
// becomes `Acme Billing Portal`; camelCase splits too. It is a SUGGESTION: G1 confirms the real name.
export function humaniseFolderName(name) {
  return String(name || "")
    .replace(/[._-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => (w === w.toUpperCase() && w.length <= 4 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
