import React, { useState, useEffect, useRef } from 'react';
import { Vector } from './vector';
import { calculateChiShape, Edge } from './chiShape';

const ChiShapeVisualization: React.FC = () => {
  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(0.1);
  const [lengthThresh, setLengthThresh] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateRandomPoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      return Array.from({ length: 10 }, () => 
        new Vector(Math.random() * width, Math.random() * height)
      );
    };

    setPoints(generateRandomPoints());
    
    const handleResize = () => {
      setPoints(generateRandomPoints());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { chiShape, delaunayTriangles, outsideEdges, lengthThreshold } = calculateChiShape(points, lambda);

    setLengthThresh(lengthThreshold)
    // Draw Delaunay triangulation
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.lineWidth = 1;
    delaunayTriangles.forEach(([a, b, c]) => {
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.lineTo(points[c].x, points[c].y);
      ctx.closePath();
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 4;
    outsideEdges.forEach((e: Edge) => {
      ctx.setLineDash(e.withinLength ? [] : [10, 15])
      ctx.beginPath()
      ctx.moveTo(e.start.x, e.start.y)
      ctx.lineTo(e.end.x, e.end.y)
      ctx.stroke()
    })

    ctx.setLineDash([])

    // Draw χ-shape
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    chiShape.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw points
    ctx.fillStyle = 'black';
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });



  }, [points, lambda]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickedPoint = new Vector(x, y);

    const existingPointIndex = points.findIndex(p => Vector.dist(p, clickedPoint) < 10);
    
    if (existingPointIndex !== -1) {
      setPoints(points.filter((_, index) => index !== existingPointIndex));
    } else {
      setPoints([...points, clickedPoint]);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.7)', padding: '5px' }}>
        <label>
          λ value:
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={lambda}
            onChange={(e) => setLambda(parseFloat(e.target.value))}
          />
        </label>
        <span>length threshold: {lengthThresh}</span>
      </div>
    </div>
  );
};

export default ChiShapeVisualization;