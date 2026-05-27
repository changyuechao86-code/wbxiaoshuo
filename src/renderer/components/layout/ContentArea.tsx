/**
 * 主内容区容器
 */
import React, { type ReactNode } from 'react';

interface ContentAreaProps {
  children: ReactNode;
}

export function ContentArea({ children }: ContentAreaProps): React.ReactElement {
  return (
    <main className="main-content relative">
      {children}
    </main>
  );
}
