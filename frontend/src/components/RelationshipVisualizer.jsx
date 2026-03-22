import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  Node, 
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

export function RelationshipVisualizer({ tables }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    generateDiagram();
  }, [tables]);

  const generateDiagram = () => {
    if (!tables || tables.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Create nodes for each table
    const nodesList = tables.map((table, idx) => ({
      id: table,
      data: { label: table },
      position: { x: (idx % 3) * 300, y: Math.floor(idx / 3) * 200 },
      style: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        color: '#fff',
        border: '3px solid #1e3a8a',
        borderRadius: '12px',
        padding: '15px 25px',
        fontSize: '13px',
        fontWeight: 'bold',
        minWidth: '180px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'grab'
      }
    }));

    // Create sample edges (relationships)
    // In a real app, you'd fetch actual foreign keys from the database
    const edgesList = [];

    // If multiple tables exist, create a sample relationship
    if (tables.length > 1) {
      edgesList.push({
        id: `${tables[0]}-${tables[1]}`,
        source: tables[0],
        target: tables[1],
        animated: true,
        label: 'has many',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        labelStyle: { background: '#fff', padding: '2px 6px', borderRadius: '4px' }
      });
    }

    setNodes(nodesList);
    setEdges(edgesList);
  };

  if (!tables || tables.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded border shadow flex items-center justify-center">
        <p className="text-gray-500">No tables to visualize</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-white rounded border shadow overflow-hidden">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
