"use client";

import { useEffect, useRef, useState } from "react";

function proxyUrl(url: string) {
  return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
}

export default function PdfViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url) return;
    setError(false);
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const doc = await pdfjsLib.getDocument({ url: proxyUrl(url), withCredentials: false }).promise;
        const pageList = [];
        for (let i = 1; i <= doc.numPages; i++) {
          pageList.push(await doc.getPage(i));
        }
        setPages(pageList);
      } catch {
        setError(true);
      }
    })();
  }, [url]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        scaleRef.current = Math.min(4, Math.max(0.3, scaleRef.current - e.deltaY * 0.005));
        applyTransform();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => el.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  const applyTransform = () => {
    if (!renderRef.current) return;
    renderRef.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px) scale(${scaleRef.current})`;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      scaleRef.current = Math.min(4, Math.max(0.3, scaleRef.current - e.deltaY * 0.005));
      applyTransform();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    offsetRef.current = {
      x: dragStart.current.ox + e.clientX - dragStart.current.mx,
      y: dragStart.current.oy + e.clientY - dragStart.current.my,
    };
    applyTransform();
  };

  const handleMouseUp = () => { dragStart.current = null; };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = dist / lastPinchDist.current;
      scaleRef.current = Math.min(4, Math.max(0.3, scaleRef.current * delta));
      lastPinchDist.current = dist;
      applyTransform();
    } else if (e.touches.length === 1 && dragStart.current) {
      offsetRef.current = {
        x: dragStart.current.ox + e.touches[0].clientX - dragStart.current.mx,
        y: dragStart.current.oy + e.touches[0].clientY - dragStart.current.my,
      };
      applyTransform();
    }
  };

  const handleTouchEnd = () => {
    lastPinchDist.current = null;
    dragStart.current = null;
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ width: "100%", height: "100%", overflow: "auto", cursor: dragStart.current ? "grabbing" : "grab", touchAction: "none" }}
    >
      {error && (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: "#bbb" }}>PDFを読み込めませんでした</div>
        </div>
      )}
      <div ref={renderRef} style={{ transformOrigin: "top center", willChange: "transform", display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "40px 40px 100px" }}>
        {pages.map((page, i) => (
          <PageCanvas key={i} page={page} />
        ))}
      </div>
    </div>
  );
}

function PageCanvas({ page }: { page: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || rendered.current) return;
    rendered.current = true;
    const viewport = page.getViewport({ scale: 2 });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    page.render({ canvasContext: canvas.getContext("2d")!, viewport });
  }, [page]);

  return (
    <canvas ref={canvasRef} style={{ width: 480, height: "auto", display: "block", boxShadow: "0 16px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)", borderRadius: 4 }} />
  );
}