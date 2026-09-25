export default function HomeLoading() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-16">
        <div className="skeleton h-10 w-3/4 max-w-md" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full max-w-xl" />
          <div className="skeleton h-4 w-full max-w-lg" />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-8 w-40 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 border-t border-base-300 px-6 py-12">
        <div className="skeleton h-6 w-32" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-48 rounded-box" />
          ))}
        </div>
      </div>
    </main>
  );
}
