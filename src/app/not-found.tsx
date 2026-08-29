import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl font-bold text-farm-500">404</p>
      <h1 className="mt-3 text-xl font-semibold text-farm-700">
        This page could not be found
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        The link may be broken or the page may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-farm-500 px-5 py-2.5 font-medium text-white hover:bg-farm-600"
      >
        Back home
      </Link>
    </div>
  );
}
