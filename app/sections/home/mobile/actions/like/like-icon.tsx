export default function LikeIcon({ isActive, size = 32 }: any) {
  const id = String(Math.random() + Date.now());
  return (
    isActive ? <img src="/img/home/star-full.svg" style={{ width: size, height: size }} /> : <img src="/img/home/star-empty.svg" style={{ width: size, height: size }} />
  );
}
