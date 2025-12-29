import React from "react";
import s from "./SliderNav.module.css";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons/Icons";

export default function SliderNav({
  activeIndex,
  dots,
  onPrev,
  onNext,
  onDotClick,
  buttonBgColor = "var(--white)",
  containerClassName,
}: {
  activeIndex: number;
  dots: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (idx: number) => void;
  buttonBgColor?: string;
  containerBgColor?: string;
  containerClassName?: string;
}) {
  return (
    <div className={`${s.navContainer} ${containerClassName || ""}`} style={{}}>
      <button
        className={s.leftBtn}
        onClick={onPrev}
        aria-label="Previous slide"
        style={{ background: buttonBgColor }}
      >
        <ArrowLeftIcon />
      </button>

      <div className={s.dotsBlock}>
        {[...Array(dots)].map((_, idx) => (
          <span
            key={idx}
            className={idx === activeIndex ? s.activeDot : s.dot}
            onClick={() => onDotClick(idx)}
          />
        ))}
      </div>

      <button
        className={s.rightBtn}
        onClick={onNext}
        aria-label="Next slide"
        style={{ background: buttonBgColor }}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
}

// ----2-test----------------

// import React from "react";
// import s from "./SliderNav.module.css";
// import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons/Icons";

// export default function SliderNav({
//   activeIndex,
//   dots,
//   onPrev,
//   onNext,
//   onDotClick,
//   buttonBgColor = "var(--white)",
// }: {
//   activeIndex: number;
//   dots: number;
//   onPrev: () => void;
//   onNext: () => void;
//   onDotClick: (idx: number) => void;
//   buttonBgColor?: string;
//   containerBgColor?: string;
// }) {
//   return (
//     <div className={s.navContainer} style={{}}>
//       <button
//         className={s.leftBtn}
//         onClick={() => {
//           onPrev();
//         }}
//         aria-label="Previous slide"
//         style={{ background: buttonBgColor }}
//       >
//         <ArrowLeftIcon />
//       </button>

//       <div className={s.dotsBlock}>
//         {[...Array(dots)].map((_, idx) => (
//           <span
//             key={idx}
//             className={idx === activeIndex ? s.activeDot : s.dot}
//             onClick={() => {
//               onDotClick(idx);
//             }}
//           />
//         ))}
//       </div>

//       <button
//         className={s.rightBtn}
//         onClick={() => {
//           onNext();
//         }}
//         aria-label="Next slide"
//         style={{ background: buttonBgColor }}
//       >
//         <ArrowRightIcon />
//       </button>
//     </div>
//   );
// }
