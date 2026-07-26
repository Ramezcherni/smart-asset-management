import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeModalProps {
  assetName: string;
  serialNumber: string;
  onClose: () => void;
}

function QrCodeModal({ assetName, serialNumber, onClose }: QrCodeModalProps) {
  const handleDownload = () => {
    const canvas = document.getElementById('asset-qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${serialNumber}.png`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-80 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-slate-900 mb-1">{assetName}</h3>
        <p className="text-xs text-slate-500 mb-4">Serial: {serialNumber}</p>

        <div className="flex justify-center mb-4">
          <QRCodeCanvas id="asset-qr-code" value={serialNumber} size={180} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QrCodeModal;