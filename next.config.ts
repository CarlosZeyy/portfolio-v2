import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
