import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone: um server.js + SÓ os arquivos de node_modules que o
  // app realmente importa (rastreados pelo build). A imagem Docker final copia
  // essa pasta e não precisa de `npm install` nem do node_modules inteiro.
  output: "standalone",

  experimental: {
    serverActions: {
      // O padrão é 1 MB por requisição. O formulário de projeto envia thumbnail
      // + galeria na mesma Server Action: qualquer screenshot de verdade
      // estoura isso, e o upload falha com "Body exceeded 1 MB limit".
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
