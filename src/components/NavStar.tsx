import { Float, Html } from "@react-three/drei";

export default function NavStar({
  position,
  title,
}: {
  position: [number, number, number];
  title: string;
}) {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color={"#fff"} />
        <Html center position={[0, -0.3, 0]}>
          <div className="text-white font-mono text-xl">{title}</div>
        </Html>
      </mesh>
    </Float>
  );
}
