"use client";

import { QRCodeSVG } from "qrcode.react";

export default function PilgrimQR({ data }: { data: string }) {
  return <QRCodeSVG value={data} size={80} level="M" />;
}
