import * as React from "react";
import { memo } from "react";
import { Handle, Position } from "reactflow";

interface handleProps {
  data: any;
  isConnectable: boolean;
}

export default memo((props: handleProps) => {
  const { data, isConnectable } = props;
  const className = data.nodeType! !== "V1_GLOBAL_ERROR";
  return (
    <>
      <Handle
        type="source"
        position={Position.Top}
        isConnectable={false}
        style={
          data.hasErrors
            ? { background: "transparent", left: "55px", border: "none" }
            : { display: "none", background: "#fff" }
        }
      >
        <span className="text-danger nodeIcon"></span>
      </Handle>
      <div className="d-flex align-items-center w-100 mt-1">
        <span className={data.icon + " nodeIcon"}></span>
        <span className="text-truncate">{data.label}</span>
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
