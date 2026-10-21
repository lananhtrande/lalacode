import type { IDBPDatabase, IDBPTransaction } from 'idb';
import { PROFILE_KEY, type ProfileState } from './schema';
import type { ProgressDb } from './db';

/**
 * Các bước nâng cấp cấu trúc dữ liệu trên máy trẻ.
 *
 * Luật: **không bao giờ xoá dữ liệu cũ để "cho nhanh"** — trẻ mất tiến độ là
 * mất động lực học. Mỗi bước nhận DB ở phiên bản trước và nâng lên một bậc.
 */
type UpgradeTransaction = IDBPTransaction<
  ProgressDb,
  ArrayLike<'exercises' | 'lessons' | 'profile'>,
  'versionchange'
>;

export type UpgradeStep = (db: IDBPDatabase<ProgressDb>, transaction: UpgradeTransaction) => void;

/** `steps[n]` nâng từ phiên bản n lên n+1. */
export const upgradeSteps: UpgradeStep[] = [
  // 0 → 1: tạo mới.
  (db, transaction) => {
    const exercises = db.createObjectStore('exercises', { keyPath: 'exerciseId' });
    exercises.createIndex('by-lesson', 'lessonId');

    db.createObjectStore('lessons', { keyPath: 'lessonId' });
    db.createObjectStore('profile', { keyPath: 'id' });

    const profile: ProfileState = {
      id: PROFILE_KEY,
      createdAt: new Date().toISOString(),
      streakDays: 0,
      badges: [],
    };
    void transaction.objectStore('profile').put(profile);
  },
];

export function runUpgrades(
  db: IDBPDatabase<ProgressDb>,
  transaction: UpgradeTransaction,
  oldVersion: number,
  newVersion: number,
): void {
  for (let version = oldVersion; version < newVersion; version += 1) {
    const step = upgradeSteps[version];
    if (!step) throw new Error(`Thiếu bước nâng cấp dữ liệu từ phiên bản ${version}`);
    step(db, transaction);
  }
}
