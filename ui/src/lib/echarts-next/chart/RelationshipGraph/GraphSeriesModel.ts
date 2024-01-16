/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import * as zrUtil from 'zrender/src/core/util';


import {type VectorArray } from 'zrender/src/core/vector';

import type { EmphasisFocusSymbol, ItemStyleOption, LabelOption, LineStyleOption } from '../../core/view/type';
import type { Merge } from '../../core/utils/type'
import {ComponentModel} from '../../core/model/ComponentModel';
import type { ForceLayoutEngine } from './forceLayout';
import SeriesModel from '../../core/model/SeriesModel';





export type StateOption = {
    emphasis?: {
        focus?: EmphasisFocusSymbol | 'adjacency'
    }
}

export type GraphItemStyleOption=ItemStyleOption
export type GraphNodeOption<GraphNodeData = any> = {
    id?: string
    name?: string
    value?: GraphNodeData
    itemStyle?: ItemStyleOption
    label?: LabelOption
    /**
     * Fixed x position
     */
    x?: number
    /**
     * Fixed y position
     */
    y?: number

    /**
     * If this node is fixed during force layout.
     */
    fixed?: boolean

    /**
     * Index or name of category
     */
    category?: number | string

    draggable?: boolean
    cursor?: string
} & StateOption


export type GraphLineStyleOption=Merge<LineStyleOption, {
    curveness?: number
}>
export type GraphEdgeOption = {

    value?: number

    /**
     * Symbol of both line ends
     */
    symbol?: string | string[]

    symbolSize?: number | number[]

    ignoreForceLayout?: boolean

    lineStyle?:GraphLineStyleOption
    label?: LabelOption
}&StateOption



export type GraphSeriesOption = {

    type?: 'graph'

    coordinateSystem?: string

    legendHoverLink?: boolean

    layout?: 'none' | 'force' //| 'circular'

    nodes?: GraphNodeOption[]

    edges?: GraphEdgeOption[]


    //categories?: GraphCategoryItemOption[]

    /**
     * Symbol size scale ratio in roam
     */
    nodeScaleRatio?: 0.6,

    draggable?: boolean

    edgeSymbol?: string | string[]
    edgeSymbolSize?: number | number[]

    edgeLabel?: LabelOption
    label?: LabelOption

    itemStyle?: GraphItemStyleOption
    lineStyle?: GraphLineStyleOption

    emphasis?: {
        focus?: EmphasisFocusSymbol | 'adjacency'//TODO NodeOption类型和本类型的统一表示
        scale?: boolean | number
        label?: LabelOption
        edgeLabel?: LabelOption
        itemStyle?: ItemStyleOption
        lineStyle?: LineStyleOption
    }

    blur?: {
        label?: LabelOption
        edgeLabel?: LabelOption
        itemStyle?: ItemStyleOption
        lineStyle?: LineStyleOption
    }

    select?: {
        label?: LabelOption
        edgeLabel?: LabelOption
        itemStyle?: ItemStyleOption
        lineStyle?: LineStyleOption
    }

    // Configuration of circular layout
    circular?: {
        rotateLabel?: boolean
    }

    // Configuration of force directed layout
    force?: {
        initLayout?: 'circular' | 'none'
        // Node repulsion. Can be an array to represent range.
        repulsion?: number | number[]
        gravity?: number
        // Initial friction
        friction?: number

        // Edge length. Can be an array to represent range.
        edgeLength?: number | number[]

        layoutAnimation?: boolean
    }

    /**
     * auto curveness for multiple edge, invalid when `lineStyle.curveness` is set
     */
    autoCurveness?: boolean | number | number[]
}

class GraphSeriesModel extends SeriesModel{
    static readonly type = 'series.graph';
    readonly type = GraphSeriesModel.type;


    forceLayoutEngine?: ForceLayoutEngine;

    init(option: GraphSeriesOption) {
        super.init.apply(this, arguments as any);
        //TODO category
    }

    mergeOption(option: GraphSeriesOption) {
        super.mergeOption.apply(this, arguments as any);

        //this.fillDataTextStyle(option.edges || option.links);

        //this._updateCategoriesData();
    }

    mergeDefaultAndTheme(option: GraphSeriesOption) {
        super.mergeDefaultAndTheme.apply(this, arguments as any);
        defaultEmphasis(option, 'edgeLabel', ['show']);
    }

    getInitialData(option: GraphSeriesOption, ecModel: GlobalModel): SeriesData {
        const edges = option.edges || option.links || [];
        const nodes = option.data || option.nodes || [];
        const self = this;

        if (nodes && edges) {
            // auto curveness
            initCurvenessList(this);
            const graph = createGraphFromNodeEdge(nodes as GraphNodeItemOption[], edges, this, true, beforeLink);
            zrUtil.each(graph.edges, function (edge) {
                createEdgeMapForCurveness(edge.node1, edge.node2, this, edge.dataIndex);
            }, this);
            return graph.data;
        }

        function beforeLink(nodeData: SeriesData, edgeData: SeriesData) {
            // Overwrite nodeData.getItemModel to
            nodeData.wrapMethod('getItemModel', function (model) {
                const categoriesModels = self._categoriesModels;
                const categoryIdx = model.getShallow('category');
                const categoryModel = categoriesModels[categoryIdx];
                if (categoryModel) {
                    categoryModel.parentModel = model.parentModel;
                    model.parentModel = categoryModel;
                }
                return model;
            });

            // TODO Inherit resolveParentPath by default in Model#getModel?
            const oldGetModel = Model.prototype.getModel;
            function newGetModel(this: Model, path: any, parentModel?: Model) {
                const model = oldGetModel.call(this, path, parentModel);
                model.resolveParentPath = resolveParentPath;
                return model;
            }

            edgeData.wrapMethod('getItemModel', function (model: Model) {
                model.resolveParentPath = resolveParentPath;
                model.getModel = newGetModel;
                return model;
            });

            function resolveParentPath(this: Model, pathArr: readonly string[]): string[] {
                if (pathArr && (pathArr[0] === 'label' || pathArr[1] === 'label')) {
                    const newPathArr = pathArr.slice();
                    if (pathArr[0] === 'label') {
                        newPathArr[0] = 'edgeLabel';
                    }
                    else if (pathArr[1] === 'label') {
                        newPathArr[1] = 'edgeLabel';
                    }
                    return newPathArr;
                }
                return pathArr as string[];
            }
        }
    }

    getGraph(): Graph {
        return this.getData().graph;
    }

    getEdgeData() {
        return this.getGraph().edgeData as SeriesData<GraphSeriesModel, LineDataVisual>;
    }

    setZoom(zoom: number) {
        this.option.zoom = zoom;
    }

    setCenter(center: number[]) {
        this.option.center = center;
    }

    isAnimationEnabled() {
        return super.isAnimationEnabled()
            // Not enable animation when do force layout
            && !(this.get('layout') === 'force' && this.get(['force', 'layoutAnimation']));
    }

    static defaultOption: GraphSeriesOption = {
        // zlevel: 0,
        z: 2,

        coordinateSystem: 'view',

        // Default option for all coordinate systems
        // xAxisIndex: 0,
        // yAxisIndex: 0,
        // polarIndex: 0,
        // geoIndex: 0,

        legendHoverLink: true,

        layout: 'none',

        // Configuration of circular layout
        circular: {
            rotateLabel: false
        },
        // Configuration of force directed layout
        force: {
            initLayout: 'none',
            // Node repulsion. Can be an array to represent range.
            repulsion: [0, 50],
            gravity: 0.1,
            // Initial friction
            friction: 0.6,

            // Edge length. Can be an array to represent range.
            edgeLength: 30,

            layoutAnimation: true
        },

        left: 'center',
        top: 'center',
        // right: null,
        // bottom: null,
        // width: '80%',
        // height: '80%',

        symbol: 'circle',
        symbolSize: 10,

        edgeSymbol: ['none', 'none'],
        edgeSymbolSize: 10,
        edgeLabel: {
            position: 'inside',
            distance: 5
        },

        draggable: false,

        roam: false,

        // Default on center of graph
        center: null,

        zoom: 1,
        // Symbol size scale ratio in roam
        nodeScaleRatio: 0.6,

        // cursor: null,

        // categories: [],

        // data: []
        // Or
        // nodes: []
        //
        // links: []
        // Or
        // edges: []

        label: {
            show: false,
        },

        itemStyle: {},

        lineStyle: {
            color: '#aaa000',
            width: 1,
            opacity: 0.5
        },
        emphasis: {
            scale: true,
            label: {
                show: true
            }
        },

        select: {
            itemStyle: {
                borderColor: '#212121'
            }
        }
    };
}

export default GraphSeriesModel;
