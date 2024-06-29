import { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  ReactFlowProvider,
  ConnectionLineType,
  ReactFlowProps,
  MarkerType,
  DefaultEdgeOptions,
  useReactFlow,
} from "reactflow";
import * as React from "react";
import * as _ from "lodash";

import NodePanelComponent from "./custom-components/NodePanel";
import NewCustomNode from "./custom-components/NewCustomNode";
import CustomErrorNode from "./custom-components/CustomErrorNode";
import ConnectionLine from "./custom-components/ConnectionLine";

export interface FlowProps {
  nodeList?: Array<any>;
  services?: any;
  addNode?: (event) => void;
  changeNodeList?: (event) => void;
  openProperty?: (event) => void;
  showNodes?: boolean;
  errorList?: Array<any>;
  openPath?: (event) => void;
  onChange?: (event) => void;
  availableNodes: Array<any>;
  propertiesBlockVisibilityFn?: (show: boolean) => void;
  onCanvasClick?: (event) => void;
}

const nodeTypes = {
  customErrorNode: CustomErrorNode,
  customNewNode: NewCustomNode,
};

export function ReactFlowBase(props: FlowProps) {
  const {
    nodeList,
    services,
    addNode,
    changeNodeList,
    openProperty,
    showNodes,
    errorList,
    openPath,
    onChange,
    availableNodes,
    propertiesBlockVisibilityFn,
    onCanvasClick,
  } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const { getIntersectingNodes } = useReactFlow();

  const reactFlowWrapper = React.useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);
  const isInputNode = (node) => {
    return nodeList[0]._id == node._id;
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const data = JSON.parse(
        event.dataTransfer.getData("application/reactflow")
      );
      // console.log(data);
      const type = data.nodeType;
      const item = data.item;
      if (typeof type === "undefined" || !type) {
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode({ position, item });
    },
    [reactFlowInstance]
  );

  const addNodeOnClick = (event) => {
    const { position, type, item } = event;
    if (typeof type === "undefined" || !type) {
      return;
    }

    const newPosition = {
      x: position.x + 40,
      y: position.y + 40,
    };
    addNode({ position: newPosition, item });
  };

  const removeNodeById = (list, id) => {
    return list.filter((item) => item._id !== id);
  };

  const onNodesDelete = (event) => {
    const id = event[0]?.id;
    if (id) {
      const list = removeNodeById(nodeList, id);
      list.forEach((entity) => {
        if (entity.onSuccess) {
          entity.onSuccess = removeNodeById(entity.onSuccess, id);
        }
        if (entity.onError) {
          entity.onError = removeNodeById(entity.onError, id);
        }
      });
      changeNodeList(list);
    }
  };

  const onEdgesDelete = (event) => {
    event.forEach((e) => {
      const source = e?.source;
      const target = e?.target;
      if (source && target) {
        if (nodeList.find((node) => node._id === target)) {
          // console.log('Deleting edge');
          const node = nodeList.find((node) => node._id === source);
          services["dataPipeService"].removeMappings(node);
          if (e.sourceHandle === "error") {
            node["onError"] = removeNodeById(node["onError"] || [], target);
          } else if (e.sourceHandle === "success") {
            node["onSuccess"] = removeNodeById(node["onSuccess"], target);
          }
        } else {
          const newEdges = edges.filter((edge) => edge.id === e.id);
          setEdges(newEdges);
        }
      }
    });

    onChange(event);
    updateEdges();
  };

  const updateEdges = () => {
    const edges = [];

    nodeList.forEach((entity) => {
      if (entity.onSuccess && entity.onSuccess.length > 0) {
        entity.onSuccess.forEach((success) => {
          if (entity._id === success._id) {
            return;
          }
          edges.push({
            id: `${entity._id}->${success._id}-s`,
            type: ConnectionLineType.SmoothStep,
            source: entity._id,
            target: success._id,
            sourceHandle: "success",
            label: success.name || "",
            data: { ...success, pathType: "success" },
            style: success["color"] ? { stroke: `#${success.color}` } : {},
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: success["color"] ? `#${success.color}` : "#666",
            },
          });
        });
      }
      if (entity.onError && entity.onError.length > 0) {
        entity.onError.forEach((error) => {
          if (entity._id === error._id) {
            return;
          }
          edges.push({
            id: `${entity._id}->${error._id}-e`,
            type: ConnectionLineType.SmoothStep,
            source: entity._id,
            target: error._id,
            sourceHandle: "success",
            label: error.name || "",
            data: { ...error, pathType: "error" },
            style: { stroke: "#F44336" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#F44336",
            },
          });
        });
      }
    });

    setEdges(edges);
    // services.flowService.selectedPath.emit(null)
  };

  const nodeChange = (currentEdges) => {
    currentEdges.forEach((edge) => {
      const node = nodeList.find((n) => n._id === edge.source);
      const obj = {
        index: 0,
        name: edge.label || "",
        condition: edge.data?.condition || "",
        _id: edge.target,
        color: edge?.style?.stroke || "",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge?.style?.stroke || "#666",
        },
      };
      if (edge.sourceHandle === "success" || edge.sourceHandle === "error") {
        const element = edge.sourceHandle === "error" ? "onError" : "onSuccess";
        const sourceArray = node[element] || [];
        if (!sourceArray.some((ele) => ele._id === edge.target)) {
          node[element] =
            edge.sourceHandle === "error"
              ? [{ _id: obj._id }]
              : addIndextoSuccess(sourceArray, obj);
        }
      }
    });
    setEdges(currentEdges);
    // changeNodeList(nodeList)
  };

  const addIndextoSuccess = (paths, toAdd) => {
    // const newPath = paths.length;
    // toAdd['index'] = paths.length;
    return [...paths, { _id: toAdd._id }];
  };

  const onConnect = (event) => {
    const type = event.sourceHandle?.charAt(0);
    event["id"] = `${event.source}->${event.target}-${type}`;
    event["type"] = ConnectionLineType.SmoothStep;
    if (edges.find((edge) => edge.id === event.id)) {
      return;
    }
    const currentEdges = [...edges, event];
    nodeChange(currentEdges);
  };

  const openProperties = (event, node) => {
    openProperty(node.id);
  };

  const onNodeDragStop = (event, node) => {
    nodeList.find((e) => e._id == node.id).coordinates = node.position;
    openProperties(event, node);
  };

  const openEdges = (event, edge) => {
    openPath(edge);
  };

  const onNodeDrag = (_, node) => {
    const intersections = getIntersectingNodes(node).map((n) => n.id);
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        className: intersections.includes(n.id) ? "highlight" : "",
      }))
    );
  };

  const onPaneClick = () => {
    onCanvasClick(false);
  };

  const nodeListString = JSON.stringify(nodeList);
  const errorListString = JSON.stringify(errorList);

  const defaultEdgeProps: DefaultEdgeOptions = {
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };
  const reactFlowProps: ReactFlowProps = {
    nodes,
    edges,
    edgesUpdatable: true,
    edgesFocusable: true,
    nodesDraggable: true,
    nodesConnectable: true,
    elementsSelectable: true,
    fitView: true,
    onNodesChange: onNodesChange,
    onConnect: onConnect,
    onDrop: onDrop,
    onDragOver: onDragOver,
    onInit: setReactFlowInstance,
    onNodesDelete: onNodesDelete,
    onEdgesDelete: onEdgesDelete,
    onNodeClick: openProperties,
    onNodeDrag: onNodeDrag,
    nodeTypes: nodeTypes,
    onEdgeClick: openEdges,
    onNodeDragStop: onNodeDragStop,
    onPaneClick: onPaneClick,
    // connectionLineType: ConnectionLineType.SmoothStep,
    proOptions: { hideAttribution: true },
    connectionLineComponent: ConnectionLine,
    defaultEdgeOptions: defaultEdgeProps,
  };

  const changeNode = (intersections?) => {
    const iconList = [];
    return nodeList.map((node) => {
      const iconObj =
        iconList.find((e) => {
          if (e.subType) {
            if (node.type === "CONNECTOR") {
              return e.subType === node.options.connectorType;
            } else {
              return false;
            }
          } else {
            return (
              node.type?.startsWith(e.nodeType) &&
              (e.isInput ? isInputNode(node) === e.isInput : true)
            );
          }
        }) || {};
      if (node.type && !node.nodeType) {
        node.nodeType =
          node.type === "ERROR" ? "customErrorNode" : "customNewNode";
      }

      const hasErrors =
        errorList.find((e) => e._id == node._id)?.errors?.length > 0;
      if (hasErrors) {
        node.nodeType = "customErrorNode";
      }
      return {
        id: node._id,
        type: node.type === "ERROR" ? "customErrorNode" : "customNewNode",
        position: { x: node.coordinates.x, y: node.coordinates.y },
        data: {
          label: _.truncate(node.name, { length: 15 }),
          type: node.nodeType,
          icon: node.icon || iconObj.icon,
          nodeType: node.type,
          hasErrors,
          isInputNode: isInputNode(node),
        },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        // className: intersections.includes(node._id) ? 'highlight' : ''
      };
    });
  };

  const clickHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    propertiesBlockVisibilityFn(
      !!target.closest(".react-flow__edge") ||
        !!target.closest(".react-flow__node-customNode")
    );
  };

  useEffect(() => {
    setEdges([]);
    const allNodes = changeNode();
    updateEdges();
    setNodes(allNodes);
  }, [nodeListString, errorListString]);

  return (
    <div className="d-flex">
      <NodePanelComponent
        services={services}
        nodeList={nodeList}
        nodes={availableNodes}
        addNodeOnClick={(e) => addNodeOnClick(e)}
      />
      <div
        id="reactflow-wrapper"
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{
          width: "calc(100vw - 240px)",
          height: "100vh",
        }}
      >
        <ReactFlow {...reactFlowProps}>
          <div>
            <Controls
              showInteractive={false}
              position="bottom-right"
              style={{ left: "35rem", display: "flex", boxShadow: "none" }}
            />
            <MiniMap zoomable pannable style={{ width: "150", height: "80" }} />
          </div>
          <Background gap={12} size={1} style={{ opacity: "0.7" }} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function ReactFlowComponent(props: FlowProps) {
  return (
    <div>
      <ReactFlowProvider>
        <ReactFlowBase {...props}></ReactFlowBase>
      </ReactFlowProvider>
    </div>
  );
}
