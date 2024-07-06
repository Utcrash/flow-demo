import * as React from "react";
import { memo } from "react";
import { Handle, Position } from "reactflow";

interface handleProps {
  data: any;
  isConnectable: boolean;
}

export default memo((props: handleProps) => {
  const { data, isConnectable } = props;
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          background: "#fff",
          border: "0.5px solid rgb(102,102,102, 0.7)",
        }}
      />

      <div className="d-flex align-items-center w-100 mt-1">
        <span className={"fa fa-cube nodeIcon"}></span>
        <span className="text-truncate" style={{ fontSize: "6px" }}>
          {data.label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="success"
        isConnectable={isConnectable}
        className="newSuccessHandle"
      />
    </>
  );
});
