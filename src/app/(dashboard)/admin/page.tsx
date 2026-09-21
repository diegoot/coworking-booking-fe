// `AdminLayout` owns all the visible structure for `/admin` (heading +
// the `@rooms`/`@bookings` parallel slots). This `children` slot just
// needs to exist so the `/admin` route itself resolves, per the
// Next.js parallel-routes convention.
export default function AdminPage() {
  return null;
}
