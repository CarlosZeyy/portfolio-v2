import { StarBackground } from "@/components/StarBackground";

export function BlackHoleLight() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0B0E14]">
      {/* 1. Fundo de Estrelas Leve (Framer Motion) */}
      <div className="absolute inset-0 opacity-70">
        <StarBackground />
      </div>

      {/* 2. Container do Buraco Negro (Movido um pouco mais pro canto) */}
      <div className="absolute top-[-10%] right-[-10%] w-150 h-150 lg:w-225 lg:h-225 flex items-center justify-center">
        
        {/* Halo Relativístico (Brilho difuso de fundo simulando radiação) */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.15)_0%,rgba(79,70,229,0.1)_40%,transparent_70%)] blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>

        {/* Disco de Acreção (Fundo) - O achatamento (scale-y) cria a ilusão 3D */}
        <div className="absolute w-[110%] h-[110%] rounded-full border-60 border-orange-600/20 blur-2xl -rotate-12 scale-y-[0.3] animate-[spin_40s_linear_infinite]"></div>
        
        {/* Disco de Acreção Interno (Mais denso e brilhante) */}
        <div className="absolute w-[80%] h-[80%] rounded-full border-20 border-amber-400/30 blur-md -rotate-12 scale-y-[0.3] animate-[spin_20s_linear_infinite]"></div>

        {/* Anel de Fótons (Aura muito quente colada no horizonte de eventos) */}
        <div className="absolute w-[36%] h-[36%] rounded-full bg-linear-to-tr from-orange-500 via-amber-200 to-indigo-500 opacity-60 blur-md animate-[spin_3s_linear_infinite]"></div>

        {/* Horizonte de Eventos (O vazio absoluto) */}
        <div className="absolute w-[35%] h-[35%] rounded-full bg-black shadow-[0_0_80px_15px_rgba(234,88,12,0.3)] border border-neutral-900/50"></div>
        
        {/* Efeito Doppler (Brilho frontal girando para simular a dobra da luz) */}
        <div className="absolute w-[80%] h-[80%] rounded-full border-b-20 border-b-amber-200/50 blur-sm -rotate-12 scale-y-[0.3] animate-[spin_10s_linear_infinite]"></div>
      </div>
    </div>
  );
}