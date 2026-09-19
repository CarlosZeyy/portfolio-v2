// Healthcheck do container (HEALTHCHECK do Dockerfile / orquestrador).
// Não toca no Supabase de propósito: responde "o processo Node está de pé e
// servindo HTTP". Se dependesse do banco, uma instabilidade do Supabase faria
// o orquestrador reiniciar um container perfeitamente saudável, em laço.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" });
}
