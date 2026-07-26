import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

function ScanQr() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const startScan = async () => {
    setError('');
    setResult('');
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setResult(decodedText);
          stopScan();
        },
        () => {
          // erreurs de scan ignorées (normal tant qu'aucun QR n'est détecté)
        }
      );
    } catch (err: any) {
      setError('Could not access camera. Check permissions.');
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error(err);
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleGoToAsset = () => {
    navigate(`/assets?search=${encodeURIComponent(result)}`);
  };

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Scan Asset QR Code</h1>
        <p className="text-slate-500 text-sm mt-1">Use your camera to find an asset instantly</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div id="qr-reader" className="rounded-lg overflow-hidden" />

        {!scanning && !result && (
          <button
            onClick={startScan}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            📷 Start Scanning
          </button>
        )}

        {scanning && (
          <button
            onClick={stopScan}
            className="w-full mt-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Stop Scanning
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mt-4">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 mb-3">
              Found serial number: <strong>{result}</strong>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGoToAsset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors cursor-pointer"
              >
                View Asset
              </button>
              <button
                onClick={() => setResult('')}
                className="flex-1 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-2 rounded-lg transition-colors cursor-pointer"
              >
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanQr;