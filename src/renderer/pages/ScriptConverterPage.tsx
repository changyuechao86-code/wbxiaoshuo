import React from 'react';
import { Movie as MovieIcon } from '@mui/icons-material';
import { EmptyState } from '../components/common/EmptyState';

const text = {
  title: '\u5c0f\u8bf4\u8f6c\u5267\u672c',
  comingSoon: '\u5c0f\u8bf4\u8f6c\u5267\u672c\u6b63\u5728\u6253\u78e8\u4e2d',
  description:
    '\u540e\u7eed\u4f1a\u5c06\u7ae0\u8282\u5185\u5bb9\u8f6c\u4e3a\u573a\u666f\u3001\u5bf9\u767d\u548c\u52a8\u4f5c\u63cf\u5199\uff0c\u5e76\u652f\u6301\u5bfc\u51fa\u5267\u672c\u521d\u7a3f\u3002',
  backToEditor: '\u5148\u56de\u5230\u7f16\u8f91\u5668',
};

export function ScriptConverterPage(): React.ReactElement {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <MovieIcon fontSize="small" sx={{ color: '#22d3ee' }} />
        <h2 className="text-sm font-semibold text-[#cdd6f4]">{text.title}</h2>
      </div>
      <div className="flex-1">
        <EmptyState
          icon={<MovieIcon fontSize="large" />}
          title={text.comingSoon}
          description={text.description}
          actionLabel={text.backToEditor}
          onAction={() => window.history.back()}
        />
      </div>
    </div>
  );
}
