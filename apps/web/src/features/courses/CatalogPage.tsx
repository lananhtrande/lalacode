import { useId } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import type { CourseLevel } from '@lalakode/content-schema';
import {
  catalogFilterParams,
  filterCourses,
  isFiltering,
  levelFilters,
  parseCatalogFilter,
  statusFilters,
  type CatalogFilter,
} from '../../content/catalog';
import { vi } from '../../shared/i18n/vi';
import { Button } from '../../shared/ui/Button';
import { ComingSoonCard, CourseCard } from './CourseCard';
import { useCourses } from './useCourses';

/**
 * Danh sách khoá học `/khoa-hoc` (S0-37). Lọc ngay trong trình duyệt; bộ lọc
 * nằm trên URL để tải lại trang hay gửi link vẫn giữ nguyên.
 */
export function CatalogPage() {
  const state = useCourses();
  const [params, setParams] = useSearchParams();
  const filter = parseCatalogFilter(params);
  const searchId = useId();

  // `replace`: gõ từng chữ hay bấm chip không làm dài lịch sử nút Back.
  const update = (patch: Partial<CatalogFilter>) =>
    setParams(catalogFilterParams({ ...filter, ...patch }), { replace: true });

  const shown = state.status === 'ready' ? filterCourses(state.courses, filter) : [];
  const filtering = isFiltering(filter);

  return (
    <div className="mx-auto w-full max-w-[90rem]">
      <h1 className="text-page-title">{vi.catalog.title}</h1>
      <p className="mt-1 text-ink-soft">{vi.catalog.lead}</p>

      {/* Một hàng gọn: chip trạng thái · cấp độ · ô tìm · số khoá. Màn hẹp tự xuống dòng. */}
      <section
        aria-label={vi.catalog.filterLabel}
        className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card bg-surface p-3 shadow-card sm:px-4"
      >
        <ChipGroup
          label={vi.catalog.statusLabel}
          options={statusFilters.map((value) => ({ value, label: vi.catalog.status[value] }))}
          value={filter.status}
          onChange={(status) => update({ status })}
        />
        <label className="flex items-center gap-2">
          <span className="sr-only">{vi.catalog.levelLabel}</span>
          <select
            value={filter.level ?? 'tat-ca'}
            onChange={(event) => {
              const level = event.target.value as CourseLevel | 'tat-ca';
              update({ level: level === 'tat-ca' ? null : level });
            }}
            className="min-h-tap rounded-full border border-line bg-surface px-4 text-small font-semibold text-ink"
          >
            <option value="tat-ca">{vi.catalog.allLevels}</option>
            {levelFilters.map((value) => (
              <option key={value} value={value}>
                {vi.catalog.level[value]}
              </option>
            ))}
          </select>
        </label>
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <label htmlFor={searchId} className="sr-only">
            {vi.catalog.searchLabel}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft"
          />
          <input
            id={searchId}
            type="search"
            value={filter.query}
            placeholder={vi.catalog.searchPlaceholder}
            onChange={(event) => update({ query: event.target.value })}
            className="min-h-tap w-full rounded-full border border-line bg-surface-muted pr-4 pl-9 text-small placeholder:text-ink-soft"
          />
        </div>
        {state.status === 'ready' && (
          <p
            className="ml-auto text-small whitespace-nowrap text-ink-soft"
            aria-live="polite"
            data-testid="course-count"
          >
            {shown.length} {vi.catalog.count}
          </p>
        )}
      </section>

      {state.status === 'loading' && (
        <p className="mt-6 text-ink-soft" role="status">
          {vi.catalog.loading}
        </p>
      )}
      {state.status === 'error' && (
        <p className="mt-6 text-attention" role="alert">
          {vi.catalog.error}
        </p>
      )}

      {state.status === 'ready' && shown.length === 0 && (
        <div className="mt-6 rounded-card bg-surface p-8 text-center shadow-card">
          <p className="text-card-title font-normal">{vi.catalog.empty}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
          >
            {vi.catalog.clearFilters}
          </Button>
        </div>
      )}

      {shown.length > 0 && (
        <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-5">
          {shown.map((item) => (
            <li key={item.course.id}>
              <CourseCard {...item} />
            </li>
          ))}
          {!filtering && (
            <li>
              <ComingSoonCard />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Nhóm chip chọn một: mỗi chip là `<button aria-pressed>`, nhãn nhóm đọc trước. */
function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap items-center gap-2">
      <span id={labelId} className="sr-only">
        {label}
      </span>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              'min-h-tap rounded-full border px-4 text-small font-semibold',
              active
                ? 'border-ink bg-ink text-surface'
                : 'border-line bg-surface text-ink-soft hover:bg-surface-muted hover:text-ink',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
