// components/CategoryFilters.tsx
type CategoryFiltersProps = {
  categories?: string[];
  onClear?: () => void;
};
const CategoryFilters = ({
  categories = [],
  onClear = () => {},
}: CategoryFiltersProps) => {
  return (
    categories.length > 0 && (
      <>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <span
              key={i}
              className="text-sm text-white bg-slate-900 rounded-sm px-2 py-1"
            >
              {cat}
            </span>
          ))}
        </div>
        <button
          className="mt-2 text-sm text-black bg-slate-300 rounded-sm px-2 py-1"
          onClick={onClear}
        >
          Clear Filters
        </button>
      </>
    )
  );
};

export default CategoryFilters;
