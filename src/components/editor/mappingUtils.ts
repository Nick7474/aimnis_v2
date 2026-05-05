import type { DragEvent } from "react";
import type { MappingField, MappingSource } from "@/store/editorStore";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type FileSystemEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
};

type FileSystemFileEntry = FileSystemEntry & {
  file: (success: (file: File) => void, error?: (err: DOMException) => void) => void;
};

type FileSystemDirectoryEntry = FileSystemEntry & {
  createReader: () => {
    readEntries: (
      success: (entries: FileSystemEntry[]) => void,
      error?: (err: DOMException) => void
    ) => void;
  };
};

type WebkitDataTransferItem = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemEntry | null;
};

const MAX_FIELDS = 32;

const METHOD_RE = /\b(get|post|put|patch|delete)\b/i;
const PATH_RE = /(\/[a-zA-Z0-9_{}:./-]+)/;

export const DEMO_FIELDS: Record<string, MappingField[]> = {
  "energy-sensor": [
    field("currentKw", "currentKw", "number", "247"),
    field("peakKw", "peakKw", "number", "312"),
    field("dailyKwh", "dailyKwh", "number", "1580"),
    field("timeSeries", "timeSeries", "array", "24 points"),
    field("voltage", "voltage", "number", "380"),
    field("current", "current", "number", "48"),
  ],
  cctv: [
    field("locations", "locations", "array", "42 cameras"),
    field("activeCameras", "activeCameras", "number", "39"),
    field("alertCameras", "alertCameras", "array", "3 alerts"),
    field("cameraId", "cameraId", "string", "CAM-042"),
    field("status", "status", "string", "online"),
  ],
  "air-quality": [
    field("pm25", "pm25", "number", "35"),
    field("pm10", "pm10", "number", "48"),
    field("co2", "co2", "number", "420"),
    field("temperature", "temperature", "number", "23.8"),
    field("humidity", "humidity", "number", "47"),
  ],
  "worker-safety": [
    field("onSite", "onSite", "number", "128"),
    field("helmetCompliance", "helmetCompliance", "number", "97"),
    field("recentAlerts", "recentAlerts", "array", "8 events"),
    field("workerId", "workerId", "string", "WK-1281"),
    field("zone", "zone", "string", "Zone-A"),
  ],
};

export function buildDemoSource(connectorId: string): MappingSource {
  return {
    id: connectorId,
    name: connectorLabel(connectorId),
    kind: "demo",
    description: "사전 연결된 고객사 데모 데이터",
    fields: DEMO_FIELDS[connectorId] ?? [field("value", "value", "unknown")],
    createdAt: 0,
  };
}

export function buildApiSource(endpoint: string): MappingSource {
  const trimmed = endpoint.trim();
  const methodMatch = trimmed.match(METHOD_RE);
  const method = ((methodMatch?.[1] ?? "GET").toUpperCase() as MappingSource["method"]);
  const path = trimmed.match(PATH_RE)?.[1] ?? trimmed;
  const id = uniqueId(`api-${method}-${path}`);

  return {
    id,
    name: `${method} ${path}`,
    kind: "api",
    method,
    endpoint: path,
    description: "직접 입력한 API 엔드포인트",
    fields: [
      field("status", "response.status", "number", "200"),
      field("items", "response.body.items", "array", "12 rows"),
      field("id", "response.body.id", "string", "evt-001"),
      field("value", "response.body.value", "number", "247"),
      field("createdAt", "response.body.createdAt", "string", "2026-04-29T00:00:00"),
    ],
    createdAt: Date.now(),
  };
}

export async function extractFilesFromDrop(event: DragEvent): Promise<File[]> {
  const itemList = Array.from(event.dataTransfer.items ?? []) as WebkitDataTransferItem[];
  const entries = itemList.map((item) => item.webkitGetAsEntry?.()).filter(Boolean) as FileSystemEntry[];

  if (entries.length === 0) {
    return Array.from(event.dataTransfer.files ?? []);
  }

  const nested = await Promise.all(entries.map(readEntry));
  return nested.flat();
}

export async function parseFilesToSources(files: File[]): Promise<MappingSource[]> {
  const supported = files.filter((file) => /\.(json|ya?ml|txt)$/i.test(file.name));
  const byFolder = groupByFolder(supported);

  const sources: MappingSource[] = [];
  for (const [folderName, folderFiles] of Array.from(byFolder.entries())) {
    if (folderFiles.length > 1) {
      sources.push(await parseFolder(folderName, folderFiles));
    } else if (folderFiles[0]) {
      sources.push(...await parseSingleFile(folderFiles[0]));
    }
  }

  return sources.slice(0, 6);
}

async function parseFolder(folderName: string, files: File[]): Promise<MappingSource> {
  const allFields: MappingField[] = [];
  for (const file of files.slice(0, 8)) {
    const parsed = await parseSingleFile(file);
    parsed.forEach((source) => {
      source.fields.slice(0, 6).forEach((item) => {
        allFields.push({
          ...item,
          id: uniqueId(`${file.name}-${item.path}`),
          name: `${file.name}:${item.name}`,
          path: `${file.name}.${item.path}`,
        });
      });
    });
  }

  return {
    id: uniqueId(`folder-${folderName}`),
    name: folderName,
    kind: "folder",
    description: "드롭한 폴더에서 추출한 통합 스키마",
    fileCount: files.length,
    fields: allFields.slice(0, MAX_FIELDS),
    createdAt: Date.now(),
  };
}

async function parseSingleFile(file: File): Promise<MappingSource[]> {
  const text = await file.text();
  const base = {
    id: uniqueId(file.name),
    name: file.name,
    kind: "file" as const,
    description: "드롭한 API/JSON 파일",
    fileCount: 1,
    createdAt: Date.now(),
  };

  try {
    const json = JSON.parse(text) as JsonValue;
    const openApiSources = parseOpenApi(file.name, json);
    if (openApiSources.length > 0) return openApiSources;

    return [{
      ...base,
      fields: flattenJson(json).slice(0, MAX_FIELDS),
    }];
  } catch {
    return [{
      ...base,
      fields: parseLooseText(text).slice(0, MAX_FIELDS),
    }];
  }
}

function parseOpenApi(fileName: string, value: JsonValue): MappingSource[] {
  if (!isRecord(value) || !isRecord(value.paths)) return [];

  const sources: MappingSource[] = [];
  Object.entries(value.paths).forEach(([path, pathItem]) => {
    if (!isRecord(pathItem)) return;

    Object.entries(pathItem).forEach(([methodKey, operation]) => {
      const method = methodKey.toUpperCase();
      if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method) || !isRecord(operation)) return;

      const responseSchema = pickSchema(operation);
      const fields = responseSchema ? flattenJson(schemaToSample(responseSchema)) : [];
      sources.push({
        id: uniqueId(`${fileName}-${method}-${path}`),
        name: `${method} ${path}`,
        kind: "api",
        method: method as MappingSource["method"],
        endpoint: path,
        description: typeof operation.summary === "string" ? operation.summary : "OpenAPI 응답 스키마",
        fields: fields.length > 0 ? fields.slice(0, MAX_FIELDS) : [
          field("status", "response.status", "number", "200"),
          field("body", "response.body", "object", "{}"),
        ],
        createdAt: Date.now(),
      });
    });
  });

  return sources.slice(0, 5);
}

function pickSchema(operation: Record<string, JsonValue>): JsonValue | null {
  const responses = operation.responses;
  if (!isRecord(responses)) return null;
  const ok = responses["200"] ?? responses["201"] ?? Object.values(responses)[0];
  if (!isRecord(ok) || !isRecord(ok.content)) return null;
  const jsonContent = ok.content["application/json"] ?? Object.values(ok.content)[0];
  if (!isRecord(jsonContent)) return null;
  return jsonContent.schema ?? null;
}

function schemaToSample(schema: JsonValue): JsonValue {
  if (!isRecord(schema)) return "value";

  const type = typeof schema.type === "string" ? schema.type : undefined;
  if (type === "array") return [schemaToSample(schema.items ?? {})];
  if (type === "object" || isRecord(schema.properties)) {
    const output: Record<string, JsonValue> = {};
    if (isRecord(schema.properties)) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        output[key] = schemaToSample(prop);
      });
    }
    return output;
  }
  if (type === "number" || type === "integer") return 247;
  if (type === "boolean") return true;
  return "sample";
}

function flattenJson(value: JsonValue, prefix = ""): MappingField[] {
  if (Array.isArray(value)) {
    const sample = value[0];
    const current = prefix ? [field(prefix, prefix, "array", `${value.length} rows`)] : [];
    return [...current, ...flattenJson(sample ?? {}, prefix ? `${prefix}[]` : "items")];
  }

  if (isRecord(value)) {
    const rows: MappingField[] = [];
    Object.entries(value).forEach(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      const type = inferType(child);
      rows.push(field(path, path, type, sampleValue(child)));
      if ((type === "object" || type === "array") && rows.length < MAX_FIELDS) {
        rows.push(...flattenJson(child, path));
      }
    });
    return rows;
  }

  return prefix ? [field(prefix, prefix, inferType(value), sampleValue(value))] : [];
}

function parseLooseText(text: string): MappingField[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fields: MappingField[] = [];

  lines.forEach((line) => {
    const method = line.match(METHOD_RE)?.[1]?.toUpperCase();
    const path = line.match(PATH_RE)?.[1];
    if (method && path) {
      fields.push(field(`${method} ${path}`, `${method.toLowerCase()}.${path.replaceAll("/", ".")}`, "object", "endpoint"));
      return;
    }

    const pair = line.match(/^["']?([a-zA-Z0-9_-]+)["']?\s*[:=]\s*(.+)$/);
    if (pair) {
      fields.push(field(pair[1], pair[1], inferScalarType(pair[2]), pair[2].slice(0, 32)));
    }
  });

  return fields.length > 0 ? fields : [
    field("raw", "raw", "string", text.slice(0, 32)),
  ];
}

function readEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve, reject) => {
      (entry as FileSystemFileEntry).file((file) => resolve([file]), reject);
    });
  }

  if (entry.isDirectory) {
    const directory = entry as FileSystemDirectoryEntry;
    const reader = directory.createReader();
    return new Promise((resolve, reject) => {
      reader.readEntries(async (entries) => {
        try {
          const nested = await Promise.all(entries.map(readEntry));
          resolve(nested.flat());
        } catch (err) {
          reject(err);
        }
      }, reject);
    });
  }

  return Promise.resolve([]);
}

function groupByFolder(files: File[]): Map<string, File[]> {
  const map = new Map<string, File[]>();
  files.forEach((file) => {
    const relative = "webkitRelativePath" in file ? file.webkitRelativePath : "";
    const folder = relative ? relative.split("/")[0] : file.name;
    map.set(folder, [...(map.get(folder) ?? []), file]);
  });
  return map;
}

function field(name: string, path: string, type: MappingField["type"], sample?: string): MappingField {
  return {
    id: safeId(path),
    name: shortName(name),
    path,
    type,
    sample,
  };
}

function connectorLabel(connectorId: string) {
  const labels: Record<string, string> = {
    "energy-sensor": "posco-energy-meter-realtime.json",
    cctv: "hanwha-vms-cctv-stream-snapshot.json",
    "air-quality": "factory-air-quality-sensor-feed.json",
    "worker-safety": "worker-safety-compliance-events.json",
  };
  return labels[connectorId] ?? connectorId;
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

function inferScalarType(value: string): MappingField["type"] {
  if (/^(true|false)$/i.test(value)) return "boolean";
  if (!Number.isNaN(Number(value))) return "number";
  if (/^\[/.test(value)) return "array";
  if (/^\{/.test(value)) return "object";
  return "string";
}

function sampleValue(value: JsonValue): string | undefined {
  if (value === null || typeof value === "undefined") return undefined;
  if (Array.isArray(value)) return `${value.length} rows`;
  if (typeof value === "object") return "{...}";
  return String(value).slice(0, 32);
}

function shortName(name: string) {
  const parts = name.replace(/\[\]/g, "").split(".");
  return parts[parts.length - 1] || name;
}

function uniqueId(input: string) {
  const clean = safeId(input).slice(0, 48);
  return `${clean || "source"}-${Math.random().toString(36).slice(2, 7)}`;
}

function safeId(input: string) {
  const clean = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return clean || "field";
}

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
