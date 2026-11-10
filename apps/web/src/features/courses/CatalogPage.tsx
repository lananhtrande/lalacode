import { useId } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import type { CourseLevel } from '@lalakode/content-schema';
import {
  catalogFilterParams,
  catalogTags,
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

const TAG_ALL = '';

/**
 * Danh sách khoá học `/khoa-hoc` (S0-37, giao diện S0-41). Lọc ngay trong
 * trình duyệt; bộ lọc nằm trên URL để tải lại trang hay gửi link vẫn giữ nguyên.
 * Khung lọc đứng đầu trang, `h1` chỉ dành cho trình đọc màn hình.
 */
export function CatalogPage() {
  const state = useCourses();
  const [params, setParams] = useSearchParams();
  const filter = parseCatalogFilter(params);
  const searchId = useId();

  // `replace`: gõ từng chữ hay bấm chip không làm dài lịch sử nút Back.
  const update = (patch: Partial<CatalogFilter>) =>
    setParams(catalogFilterParams({ ...filter, ...patch }), { replace: true });

  const courses = state.status === 'ready' ? state.courses : [];
  const shown = filterCourses(courses, filter);
  const filtering = isFiltering(filter);
  const tags = catalogTags(courses.map((item) => item.course));

  return (
    <div className="mx-auto w-full">
      <h1 className="sr-only">{vi.catalog.title}</h1>

      <section
        aria-label={vi.catalog.filterLabel}
        className="rounded-[1.375rem] border border-line bg-surface/80 p-3 shadow-card"
      >
        {/* Hàng 1: chủ đề + ô tìm */}
        <div className="flex flex-wrap items-center gap-3">
          <ChipGroup
            label={vi.catalog.tagLabel}
            size="lg"
            options={[
              { value: TAG_ALL, label: vi.catalog.allTags },
              ...tags.map((tag) => ({ value: tag, label: tag })),
            ]}
            value={filter.tag ?? TAG_ALL}
            onChange={(tag) => update({ tag: tag === TAG_ALL ? null : tag })}
          />
          <div className="relative min-w-56 flex-1">
            <label htmlFor={searchId} className="sr-only">
              {vi.catalog.searchLabel}
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-soft"
            />
            <input
              id={searchId}
              type="search"
              value={filter.query}
              placeholder={vi.catalog.searchPlaceholder}
              onChange={(event) => update({ query: event.target.value })}
              className="h-13 w-full rounded-2xl border border-line bg-surface-sunken pr-4 pl-11 text-body placeholder:text-ink-soft"
            />
          </div>
        </div>

        <div className="my-3 h-px bg-line-soft" aria-hidden="true" />

        {/* Hàng 2: cấp độ · trạng thái · số khoá */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center">
            <span className="sr-only">{vi.catalog.levelLabel}</span>
            <select
              value={filter.level ?? 'tat-ca'}
              onChange={(event) => {
                const level = event.target.value as CourseLevel | 'tat-ca';
                update({ level: level === 'tat-ca' ? null : level });
              }}
              className="h-10 rounded-xl border border-line bg-surface-sunken px-3 text-small font-semibold text-ink"
            >
              <option value="tat-ca">{vi.catalog.allLevels}</option>
              {levelFilters.map((value) => (
                <option key={value} value={value}>
                  {vi.catalog.level[value]}
                </option>
              ))}
            </select>
          </label>
          <ChipGroup
            label={vi.catalog.statusLabel}
            size="sm"
            options={statusFilters.map((value) => ({ value, label: vi.catalog.status[value] }))}
            value={filter.status}
            onChange={(status) => update({ status })}
          />
          {state.status === 'ready' && (
            <p
              className="ml-auto rounded-xl bg-surface-sunken px-3 py-2 text-small font-semibold whitespace-nowrap text-ink"
              aria-live="polite"
              data-testid="course-count"
            >
              {shown.length} {vi.catalog.count}
            </p>
          )}
        </div>
      </section>

      {state.status === 'loading' && (
        <p className="mt-7 text-ink-soft" role="status">
          {vi.catalog.loading}
        </p>
      )}
      {state.status === 'error' && (
        <p className="mt-7 text-attention" role="alert">
          {vi.catalog.error}
        </p>
      )}

      {state.status === 'ready' && shown.length === 0 && (
        <div className="mt-7 rounded-card border border-line bg-surface p-8 text-center">
          <p className="text-body">{vi.catalog.empty}</p>
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
        <ul className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(min(100%,18.75rem),1fr))] gap-5">
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
  /** `lg`: hàng chủ đề (chip 40px); `sm`: hàng trạng thái (chip 32px trong nhóm cao 40px). */
  size: 'lg' | 'sm';
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Nhóm chip chọn một trên nền lõm: mỗi chip là `<button aria-pressed>`, chip
 * đang chọn nổi lên nền trắng, chữ màu nhấn (không chỉ khác màu: có viền và bóng).
 */
function ChipGroup<T extends string>({ label, size, options, value, onChange }: ChipGroupProps<T>) {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={[
        'flex flex-wrap items-center gap-1 bg-surface-sunken',
        size === 'lg' ? 'rounded-[1.1875rem] p-1.5' : 'min-h-10 rounded-xl p-1',
      ].join(' ')}
    >
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
              'text-small',
              size === 'lg'
                ? 'h-10 rounded-[0.6875rem] px-4 font-semibold'
                : 'h-8 rounded-[0.625rem] px-3 font-medium',
              active
                ? 'bg-surface text-accent shadow-[0_0_0_1px_var(--color-line),0_1px_5px_rgb(15_23_42/0.1)]'
                : 'text-ink-soft hover:text-ink',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
