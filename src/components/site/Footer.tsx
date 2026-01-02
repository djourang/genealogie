import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <Container>
        <div className="py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm">
            <div className="font-semibold">Mamia</div>
            <div className="text-gray-600">
              Visualisation des liens familiaux • {new Date().getFullYear()}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/" className="underline">
              Accueil
            </Link>
            <Link href="/personne" className="underline">
              Voir une personne
            </Link>
            <Link href="/relation" className="underline">
              Lien de parenté
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
