import type { MappingField, MappingSource } from "@/store/editorStore";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function safeId(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "field";
}

function inferType(value: JsonValue): MappingField["type"] {
  if (Array.isArray(value)) return "array";
  if (value === null) return "unknown";
  if (typeof value === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "unknown";
}

function sampleLabel(value: JsonValue): string {
  if (Array.isArray(value)) return `${value.length} rows`;
  if (value === null || typeof value === "object") return "{...}";
  return String(value).slice(0, 32);
}

export interface ParsedSourceWithData {
  source: MappingSource;
  rawData: Record<string, unknown>;
}

export async function parseJsonFileToSourceWithData(file: File): Promise<ParsedSourceWithData | null> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    return null;
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) return null;

  const rawData: Record<string, unknown> = {};
  const fields: MappingField[] = [];

  Object.entries(json as Record<string, JsonValue>).forEach(([key, value]) => {
    const id = safeId(key);
    fields.push({ id, name: key, path: key, type: inferType(value), sample: sampleLabel(value) });
    rawData[id] = value;
  });

  const sourceId = `${safeId(file.name)}-${Math.random().toString(36).slice(2, 7)}`;

  const source: MappingSource = {
    id: sourceId,
    name: file.name,
    kind: "file",
    description: "드롭한 JSON 데이터 파일",
    fileCount: 1,
    fields,
    createdAt: Date.now(),
  };

  return { source, rawData };
}
