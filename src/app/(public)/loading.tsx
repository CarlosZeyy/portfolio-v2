import ShootingStars from "@/components/ShootingStars";

export default function Loading() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <ShootingStars />
      <div className="flex min-h-screen w-full text-white justify-center items-center text-3xl bg-gray-950/80 font-semibold">
        <h1 className="z-10 animate-pulse">Estabelecendo conexão...</h1>
      </div>
    </div>
  );
}
