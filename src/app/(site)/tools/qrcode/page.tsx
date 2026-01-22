import { QRCodeGenerator } from "@/components/tools/qrcode-generator";

export default function QRCodePage() {
  return (
    <div className="flex flex-1 flex-col">
      <QRCodeGenerator />
    </div>
  );
}
