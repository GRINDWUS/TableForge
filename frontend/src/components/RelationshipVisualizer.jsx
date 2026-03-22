import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

function VisualizerContent({ tables }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getNodes, getEdges } = useReactFlow();

  useEffect(() => {
    generateDiagram();
  }, [tables]);

  const generateDiagram = () => {
    if (!tables || tables.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const nodesList = tables.map((table, idx) => ({
      id: table,
      data: { label: (
        <div className="flex flex-col items-center">
          <div className="text-[10px] opacity-70 uppercase mb-1">TABLE</div>
          <div className="text-sm font-black">{table}</div>
        </div>
      ) },
      position: { x: (idx % 3) * 350, y: Math.floor(idx / 3) * 200 },
      style: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: '#fff',
        border: '3px solid #1e40af',
        borderRadius: '12px',
        padding: '15px',
        width: 180,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      }
    }));

    const edgesList = [];
    if (tables.length > 1) {
      for (let i = 0; i < tables.length - 1; i++) {
        edgesList.push({
          id: `e-${tables[i]}-${tables[i+1]}`,
          source: tables[i],
          target: tables[i+1],
          animated: true,
          label: 'relates to',
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          labelStyle: { fill: '#1d4ed8', fontWeight: 700, fontSize: 10 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9, rx: 4 },
        });
      }
    }

    setNodes(nodesList);
    setEdges(edgesList);
  };

  const onDownload = () => {
    const element = document.querySelector('.react-flow__viewport');
    if (!element) return;

    toPng(element, {
      backgroundColor: '#f8fafc',
      width: 1200,
      height: 800,
      style: {
        transform: 'scale(1)',
      }
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `tableforge-er-diagram-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <div className="relative w-full h-[500px] bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={onDownload}
          className="px-4 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          📥 Export PNG
        </button>
        <button 
          onClick={generateDiagram}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          🔄 Relayout
        </button>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeColor="#3b82f6" 
          maskColor="rgba(241, 245, 249, 0.7)"
          style={{ borderRadius: 8, overflow: 'hidden', border: '2px solid #e2e8f0' }}
        />
      </ReactFlow>

      <div className="absolute bottom-4 right-4 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
        TableForge ER Engine v2.0
      </div>
    </div>
  );
}

export function RelationshipVisualizer(props) {
  return (
    <ReactFlowProvider>
      <VisualizerContent {...props} />
    </ReactFlowProvider>
  );
}
