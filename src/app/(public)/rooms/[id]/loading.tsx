export default function RoomDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-10 w-32" />
      </div>
    </main>
  );
}
