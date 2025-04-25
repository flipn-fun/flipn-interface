export default function LikeIcon({ isActive, size = 32 }: any) {
  const id = String(Math.random() + Date.now());
  return (
    isActive ? 
    <img src="/img/home/star-full-2.svg" style={{ width: size, height: size, textShadow: '0px 0px 4px rgba(0, 0, 0, 0.5)' }} /> : 
    <img src="/img/home/star-empty-2.svg" style={{ width: size, height: size, textShadow: '0px 0px 4px rgba(0, 0, 0, 0.5)' }} />
  );
}
