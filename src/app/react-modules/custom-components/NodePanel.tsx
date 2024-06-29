import * as React from "react";
import { useState } from "react";
import ReactFlow, { useReactFlow } from "reactflow";

export interface menuProps {
  services?: any;
  edit?: any;
  nodeList: Array<any>;
  nodes: Array<any>;
  addNodeOnClick?: (event) => void;
}

const onDragStart = (event, nodeType, item) => {
  event.dataTransfer.setData(
    "application/reactflow",
    JSON.stringify({
      nodeType,
      item,
    })
  );
  event.dataTransfer.effectAllowed = "move";
  event.target.innerHtml = `
  <div>
        <span class="font-13 fw-400">{item.name}</span>
      </div>
  `;
};

const NodePanel = ({
  nodeOptions,
  nodeList,
  addNodeOnClick,
  dataPipeService,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodeOptions = (query) => {
    setSearchQuery(query);
    const filter = {
      category: "PROCESS",
      label: "/" + query + "/",
    };

    setTimeout(dataPipeService.getAvailableNodes({ filter }), 500);
  };

  return (
    <div className="available-node-list h-100 bg-white">
      <div className="p-3 border-bottom">
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => filteredNodeOptions(e.target.value)}
        />
      </div>
      <div className="list-wrapper">
        <div className="list-group m-3">
          {nodeOptions.map((item, index) => (
            <div
              key={index}
              className=" list-group-item list-group-item-action px-3 py-2 d-flex flex-align-center"
              onDragStart={(event) => onDragStart(event, "default", item)}
            >
              <span className={`handle mr-2 ${item.icon}`}></span>
              <span className="text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function NodePanelComponent(props: menuProps) {
  const { services, nodeList, nodes, addNodeOnClick } = props;

  const nodeOptions = nodes || services.flowService.getNodeOptions();
  return (
    <NodePanel
      nodeOptions={nodeOptions}
      nodeList={nodeList}
      addNodeOnClick={addNodeOnClick}
      dataPipeService={services.dataPipeService}
    />
  );
}
