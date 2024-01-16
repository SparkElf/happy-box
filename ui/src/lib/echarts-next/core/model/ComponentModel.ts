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

//option就是这个component的状态，我们要做的是把解析option，把不同组件的option分发到对应的组件进行处理
export class ComponentModel<Opt=any> {
    //TODO 更具体的类型
    type: string;
    option: Opt;
    view:any
    id: string;

    /**
     * Because simplified concept is probably better, series.name (or component.name)
     * has been having too many responsibilities:
     * (1) Generating id (which requires name in option should not be modified).
     * (2) As an index to mapping series when merging option or calling API (a name
     * can refer to more than one component, which is convenient is some cases).
     * (3) Display.
     * @readOnly But injected
     */
     name: string;

    /**
     * @readOnly
     */
     mainType: string;

    /**
     * @readOnly
     */
     subType: string;

    /**
     * @readOnly
     */
     componentIndex: number;

    /**
     * @readOnly
     */
    protected  defaultOption: ComponentOption;

    /**
     * @readOnly
     */
     ecModel: GlobalModel;

    /**
     * @readOnly
     */
    static dependencies: string[];


    // uid: string;

    // // No common coordinateSystem needed. Each sub class implement
    // // `CoordinateSystemHostModel` itself.
    // coordinateSystem: CoordinateSystemMaster | CoordinateSystemExecutive;

    /**
     * Support merge layout params.
     * Only support 'box' now (left/right/top/bottom/width/height).
     */
    static layoutMode: ComponentLayoutMode | ComponentLayoutMode['type'];

    /**
     * Prevent from auto set z, zlevel, z2 by the framework.
     */
    preventAutoZ: boolean;


    constructor(option: Opt, parentModel: Model, ecModel: GlobalModel) {
        this.option = option;
        //this.uid = componentUtil.getUID('ec_cpt_model');
    }

    init(option: Opt, parentModel: Model, ecModel: GlobalModel): void {
        const layoutMode = layout.fetchLayoutMode(this);
        const inputPositionParams = layoutMode
            ? layout.getLayoutParams(option as BoxLayoutOptionMixin) : {};

        const themeModel = ecModel.getTheme();
        zrUtil.merge(option, themeModel.get(this.mainType));
        zrUtil.merge(option, this.getDefaultOption());

        if (layoutMode) {
            layout.mergeLayoutParam(option as BoxLayoutOptionMixin, inputPositionParams, layoutMode);
        }
    }

    mergeOption(option: Opt, ecModel: GlobalModel): void {
        zrUtil.merge(this.option, option, true);

        const layoutMode = layout.fetchLayoutMode(this);
        if (layoutMode) {
            layout.mergeLayoutParam(
                this.option as BoxLayoutOptionMixin,
                option as BoxLayoutOptionMixin,
                layoutMode
            );
        }
    }

}

