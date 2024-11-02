import { MouseEventHandler } from "react";

export type OrderButtonSectionProps = {
  subtotal: number;
  handleClick: MouseEventHandler<HTMLButtonElement>; // Use the correct type
};
