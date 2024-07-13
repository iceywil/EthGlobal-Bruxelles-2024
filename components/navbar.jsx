import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="flex h-16 w-full items-center justify-between px-4 md:px-6 bg-black text-white">
      <div className="flex flex-1 items-center">
        <Link href="/" className="flex items-center" prefetch={false}>
          <Image src="/biologo.png" alt="BioSafe" width={40} height={32} />
          <div className="ml-2 text-[#35c184] font-bold text-2xl">BioSafe</div>
        </Link>
      </div>
      <nav className="flex flex-1 justify-center items-center gap-4">
        <Link
          href="#"
          className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          prefetch={false}
        >
          Docs
        </Link>
        <Link
          href="#"
          className="inline-flex h-9 items-center justify-center rounded-md border-white px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          prefetch={false}
        >
          Security
        </Link>
        <Link
          href="#"
          className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          prefetch={false}
        >
          Blog
        </Link>
        <Link
          href="#"
          className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          prefetch={false}
        >
          Pricing
        </Link>
      </nav>
      <div className="flex flex-1 justify-end">
        <w3m-button />
      </div>
    </header>
  );
}
