// SmoothScroll.tsx
import {ReactLenis, useLenis} from "lenis/react";

type Props = {
  children: React.ReactNode;
};

export function SmoothScroll({ children }: Props) {

    const lenis = useLenis((lenis) => {
        // called every scroll
        console.log(lenis)
      })
  return (
    <ReactLenis
      root
    >
      {children}
    </ReactLenis>
  );
}
