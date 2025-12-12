import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SkillNode } from '../types';

interface CognitiveGraphProps {
  data: SkillNode[];
}

const CognitiveGraph: React.FC<CognitiveGraphProps> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-[#09090b] rounded-xl p-4 border border-zinc-900">
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">
        Skill Matrix
      </h3>
      <div className="w-full h-full pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Current Level"
              dataKey="score"
              stroke="#f4f4f5" 
              strokeWidth={1.5}
              fill="#f4f4f5"
              fillOpacity={0.1}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CognitiveGraph;
