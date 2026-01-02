import Link from "next/link";
import Container from "./Container";

type NavItem = { href: string; label: string };

const nav: NavItem[] = [
  { href: "/personne", label: "Voir une personne" },
  { href: "/relation", label: "Lien de parenté" },
];

export default function Header() {
  return (
    <header className="border-b bg-white">
      <Container>
        <div className="py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border flex items-center justify-center font-black">
              M
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg">Mamia</div>
              <div className="text-xs text-gray-600">
                Schémas • Clans • Liens de parenté
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}
