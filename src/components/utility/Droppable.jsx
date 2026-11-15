import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const RbdDroppable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Droppable),
  { ssr: false }
);

const Droppable = ({
  isDropDisabled = false,
  isCombineEnabled = false,
  ignoreContainerClipping = false,
  direction = "vertical",
  type = "DEFAULT",
  children,
  ...props
}) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <RbdDroppable
      isDropDisabled={Boolean(isDropDisabled)}
      isCombineEnabled={Boolean(isCombineEnabled)}
      ignoreContainerClipping={Boolean(ignoreContainerClipping)}
      direction={direction}
      type={type}
      {...props}
    >
      {children}
    </RbdDroppable>
  );
};

export default Droppable;

