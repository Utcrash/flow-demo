import {
  Component,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import ReactFlowComponent from "./ReactFlowComponent";

const containerElementRef = "customReactComponentContainer";
@Component({
  selector: "react-flow",
  template: `<div id="react-root"></div>`,
  styleUrls: ["./reactflow.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ReactWrapper
  implements OnChanges, OnDestroy, AfterViewInit, OnInit
{
  @ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;
  onAddNode: EventEmitter<any> = new EventEmitter();
  changeNodeList: EventEmitter<any> = new EventEmitter();
  openNodeProperty: EventEmitter<any> = new EventEmitter();
  onPropertiesBlockToggle: EventEmitter<any> = new EventEmitter();
  onCanvasClick: EventEmitter<any> = new EventEmitter();
  nodeList: Array<any> = [];
  flowData: any = {};
  showNodes: boolean = false;
  newNodes: boolean = false;
  nodes: Array<any> = [];
  services: any = {};
  root: any;
  constructor() {}

  ngOnInit(): void {
    this.nodes = [
      {
        _id: "Node1",
        type: "Test",
        label: "Node1",
        name: "Node1",
      },
      {
        _id: "Node2",
        type: "Test",
        label: "Node2",
        name: "Node2",
      },
      {
        _id: "Node3",
        type: "Test",
        label: "Node3",
        name: "Node3",
      },
    ];
  }

  addNode(event) {
    if (this.onAddNode) {
      const node = event.item;
      node["coordinates"] = event.position;
      node["_id"] = node["_id"] + this.nodeList.length;
      this.nodeList.push(node);
      this.render();
    }
  }

  isInputNode(node) {
    if (this.flowData && node) {
      return this.flowData.inputNode._id == node._id;
    }
    return true;
    // return this.nodeList[0]._id == this.currNode._id;
  }

  reRender(nodeList) {
    this.nodeList = nodeList;
    // this.changeNodeList.emit(nodeList);
    this.render();
  }

  openProperty(nodeId) {
    // const currNode = this.nodeList.find((e) => e._id == nodeId);
    // const prevNode = this.nodeList.find((e: any) =>
    //   (e.onSuccess || []).find((ei) => ei._id == nodeId)
    // );
    // if (!this.newNodes) {
    //   this.flowService.selectedNode.emit({
    //     currNode: currNode,
    //     prevNode: prevNode,
    //   });
    // } else {
    //   this.dataPipeService.selectedNode.emit({
    //     currNode: currNode,
    //     prevNode: prevNode,
    //   });
    // }
  }

  openEdgeProperty(edge: any) {}

  convertToPath(edge, data) {
    // this.flowService.selectedNode.emit(null);
    // const path = edge.data;
    // path["type"] = edge.data.pathType || edge.sourceHandle;
    // const prevNode = this.nodeList.find((e) => e._id == edge.source)._id;
    // path["prevNode"] = prevNode;
    // return path;
  }

  checkPaths() {
    // this.nodeList.forEach((node) => {
    //   node.onSuccess.forEach((success, index) => {
    //     if (!success.path) {
    //       success.path = [];
    //     } else {
    //       success.index = index;
    //     }
    //   });
    // });
  }

  propertiesBlockVisibilityFn(show: boolean) {
    this.onPropertiesBlockToggle?.emit(show);
  }

  changeHandler(event) {}

  ngOnChanges(changes: SimpleChanges): void {
    // this.checkPaths();
    this.reRender(this.nodeList);
  }

  ngAfterViewInit() {
    this.root = createRoot(document.getElementById("react-root"));
    this.render();
  }

  ngOnDestroy() {
    this.root.unmount();
  }

  clickCanvas(event) {
    this.onCanvasClick.emit();
  }
  private render() {
    const errorList = this.nodeList.map((node) => {
      return {
        _id: node._id,
      };
    });

    if (this.root) {
      this.root.render(
        <React.StrictMode>
          <div>
            <ReactFlowComponent
              showNodes={this.showNodes}
              addNode={(e) => this.addNode(e)}
              nodeList={this.nodeList}
              services={this.services}
              changeNodeList={(e) => this.reRender(e)}
              openProperty={(e) => this.openProperty(e)}
              openPath={(e) => this.openEdgeProperty(e)}
              errorList={errorList}
              onChange={(e) => this.changeHandler(e)}
              availableNodes={this.nodes}
              propertiesBlockVisibilityFn={(show: boolean) =>
                this.propertiesBlockVisibilityFn(show)
              }
              onCanvasClick={(e) => this.clickCanvas(e)}
            />
          </div>
        </React.StrictMode>
      );
    }
  }
}
