// 화면을 옮길 때마다 부드럽게 떠오르는 전환 (opacity·이동만 써서 fixed 요소에 영향이 적게)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="anim-page">{children}</div>;
}
