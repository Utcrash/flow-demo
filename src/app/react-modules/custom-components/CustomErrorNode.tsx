import * as React from 'react';
import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface handleProps {
  data: any;
  isConnectable: boolean;
}

export default memo((props: handleProps) => {
  const { data, isConnectable } = props;

  return (
    <>
      <div className="node-type text-truncate">{data.nodeType}</div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={
          data.nodeType === 'ERROR'
            ? { display: 'none', background: '#fff' }
            : { background: '#fff', border: '1px solid rgb(102,102,102, 0.7)' }
        }
      />
      <div className="d-flex">
        <span className={data.icon + ' nodeIcon'}></span>
        <span>{'Global Error'}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="success"
        // style={{ top:5, bottom:'auto', background: '#ccf3e5', border: '1px solid rgb(47,196,143, 0.7)' }}
        isConnectable={isConnectable}
        className="successHandle"
      />
      {data.nodeType !== 'ERROR' && (
        <Handle
          type="source"
          position={Position.Right}
          id="error"
          isConnectable={isConnectable}
          className={data.nodeType === 'ERROR' ? 'errorNode' : 'errorHandle'}
        />
      )}
    </>
  );
});
