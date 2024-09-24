import React, { useState, useEffect, useRef } from 'react';
import { Vector } from './vector';
import { calculateChiShape, Edge } from './chiShape';
import { CombinatorialMap } from './CombinatorialMap';

const ChiShapeVisualization: React.FC = () => {
  const [points, setPoints] = useState<Vector[]>([]);
  const [lambda, setLambda] = useState(0.1);
  const [lengthThresh, setLengthThresh] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateRandomPoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      return Array.from({ length: 4 }, () => 
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
    if (points.length < 3) return;
  
    const { chiShape, delaunayTriangles, removedEdges, lengthThreshold, combinatorialMap } = calculateChiShape(points, lambda);
    setLengthThresh(lengthThreshold);
  
    // Draw outside edges
    removedEdges.forEach(edge => {
      ctx.beginPath();
      ctx.lineWidth = 9
      ctx.moveTo(edge.start.x, edge.start.y);
      ctx.lineTo(edge.end.x, edge.end.y);
      ctx.strokeStyle = 'rgb(255, 0, 0, 1)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  
    // Draw χ-shape
    ctx.strokeStyle = 'rgba(128, 0, 128, 0.3)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    chiShape.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.stroke();
  
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
  
    // Draw darts and labels
    drawDartsAndLabels(ctx, combinatorialMap, points);
  
    // Display length threshold
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.fillText(`Length Threshold: ${lengthThreshold.toFixed(2)}`, 10, 30);
  
    // Draw points and vertex numbers last
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    points.forEach((point, index) => {
      // Draw point
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
      ctx.fill();
  
      // Draw vertex number with white outline
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.strokeText(index.toString(), point.x, point.y);
      ctx.fillText(index.toString(), point.x, point.y);
    });
  
  }, [points, lambda]);


function drawDartsAndLabels(ctx: CanvasRenderingContext2D, map: CombinatorialMap, points: Vector[]) {
  const arrowSize = 12;
  ctx.font = 'bold 14px Arial'; // Larger, bold font
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  map.darts.forEach((dart, index) => {
    const start = points[dart.origin];
    const end = points[dart.next];
    
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate position 30% along the line
    const labelX = start.x + dx * 0.3;
    const labelY = start.y + dy * 0.3;
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw arrowhead at 30% position
    const angle = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate(labelX, labelY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, -arrowSize / 2);
    ctx.lineTo(-arrowSize, arrowSize / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();
    ctx.restore();
    
    // Draw label
    const offsetX = dy * 8 / length; // Increased perpendicular offset
    const offsetY = -dx * 8 / length;
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Fully opaque text
    ctx.strokeStyle = 'white'; // White outline for better visibility
    ctx.lineWidth = 3;
    ctx.strokeText(index.toString(), labelX + offsetX, labelY + offsetY);
    ctx.fillText(index.toString() + (dart.removed ? 'r' : ''), labelX + offsetX, labelY + offsetY);
  });
}

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