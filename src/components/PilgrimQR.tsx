"use client";

import { QRCodeSVG } from "qrcode.react";

export default function PilgrimQR({ data, size = 80 }: { data: string; size?: number }) {
  return <QRCodeSVG value={data} size={size} level="M" />;
}
