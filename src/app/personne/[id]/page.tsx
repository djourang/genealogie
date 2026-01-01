import FamilyDiagram from "@/components/FamilyDiagram";

export default async function PersonPage(props: any) {
  const params = await Promise.resolve(props.params);
  const id = params?.id;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Schéma</h1>

      {id ? (
        <FamilyDiagram focusId={id} />
      ) : (
        <div className="text-red-600">Paramètre [id] non reçu.</div>
      )}
    </main>
  );
}
