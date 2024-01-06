import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import ini from 'ini'

export const SETTINGS_FILE = join(homedir(), '.grbl-terminal')

export function loadSettings() {
  if (existsSync(SETTINGS_FILE)) {
    return ini.parse(readFileSync(SETTINGS_FILE, 'utf-8'))
  } else {
    return {}
  }
}
