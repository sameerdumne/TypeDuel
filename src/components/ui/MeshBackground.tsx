"use client";

import { useEffect, useRef } from "react";

const SPACING = 56;
const JITTER = 12;
const MOUSE_RADIUS = 250;
const NODE_BASE_RADIUS = 1.0;
const NODE_ACTIVE_RADIUS = 4.0;
const LINE_BASE_ALPHA = 0.07;
const LINE_ACTIVE_ALPHA = 0.35;
const NODE_BASE_ALPHA = 0.18;
const NODE_ACTIVE_ALPHA = 1.0;
const CYAN = { r: 0, g: 218, b: 243 };

interface Node {
  x: number;
  y: number;
  ox: number;
  oy: number;
  phase: number;
  _influence: number;
}

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const mouse = { x: -1000, y: -1000 };
    let nodes: Node[] = [];
    let animId: number;

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      buildGrid();
    }

    function buildGrid() {
      nodes = [];
      const cols = Math.ceil(W / SPACING) + 1;
      const rows = Math.ceil(H / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          nodes.push({
            x: c * SPACING + (Math.random() - 0.5) * JITTER,
            y: r * SPACING + (Math.random() - 0.5) * JITTER,
            ox: c * SPACING,
            oy: r * SPACING,
            phase: Math.random() * Math.PI * 2,
            _influence: 0,
          });
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function onMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      const time = t * 0.001;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x = n.ox + Math.sin(time * 0.3 + n.phase) * 2;
        n.y = n.oy + Math.cos(time * 0.25 + n.phase * 1.3) * 2;
      }

      const cols = Math.ceil(W / SPACING) + 1;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        n._influence = Math.max(0, 1 - dist / MOUSE_RADIUS);
      }

      ctx!.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        if (col < cols - 1) {
          const right = nodes[i + 1];
          const avgInf = (n._influence + right._influence) * 0.5;
          const alpha = LINE_BASE_ALPHA + (LINE_ACTIVE_ALPHA - LINE_BASE_ALPHA) * avgInf;
          ctx!.beginPath();
          ctx!.strokeStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${alpha})`;
          ctx!.moveTo(n.x, n.y);
          ctx!.lineTo(right.x, right.y);
          ctx!.stroke();
        }

        if (row < Math.ceil(nodes.length / cols) - 1 && i + cols < nodes.length) {
          const below = nodes[i + cols];
          const avgInf = (n._influence + below._influence) * 0.5;
          const alpha = LINE_BASE_ALPHA + (LINE_ACTIVE_ALPHA - LINE_BASE_ALPHA) * avgInf;
          ctx!.beginPath();
          ctx!.strokeStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${alpha})`;
          ctx!.moveTo(n.x, n.y);
          ctx!.lineTo(below.x, below.y);
          ctx!.stroke();
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const inf = n._influence;
        const radius = NODE_BASE_RADIUS + (NODE_ACTIVE_RADIUS - NODE_BASE_RADIUS) * inf;
        const alpha = NODE_BASE_ALPHA + (NODE_ACTIVE_ALPHA - NODE_BASE_ALPHA) * inf;

        ctx!.beginPath();
        ctx!.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${alpha})`;
        ctx!.fill();

        if (inf > 0.3) {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, radius + 4 * inf, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${inf * 0.15})`;
          ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-[1]"
      aria-hidden="true"
    />
  );
}
