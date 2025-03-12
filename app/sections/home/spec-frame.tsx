export default function SpecFrame({ id, width, height, className }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      viewBox="0 0 375 606"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37258 0 0 5.37258 0 12V594C0 600.627 5.37259 606 12 606H363C369.627 606 375 600.627 375 594V12C375 5.37258 369.627 0 363 0H12ZM14 4C8.47715 4 4 8.47714 4 14V592C4 597.523 8.47716 602 14 602H361C366.523 602 371 597.523 371 592V14C371 8.47715 366.523 4 361 4H14Z"
        fill={`url(#paint0_linear_9259_1115_${id})`}
      />
      <defs>
        <linearGradient
          id={`paint0_linear_9259_1115_${id}`}
          x1="187.5"
          y1="0"
          x2="187.5"
          y2="606"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FBCA04" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
