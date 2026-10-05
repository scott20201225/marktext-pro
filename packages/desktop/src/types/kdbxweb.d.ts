// Runtime resolution is configured in electron.vite.config.ts to bundle the
// vendored KDBXWeb source. Keep TypeScript's app-level check independent from
// KDBXWeb's own TypeScript-version-specific implementation diagnostics.
declare module 'kdbxweb' {
  export class ProtectedValue {
    static fromString(value: string): ProtectedValue
    getText(): string
  }

  export interface KdbxUuid {
    toString(): string
  }

  export interface KdbxTimes {
    lastModTime?: Date
    update(): void
  }

  export type KdbxBinary = ArrayBuffer | ProtectedValue | { value?: ArrayBuffer }

  export interface KdbxGroup {
    uuid: KdbxUuid
    name: string
    parentGroup?: KdbxGroup
    groups: KdbxGroup[]
    entries: KdbxEntry[]
    times: KdbxTimes
  }

  export interface KdbxEntry {
    uuid: KdbxUuid
    parentGroup?: KdbxGroup
    fields: Map<string, string | ProtectedValue>
    binaries: Map<string, KdbxBinary>
    tags?: string[]
    times: KdbxTimes
    history: KdbxEntry[]
    pushHistory(): void
    removeHistory(index: number, count?: number): void
    copyFrom(entry: KdbxEntry): void
  }

  export class KdbxCredentials {
    constructor(password: ProtectedValue)
    ready: Promise<KdbxCredentials>
  }

  export class Kdbx {
    static create(credentials: KdbxCredentials, name: string): Kdbx
    static load(data: ArrayBuffer, credentials: KdbxCredentials): Promise<Kdbx>
    groups: KdbxGroup[]
    credentials: KdbxCredentials
    meta: {
      name?: string
      recycleBinEnabled?: boolean
      recycleBinUuid?: KdbxUuid
    }
    createGroup(parent: KdbxGroup, name: string): KdbxGroup
    createEntry(parent: KdbxGroup): KdbxEntry
    createBinary(data: ArrayBuffer): Promise<KdbxBinary>
    createRecycleBin(): void
    getDefaultGroup(): KdbxGroup
    getGroup(id: string): KdbxGroup | undefined
    move(item: KdbxGroup | KdbxEntry, target?: KdbxGroup): void
    remove(item: KdbxGroup | KdbxEntry): void
    cleanup(options?: { binaries?: boolean }): void
    setKdf(kdf: string): void
    save(): Promise<ArrayBuffer>
  }

  export const Consts: {
    KdfId: { Aes: string }
  }
}
