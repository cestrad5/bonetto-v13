import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import api from '../../services/api';
import OrderPDF from './OrderPDF';
import { toast } from 'react-toastify';

/**
 * Reusable button to download a PDF of an order.
 * It prefetches all product images as base64 in the browser,
 * ensuring they are loaded properly and bypassing any CORS or Silent Fetch
 * issues in @react-pdf/renderer.
 */
const DownloadPDFButton = ({ order, items, style, title, children, fileName }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      // 1. Prefetch product images as base64
      const prefetchedItems = await Promise.all(
        (items || []).map(async (item) => {
          const rawImg = item.Imagen_URL || item.imageUrl || '';
          if (!rawImg || typeof rawImg !== 'string' || !rawImg.startsWith('http')) {
            return {
              ...item,
              Imagen_URL: ''
            };
          }

          try {
            // Fetch via the proxy to resolve redirects, convert WebP to JPEG, and avoid CORS
            const response = await api.get('/api/proxy-image', {
              params: { url: rawImg },
              responseType: 'blob',
              timeout: 15000 // 15 seconds timeout per image
            });

            // Convert blob to base64 data URL
            const base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = () => reject(new Error('FileReader failed'));
              reader.readAsDataURL(response.data);
            });

            return {
              ...item,
              Imagen_URL: base64Data
            };
          } catch (err) {
            console.warn(`[PDF Prefetch] Failed for ${rawImg}:`, err.message);
            // Fallback: use empty string so the placeholder is rendered
            return {
              ...item,
              Imagen_URL: ''
            };
          }
        })
      );

      // 2. Render PDF document
      const doc = (
        <OrderPDF
          order={{
            ...order,
            items: prefetchedItems
          }}
        />
      );

      // 3. Generate Blob programmatically
      const blob = await pdf(doc).toBlob();

      // 4. Trigger browser download
      const downloadName = fileName || `Pedido_${order?.Pedido_ID || 'S_N'}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF generado con éxito');
    } catch (err) {
      console.error('[PDF Generation Error]:', err);
      toast.error('Error al generar el PDF del pedido');
    } finally {
      setLoading(false);
    }
  };

  if (typeof children === 'function') {
    return children({ loading, handleDownload });
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={style}
      title={title}
    >
      {loading ? '…' : children}
    </button>
  );
};

export default DownloadPDFButton;
