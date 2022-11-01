import Link from "next/link";

export default function AppHeader() {
  return (
    <nav className="w-full border-b border-border-primary bg-black p-4 pb-0 font-body font-medium text-white">
      <div className="flex flex-row gap-6">
        <svg
          width="76"
          height="65"
          viewBox="0 0 76 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#ffffff" />
        </svg>
        <div className="border-b-2 border-white pb-3">
          <Link href="/" className="h-full text-sm leading-normal text-white">
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
}
