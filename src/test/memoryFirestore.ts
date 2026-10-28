/**
 * In-memory Firestore stand-in for route tests. Transactions buffer writes
 * and commit only when the callback resolves, and they run one at a time so
 * overlapping charges see each other's results.
 */

type DocData = Record<string, unknown>;

interface Snap {
  exists: boolean;
  id: string;
  ref: DocRef;
  data: () => DocData | undefined;
}

interface DocRef {
  path: string;
  id: string;
  get: () => Promise<Snap>;
  set: (data: DocData) => Promise<void>;
  update: (data: DocData) => Promise<void>;
  delete: () => Promise<void>;
}

interface PendingWrite {
  type: "set" | "delete";
  data?: DocData;
}

export function createMemoryFirestore() {
  const docs = new Map<string, DocData>();
  let chain: Promise<unknown> = Promise.resolve();
  let sequence = 0;

  const read = (path: string, overlay?: Map<string, PendingWrite>): Snap => {
    const pending = overlay?.get(path);
    const id = path.split("/").pop() ?? path;
    if (pending?.type === "delete") {
      return { exists: false, id, ref: ref(path), data: () => undefined };
    }
    const data = pending?.type === "set" ? pending.data : docs.get(path);
    return {
      exists: data !== undefined,
      id,
      ref: ref(path),
      data: () => (data ? { ...data } : undefined),
    };
  };

  const ref = (path: string): DocRef => ({
    path,
    id: path.split("/").pop() ?? path,
    async get() {
      return read(path);
    },
    async set(data: DocData) {
      docs.set(path, { ...data });
    },
    async update(data: DocData) {
      const current = docs.get(path);
      if (!current) throw new Error(`No document to update at ${path}`);
      docs.set(path, { ...current, ...data });
    },
    async delete() {
      docs.delete(path);
    },
  });

  const adminDb = {
    doc: ref,
    collection(path: string) {
      const children = () =>
        [...docs.keys()]
          .filter((key) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes("/"))
          .map((key) => read(key));
      return {
        doc(id?: string) {
          return ref(`${path}/${id ?? `gen-${++sequence}`}`);
        },
        async get() {
          return { docs: children() };
        },
        orderBy(field: string, direction: "asc" | "desc" = "asc") {
          const sortKey = (data: DocData) => {
            const value = data[field] as { toMillis?: () => number } | number | undefined;
            return typeof value === "object" && value?.toMillis ? value.toMillis() : Number(value ?? 0);
          };
          return {
            async get() {
              const docsInCollection = children().sort(
                (a, b) => sortKey(a.data()!) - sortKey(b.data()!)
              );
              if (direction === "desc") docsInCollection.reverse();
              return { docs: docsInCollection };
            },
          };
        },
      };
    },
    async runTransaction<T>(fn: (tx: {
      get: (target: DocRef) => Promise<Snap>;
      set: (target: DocRef, data: DocData) => void;
      update: (target: DocRef, data: DocData) => void;
      delete: (target: DocRef) => void;
    }) => Promise<T>): Promise<T> {
      const run = chain.then(async () => {
        const overlay = new Map<string, PendingWrite>();
        const result = await fn({
          async get(target) {
            return read(target.path, overlay);
          },
          set(target, data) {
            overlay.set(target.path, { type: "set", data: { ...data } });
          },
          update(target, data) {
            const base = overlay.get(target.path)?.data ?? docs.get(target.path) ?? {};
            overlay.set(target.path, { type: "set", data: { ...base, ...data } });
          },
          delete(target) {
            overlay.set(target.path, { type: "delete" });
          },
        });
        for (const [path, write] of overlay) {
          if (write.type === "delete") docs.delete(path);
          else if (write.data) docs.set(path, write.data);
        }
        return result;
      });
      chain = run.then(
        () => undefined,
        () => undefined
      );
      return run;
    },
    batch() {
      const ops: Array<() => void> = [];
      return {
        delete(target: DocRef) {
          ops.push(() => docs.delete(target.path));
        },
        async commit() {
          ops.forEach((op) => op());
        },
      };
    },
  };

  return {
    docs,
    adminDb,
    reset() {
      docs.clear();
      sequence = 0;
      chain = Promise.resolve();
    },
  };
}

export const memory = createMemoryFirestore();
