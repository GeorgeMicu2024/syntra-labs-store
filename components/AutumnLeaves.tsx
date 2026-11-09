import type { CSSProperties } from "react";

const leaves = [
  { left: "4%", size: 23, duration: 19, delay: -3, drift: "115px", colour: "#c98b46" },
  { left: "13%", size: 15, duration: 24, delay: -16, drift: "-64px", colour: "#f1bd70" },
  { left: "23%", size: 21, duration: 21, delay: -9, drift: "106px", colour: "#b86b39" },
  { left: "35%", size: 14, duration: 26, delay: -21, drift: "-102px", colour: "#df9d55" },
  { left: "47%", size: 18, duration: 23, delay: -12, drift: "78px", colour: "#e4ac68" },
  { left: "59%", size: 24, duration: 20, delay: -7, drift: "-110px", colour: "#a96032" },
  { left: "67%", size: 16, duration: 25, delay: -18, drift: "90px", colour: "#d39451" },
  { left: "76%", size: 20, duration: 22, delay: -2, drift: "-88px", colour: "#f0bb75" },
  { left: "84%", size: 15, duration: 27, delay: -15, drift: "66px", colour: "#bf763a" },
  { left: "92%", size: 22, duration: 23, delay: -22, drift: "-93px", colour: "#de9a50" },
] as const;

export default function AutumnLeaves() {
  return (
    <div className="autumn-leaves" aria-hidden="true">
      {leaves.map((leaf) => (
        <span
          key={leaf.left}
          className="autumn-leaf"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            color: leaf.colour,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            "--autumn-drift": leaf.drift,
          } as CSSProperties}
        >
          <svg viewBox="0 0 40 44" focusable="false">
            <path d="M36 3C19 4 8 12 5 27c-2 9 3 14 11 13C30 38 38 23 36 3Z" />
            <path className="autumn-leaf-vein" d="M9 38C17 26 25 16 35 5M18 27l-3-10M23 21l9 2" />
          </svg>
        </span>
      ))}
    </div>
  );
}
