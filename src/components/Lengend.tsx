// components/Legend.tsx
import Pin from "@/components/Pin";

const Legend = () => {
  const items = [
    {
      color: "#35c789",
      label: "Organisation with user contributed information",
    },
    { color: "#2c7eff", label: "Organisation with near complete information" },
    { color: "#3f3d4b", label: "Organisation missing information" },
  ];

  return (
    <div className="flex flex-col gap-1 mt-6">
      <h5 className="font-semibold text-lg">Organisation Information</h5>
      {items.map((item, i) => (
        <div key={i} className="flex items-center">
          <Pin color={item.color} />
          <span className="ml-2 text-sm text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
