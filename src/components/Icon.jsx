const paths = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-16-3 7-7 3 3-7 7-3Z",
  abacus:
    "M4 3v18M20 3v18M4 7h16M4 12h16M4 17h16M8 5v4M15 5v4M10 10v4M16 10v4M8 15v4M13 15v4",
  bolt: "m13 2-9 12h7l-1 8 10-12h-7l1-8Z",
  cards:
    "M8 3h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8V3Zm-4 3H2v16h13M12 8l2-2 3 4-3 4-2-2",
  sword: "m14 3 7-1-1 7L9 20l-5-5L14 3ZM3 21l4-4M3 12l9 9",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z",
  chart: "M4 3v17h17M8 16v-5M13 16V7M18 16V4",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  check: "m5 12 4 4L19 6",
  lock: "M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4",
  gift: "M3 9h18v4H3V9Zm2 4v8h14v-8M12 9v12M12 9C2 9 5 0 9 4l3 5Zm0 0c10 0 7-9 3-5l-3 5Z",
  trophy:
    "M7 3h10v7a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v5m-4 1h8",
  sound: "M3 9v6h4l5 5V4L7 9H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16",
  mute: "M3 9v6h4l5 5V4L7 9H3Zm13 0 5 6m0-6-5 6",
  refresh: "M20 7a9 9 0 1 0 1 8M20 2v6h-6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
};
export default function Icon({ name, size = 21, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
